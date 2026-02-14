import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIo } from "@/types/types";
import { supabase } from "@/lib/supabase";

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
    if (!res.socket.server.io) {
        const path = "/api/socket/io";
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false,
        });
        res.socket.server.io = io;

        // Track presence per room
        // In-memory store: Map<pollId, Set<socketId>>
        const roomPresence = (global as any).roomPresence || new Map<string, Set<string>>();
        (global as any).roomPresence = roomPresence;

        const updatePresence = (pollId: string) => {
            const room = roomPresence.get(pollId);
            const count = room ? room.size : 0;
            io.to(pollId).emit("presence-update", count);
        };

        io.on("connection", (socket: any) => {
            console.log("Socket connected:", socket.id);

            socket.on("join-poll", (pollId: string) => {
                socket.join(pollId);

                if (!roomPresence.has(pollId)) {
                    roomPresence.set(pollId, new Set());
                }
                roomPresence.get(pollId).add(socket.id);

                // Save pollId on socket for disconnect handling
                socket.pollId = pollId;

                updatePresence(pollId);
            });

            socket.on("leave-poll", (pollId: string) => {
                socket.leave(pollId);
                if (roomPresence.has(pollId)) {
                    roomPresence.get(pollId).delete(socket.id);
                    updatePresence(pollId);
                }
            });

            socket.on("disconnect", () => {
                const pollId = socket.pollId;
                if (pollId && roomPresence.has(pollId)) {
                    roomPresence.get(pollId).delete(socket.id);
                    updatePresence(pollId);
                }
            });

            // When a vote is cast, we re-fetch the poll options and broadcast
            socket.on("vote-cast", async ({ pollId, optionText }: { pollId: string, optionText?: string }) => {
                try {
                    // Re-fetch data
                    const { data: poll, error: pollError } = await supabase
                        .from('polls')
                        .select('id, question, created_at, slug')
                        .eq('id', pollId)
                        .single();

                    if (poll) {
                        const { data: options } = await supabase
                            .from('poll_options')
                            .select('id, option_text, vote_count, position')
                            .eq('poll_id', poll.id)
                            .order('position', { ascending: true });

                        const fullPoll = {
                            ...poll,
                            options: options || []
                        };

                        // Broadcast update
                        io.to(pollId).emit("poll-update", fullPoll);

                        // Broadcast new activity (Anonymous)
                        if (optionText) {
                            io.to(pollId).emit("new-activity", {
                                type: "vote",
                                text: `Someone voted for ${optionText}`,
                                timestamp: Date.now(),
                                color: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD"][Math.floor(Math.random() * 5)]
                            });
                        }
                    }
                } catch (err) {
                    console.error("Socket error processing vote-cast:", err);
                }
            });
        });
    }
    res.end();
};

export default ioHandler;
