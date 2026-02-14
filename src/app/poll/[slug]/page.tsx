import { VotingInterface } from "@/components/voting-interface";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

// Since we are using an async component for data fetching in Next.js 14/15
export default async function PollPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Fetch Poll Data
    const { data: poll, error } = await supabase
        .from("polls")
        .select("id, question, created_at, slug, expires_at, scheduled_for")
        .eq("slug", slug)
        .single();

    if (error || !poll) {
        notFound();
    }

    // Fetch Options
    const { data: options } = await supabase
        .from("poll_options")
        .select("id, option_text, vote_count, position")
        .eq("poll_id", poll.id)
        .order("position", { ascending: true });

    const fullPoll = {
        ...poll,
        options: options || [],
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <VotingInterface initialPoll={fullPoll} />
        </div>
    );
}
