import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Validation Schema
const CreatePollSchema = z.object({
    question: z.string().min(10, 'Question must be at least 10 characters').max(200, 'Question must be under 200 characters'),
    options: z.array(z.string().min(1, 'Option cannot be empty').max(100, 'Option must be under 100 characters'))
        .min(2, 'At least 2 options are required')
        .max(5, 'Maximum 5 options allowed')
        .refine((items) => new Set(items).size === items.length, {
            message: 'Options must be unique',
        }),
    creatorFingerprint: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Zod Validation
        const validation = CreatePollSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation Error', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { question, options, creatorFingerprint } = validation.data;

        // 2. Security: Hash IP Address
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const salt = await bcrypt.genSalt(10);
        const ipHash = await bcrypt.hash(ip, salt);

        // 3. Generate Unique Slug
        let slug = nanoid(6);
        let isUnique = false;
        let retries = 0;

        while (!isUnique && retries < 5) {
            const { data } = await supabase.from('polls').select('slug').eq('slug', slug).single();
            if (!data) {
                isUnique = true;
            } else {
                slug = nanoid(6);
                retries++;
            }
        }

        if (!isUnique) {
            return NextResponse.json({ error: 'Failed to generate unique slug, please try again.' }, { status: 500 });
        }

        // 4. Atomic Database Transaction (RPC)
        const { data: pollId, error } = await supabase.rpc('create_poll', {
            p_question: question,
            p_slug: slug,
            p_creator_fingerprint: creatorFingerprint || null,
            p_creator_ip_hash: ipHash,
            p_options: options,
        });

        if (error) {
            console.error('Supabase RPC Error:', error);
            return NextResponse.json({ error: 'Database transaction failed', details: error.message }, { status: 500 });
        }

        // 5. Success Response
        return NextResponse.json({
            success: true,
            pollSlug: slug,
            pollId: pollId,
        });

    } catch (error: any) {
        console.error('Internal Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
