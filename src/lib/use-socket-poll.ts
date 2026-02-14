import { useEffect, useState } from 'react';
import { useSocket } from '@/components/providers/socket-provider';

interface PollOption {
    id: string;
    option_text: string;
    vote_count: number;
    position: number;
    percentage?: number;
}

interface Poll {
    id: string;
    question: string;
    created_at: string;
    slug: string;
    options: PollOption[];
}

export const useSocketPoll = (initialPoll: Poll) => {
    const { socket, isConnected } = useSocket();
    const [poll, setPoll] = useState<Poll>(initialPoll);

    useEffect(() => {
        if (!socket || !poll.id) return;

        // Join the poll room
        socket.emit("join-poll", poll.id);

        // Listen for updates
        socket.on("poll-update", (updatedPoll: Poll) => {
            if (updatedPoll.id === poll.id) {
                setPoll(updatedPoll);
            }
        });

        // Re-fetch on reconnect or visibility change
        const refreshPoll = async () => {
            try {
                const res = await fetch(`/api/polls/${poll.slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setPoll(data);
                }
            } catch (e) {
                console.error("Failed to refresh poll", e);
            }
        };

        socket.on("connect", refreshPoll);

        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                refreshPoll();
                socket.connect(); // Ensure socket reconnects if it was disconnected
            }
        };

        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            socket.off("poll-update");
            socket.off("connect", refreshPoll);
            socket.emit("leave-poll", poll.id);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [socket, poll.id, poll.slug]);

    return { poll, setPoll, isConnected };
};
