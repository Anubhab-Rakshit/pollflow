import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

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
    const reconnectToastId = useRef<string | number | null>(null);

    useEffect(() => {
        if (!poll?.id) return;

        const channel = supabase.channel(`poll:${poll.id}`, {
            config: {
                presence: {
                    key: Math.random().toString(36).substring(7),
                },
            },
        });

        channel
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
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const count = Object.keys(state).length;
                setPresenceCount(count);
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setIsConnected(true);
                    if (reconnectToastId.current) {
                        toast.dismiss(reconnectToastId.current);
                        toast.success('Connected ✓', {
                            duration: 2000,
                            style: {
                                background: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                            },
                        });
                        reconnectToastId.current = null;
                    }
                    channel.track({ online_at: new Date().toISOString() });
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    setIsConnected(false);
                    if (!reconnectToastId.current) {
                        reconnectToastId.current = toast.loading('Reconnecting...', {
                            duration: Infinity,
                            style: {
                                background: '#f59e0b',
                                color: '#ffffff',
                                border: 'none',
                            },
                        });
                    }
                } else if (status === 'CLOSED') {
                    setIsConnected(false);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [poll.id]);

    return { poll, setPoll, isConnected, presenceCount, activities };
};
