import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Define strict types for our data
interface PollOption {
    id: string;
    option_text: string;
    vote_count: number;
    position: number;
    poll_id: string;
    percentage?: number;
}

interface Poll {
    id: string;
    question: string;
    created_at: string;
    slug: string;
    options: PollOption[];
    expires_at?: string | null;
    scheduled_for?: string | null;
}

export interface ActivityItem {
    id: string;
    type: "vote" | "join";
    text: string;
    timestamp: number;
    color: string;
}

export const useRealtimePoll = (initialPoll: Poll) => {
    const [poll, setPoll] = useState<Poll>(initialPoll);
    const [presenceCount, setPresenceCount] = useState(0);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!poll?.id) return;

        // Create a single channel for all poll-related events
        const channel = supabase.channel(`poll:${poll.id}`, {
            config: {
                presence: {
                    key: Math.random().toString(36).substring(7), // Random user ID for anonymous presence
                },
            },
        });

        channel
            // 1. Listen for new votes (Updates to poll_options table)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'poll_options',
                    filter: `poll_id=eq.${poll.id}`,
                },
                (payload) => {
                    const updatedOption = payload.new as PollOption;

                    setPoll((currentPoll) => {
                        const newOptions = currentPoll.options.map((opt) =>
                            opt.id === updatedOption.id ? { ...opt, vote_count: updatedOption.vote_count } : opt
                        );
                        return { ...currentPoll, options: newOptions };
                    });

                    // Derive activity from the update
                    const optionText = poll.options.find(o => o.id === updatedOption.id)?.option_text || "an option";
                    const newActivity: ActivityItem = {
                        id: Math.random().toString(36).substr(2, 9),
                        type: "vote",
                        text: `Someone voted for "${optionText}"`,
                        timestamp: Date.now(),
                        color: "bg-blue-500",
                    };

                    setActivities((prev) => [newActivity, ...prev].slice(0, 5));
                }
            )
            // 2. Listen for poll status updates (e.g. expiration)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'polls',
                    filter: `id=eq.${poll.id}`,
                },
                (payload) => {
                    const updatedPollData = payload.new as Partial<Poll>;
                    setPoll((current) => ({ ...current, ...updatedPollData }));
                }
            )
            // 3. Presence (Who is online)
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                // Count total unique presence keys
                const count = Object.keys(state).length;
                setPresenceCount(count);
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                // Optional: Add "Someone joined" activity
                // const newActivity: ActivityItem = {
                //   id: Math.random().toString(36).substr(2, 9),
                //   type: "join",
                //   text: `New voter joined`,
                //   timestamp: Date.now(),
                //   color: "bg-green-500",
                // };
                // setActivities((prev) => [newActivity, ...prev].slice(0, 5));
            })
            .subscribe((status) => {
                setIsConnected(status === 'SUBSCRIBED');
                if (status === 'SUBSCRIBED') {
                    // Track presence for this user
                    channel.track({ online_at: new Date().toISOString() });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [poll.id]); // Only re-run if poll ID changes (should be stable)

    return { poll, setPoll, isConnected, presenceCount, activities };
};
