import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        console.log("Analytics API hit for slug:", slug);

        // 1. Get Poll Data (Basic info only)
        const { data: poll, error: pollError } = await supabase
            .from('polls')
            .select('id, question, created_at')
            .eq('slug', slug)
            .single()

        if (pollError) {
            console.error("Poll fetch error:", pollError);
            // If 406/PGRST116, it means not found
            return NextResponse.json({ error: 'Poll query failed', details: pollError }, { status: 404 })
        }

        if (!poll) {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
        }

        // 2. Get Options
        const { data: options, error: optionsError } = await supabase
            .from('poll_options')
            .select('id, option_text, vote_count')
            .eq('poll_id', poll.id)
            .order('position', { ascending: true });

        if (optionsError) {
            console.error("Options fetch error:", optionsError);
            // Continue with empty options if fail, or error out?
            // Error out is safer
            return NextResponse.json({ error: 'Options fetch error', details: optionsError }, { status: 500 })
        }

        // 3. Get Total Views
        const { count: totalViews, error: viewsError } = await supabase
            .from('poll_views')
            .select('*', { count: 'exact', head: true })
            .eq('poll_id', poll.id)

        if (viewsError) {
            console.error("Views fetch error:", viewsError);
        }

        // 4. Calculate Stats
        const safeOptions = options || [];
        const totalVotes = safeOptions.reduce((acc: number, curr: any) => acc + curr.vote_count, 0)
        const conversionRate = totalViews ? ((totalVotes / totalViews) * 100).toFixed(1) : 0

        return NextResponse.json({
            poll: {
                question: poll.question,
                created_at: poll.created_at
            },
            metrics: {
                total_views: totalViews || 0,
                total_votes: totalVotes,
                conversion_rate: conversionRate
            },
            options: safeOptions
        })
    } catch (error: any) {
        console.error("Analytics Route Exception:", error);
        return NextResponse.json({ error: 'Server Error', message: error.message }, { status: 500 });
    }
}
