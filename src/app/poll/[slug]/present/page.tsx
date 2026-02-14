'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { Maximize, Minimize, Users, ArrowLeft } from 'lucide-react';
import { useSocketPoll } from '@/lib/use-socket-poll';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PresentationPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [initialPoll, setInitialPoll] = useState<any>(null);

    // Fetch initial data
    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const res = await fetch(`/api/polls/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setInitialPoll(data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        if (slug) fetchPoll();
    }, [slug]);

    if (!initialPoll) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    return <PresentationView initialPoll={initialPoll} slug={slug} />;
}

function PresentationView({ initialPoll, slug }: { initialPoll: any, slug: string }) {
    const { poll, presenceCount } = useSocketPoll(initialPoll);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUrl(`${window.location.origin}/poll/${slug}`);
        }
    }, [slug]);

    // Handle Fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Calculate percentages
    const totalVotes = poll.options.reduce((sum: number, opt: any) => sum + opt.vote_count, 0);
    const sortedOptions = [...poll.options].sort((a, b) => b.vote_count - a.vote_count);

    return (
        <div className="fixed inset-0 min-h-screen w-full bg-black !bg-black text-white flex flex-col p-8 sm:p-12 overflow-hidden z-[9999]">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20 pointer-events-none opacity-50" />

            {/* Header */}
            <div className="flex justify-between items-start mb-12 z-10">
                <Link href={`/poll/${slug}`} className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </Link>
                <Button variant="ghost" className="text-white hover:bg-white/10" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 flex gap-12 z-10">
                {/* Left: Results */}
                <div className="flex-1 flex flex-col justify-center">
                    <h1 className="text-5xl sm:text-7xl font-bold mb-12 leading-tight">
                        {poll.question}
                    </h1>

                    <div className="space-y-6">
                        {sortedOptions.map((option: any) => {
                            const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0;
                            return (
                                <div key={option.id} className="space-y-2">
                                    <div className="flex justify-between items-end px-1">
                                        <span className="text-2xl font-medium">{option.option_text}</span>
                                        <span className="text-3xl font-bold text-indigo-400">{Math.round(percentage)}%</span>
                                    </div>
                                    <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-12 flex items-center gap-4 text-gray-400">
                        <span className="text-lg">Total Votes: <span className="text-white font-bold">{totalVotes}</span></span>
                        <span className="w-1 h-1 bg-gray-600 rounded-full" />
                        <span className="flex items-center gap-2 text-lg">
                            <Users className="w-5 h-5" />
                            <span className="text-white font-bold">{presenceCount}</span> watching
                        </span>
                    </div>
                </div>

                {/* Right: QR Code */}
                <div className="w-1/3 flex flex-col items-center justify-center p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                    <div className="bg-white p-4 rounded-xl mb-6">
                        <QRCodeSVG
                            value={url}
                            size={300}
                            level="H"
                        />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Join to Vote</h3>
                    <p className="text-xl text-gray-400 font-mono text-center break-all">{url}</p>
                </div>
            </div>
        </div>
    );
}
