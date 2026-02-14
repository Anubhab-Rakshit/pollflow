import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Download, ExternalLink, check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import Link from 'next/link';

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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share this Poll</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="link" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="link">Link & Social</TabsTrigger>
                        <TabsTrigger value="qr">QR Code</TabsTrigger>
                    </TabsList>

                    <TabsContent value="link" className="space-y-4 py-4">
                        <div className="flex gap-2">
                            <Input value={url} readOnly className="font-mono text-sm" />
                            <Button size="icon" variant="outline" onClick={handleCopy}>
                                {copied ? <check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <Button variant="outline" className="flex flex-col h-20 gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors" asChild>
                                <a href={`whatsapp://send?text=${encodedTitle} - Vote now: ${encodedUrl}`} target="_blank" rel="noopener noreferrer">
                                    <span className="text-xl">📱</span>
                                    <span className="text-xs">WhatsApp</span>
                                </a>
                            </Button>
                            <Button variant="outline" className="flex flex-col h-20 gap-2 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 transition-colors" asChild>
                                <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer">
                                    <span className="text-xl">🐦</span>
                                    <span className="text-xs">Twitter</span>
                                </a>
                            </Button>
                            <Button variant="outline" className="flex flex-col h-20 gap-2 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-200 transition-colors" asChild>
                                <a href={`mailto:?subject=${encodedTitle}&body=Vote on this poll: ${encodedUrl}`} target="_blank" rel="noopener noreferrer">
                                    <span className="text-xl">✉️</span>
                                    <span className="text-xs">Email</span>
                                </a>
                            </Button>
                        </div>

                        <div className="pt-4 border-t flex justify-between text-sm text-muted-foreground">
                            <Link href={`${url}/poster`} className="flex items-center gap-1 hover:text-primary transition-colors">
                                <ExternalLink className="w-3 h-3" />
                                Print Poster
                            </Link>
                            <Link href={`${url}/present`} className="flex items-center gap-1 hover:text-primary transition-colors">
                                <ExternalLink className="w-3 h-3" />
                                Presentation Mode
                            </Link>
                        </div>
                    </TabsContent>

                    <TabsContent value="qr" className="flex flex-col items-center gap-6 py-4">
                        <div className="p-4 bg-white rounded-xl border shadow-sm">
                            <QRCodeSVG
                                id="qr-code-svg"
                                value={url}
                                size={200}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                        <Button onClick={downloadQRCode} className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Download PNG
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
