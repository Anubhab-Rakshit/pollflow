import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // 1. Get Poll ID from slug
        const { data: poll, error: pollError } = await supabase
            .from('polls')
            .select('id')
            .eq('slug', slug)
            .single()

        if (pollError || !poll) {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
        }

        // 2. Record view
        const { error: viewError } = await supabase
            .from('poll_views')
            .insert({ poll_id: poll.id })

        if (viewError) {
            console.error('Error recording view:', viewError)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
