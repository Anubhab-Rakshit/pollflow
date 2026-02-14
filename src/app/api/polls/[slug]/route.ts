import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    try {
        const { data: poll, error: pollError } = await supabase
            .from('polls')
            .select('id, question, created_at, slug')
            .eq('slug', slug)
            .single();

        if (pollError || !poll) {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
        }

        const { data: options } = await supabase
            .from('poll_options')
            .select('id, option_text, vote_count, position')
            .eq('poll_id', poll.id)
            .order('position', { ascending: true });

        const fullPoll = {
            ...poll,
            options: options || []
        };

        return NextResponse.json(fullPoll);

    } catch (error) {
        console.error("Fetch Poll Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
