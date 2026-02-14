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

        io.on("connection", (socket: any) => {
            console.log("Socket connected:", socket.id);

            socket.on("join-poll", (pollId: string) => {
                socket.join(pollId);
                // console.log(`Socket ${socket.id} joined poll ${pollId}`);
            });

            socket.on("leave-poll", (pollId: string) => {
                socket.leave(pollId);
            });

            // When a vote is cast, we re-fetch the poll options and broadcast
            socket.on("vote-cast", async ({ pollId }: { pollId: string }) => {
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

                        // Broadcast to everyone in the room
                        io.to(pollId).emit("poll-update", fullPoll);
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
