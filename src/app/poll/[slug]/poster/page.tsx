'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { Printer } from 'lucide-react';

/* 
  NOTE: This page is optimized for printing. 
  The UI buttons are hidden when printing via CSS.
*/

export default function PosterPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [poll, setPoll] = useState<any>(null);
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUrl(`${window.location.origin}/poll/${slug}`);
        }

        // Fetch poll application data (question)
        const fetchPoll = async () => {
            try {
                const res = await fetch(`/api/polls/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setPoll(data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        if (slug) fetchPoll();
    }, [slug]);

    if (!poll) return <div className="p-12 text-center">Loading poster...</div>;

    return (
        <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-8 relative">
            <div className="absolute top-4 right-4 print:hidden">
                <Button onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Poster
                </Button>
            </div>

            <div className="poster-container max-w-[21cm] w-full border-4 border-black p-12 flex flex-col items-center text-center space-y-12 shadow-2xl print:shadow-none print:border-0 print:p-0">

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-widest uppercase text-gray-500">Vote Now</h2>
                    <h1 className="text-6xl font-black leading-tight">{poll.question}</h1>
                </div>

                <div className="bg-white p-4 rounded-xl border-4 border-black">
                    <QRCodeSVG
                        value={url}
                        size={400}
                        level="H"
                        includeMargin={true}
                    />
                </div>

                <div className="space-y-2">
                    <p className="text-4xl font-bold">Scan to Vote</p>
                    <p className="text-xl text-gray-600 font-mono">{url}</p>
                </div>

                <div className="pt-12 mt-auto w-full border-t-2 border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                        <span className="font-bold text-xl tracking-tight">Pollflow</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500">Real-time Voting Platform</span>
                    </div>
                </div>

            </div>

            <style jsx global>{`
        @media print {
            @page {
                size: A4 portrait;
                margin: 0;
            }
            body {
                background: white;
            }
            .print\\:hidden {
                display: none !important;
            }
            .min-h-screen {
                min-height: auto;
            }
            .shadow-2xl {
                box-shadow: none !important;
            }
        }
      `}</style>
        </div>
    );
}
