import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Twitter, Mail, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title: string;
}

export function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadQRCode = () => {
        // ... (Same logic as before, just kept for brevity)
        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = `poll-qr-${Date.now()}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
                toast.success('QR Code downloaded!');
            }
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#0f172a] border border-white/10 text-white shadow-2xl backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Share this Poll</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="link" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2 bg-white/5">
                        <TabsTrigger
                            value="link"
                            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                        >
                            Link & Social
                        </TabsTrigger>
                        <TabsTrigger
                            value="qr"
                            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                        >
                            QR Code
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="link" className="space-y-6 py-4">
                        <div className="space-y-2">
                            <label className="text-xs text-white/50 uppercase font-semibold tracking-wider">Poll Link</label>
                            <div className="flex gap-2">
                                <Input
                                    value={url}
                                    readOnly
                                    className="bg-white/5 border-white/10 text-white/80 font-mono text-sm focus-visible:ring-primary"
                                />
                                <Button
                                    size="icon"
                                    onClick={handleCopy}
                                    className={`${copied ? 'bg-green-500 hover:bg-green-600' : 'bg-white/10 hover:bg-white/20'} transition-colors`}
                                >
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <a href={`whatsapp://send?text=${encodedTitle} - Vote now: ${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="contents">
                                <Button variant="outline" className="flex flex-col h-20 gap-2 border-white/10 bg-white/5 hover:bg-[#25D366]/20 hover:border-[#25D366]/50 hover:text-[#25D366] transition-all">
                                    <span className="text-2xl">📱</span>
                                    <span className="text-xs">WhatsApp</span>
                                </Button>
                            </a>
                            <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="contents">
                                <Button variant="outline" className="flex flex-col h-20 gap-2 border-white/10 bg-white/5 hover:bg-[#1DA1F2]/20 hover:border-[#1DA1F2]/50 hover:text-[#1DA1F2] transition-all">
                                    <Twitter className="w-6 h-6" />
                                    <span className="text-xs">Twitter</span>
                                </Button>
                            </a>
                            <a href={`mailto:?subject=${encodedTitle}&body=Vote on this poll: ${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="contents">
                                <Button variant="outline" className="flex flex-col h-20 gap-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all">
                                    <Mail className="w-6 h-6" />
                                    <span className="text-xs">Email</span>
                                </Button>
                            </a>
                        </div>
                    </TabsContent>

                    <TabsContent value="qr" className="py-4 flex flex-col items-center gap-6">
                        <div className="p-4 bg-white rounded-xl">
                            <QRCodeSVG
                                id="qr-code-svg"
                                value={url}
                                size={200}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                        <Button onClick={downloadQRCode} variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white">
                            <Download className="mr-2 h-4 w-4" /> Download QR Code
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
