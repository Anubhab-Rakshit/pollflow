'use client'

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, X, Download, MessageCircle, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title: string;
}

// Twitter / X icon
function TwitterIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

// WhatsApp icon
function WhatsAppIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

// Mail icon
function MailIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    );
}

export function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    }, [url]);

    const downloadQRCode = useCallback(() => {
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
            }
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }, []);

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = [
        {
            name: 'WhatsApp',
            icon: <WhatsAppIcon />,
            href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
            color: 'hover:text-green-500',
        },
        {
            name: 'Twitter',
            icon: <TwitterIcon />,
            href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            color: 'hover:text-foreground',
        },
        {
            name: 'Email',
            icon: <MailIcon />,
            href: `mailto:?subject=${encodedTitle}&body=Vote%20here:%20${encodedUrl}`,
            color: 'hover:text-blue-500',
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1],
                        }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="bg-background border border-foreground/10 rounded-2xl shadow-2xl w-full max-w-md p-6 relative pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1.5 rounded-full text-foreground/40 hover:text-foreground/70 hover:bg-foreground/5 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Success checkmark */}
                            <div className="flex justify-center mb-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: 0 }}
                                    animate={{ scale: [0, 1.2, 1], rotate: [0, 360, 360] }}
                                    transition={{ duration: 0.5, ease: [0.68, -0.55, 0.27, 1.55] }}
                                    className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center"
                                >
                                    <Check className="w-7 h-7 text-emerald-500" />
                                </motion.div>
                            </div>

                            <h2 className="text-xl font-bold text-center text-foreground mb-1">Share this Poll</h2>
                            <p className="text-sm text-center text-foreground/50 mb-6">Invite others to vote</p>

                            {/* QR Code */}
                            <div className="flex justify-center mb-6">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                    className="p-4 bg-white rounded-xl border border-foreground/10 shadow-sm cursor-pointer"
                                >
                                    <QRCodeSVG
                                        id="qr-code-svg"
                                        value={url}
                                        size={200}
                                        level="H"
                                        bgColor="#ffffff"
                                        fgColor="#000000"
                                    />
                                </motion.div>
                            </div>

                            {/* Copy Link */}
                            <div className="flex gap-2 mb-6">
                                <div className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm text-foreground/70 font-mono truncate">
                                    {url}
                                </div>
                                <motion.button
                                    onClick={handleCopy}
                                    whileTap={{ scale: 0.95 }}
                                    className={`px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-300 min-w-[120px] justify-center ${copied
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-foreground text-background hover:opacity-90'
                                        }`}
                                >
                                    <AnimatePresence mode="wait">
                                        {copied ? (
                                            <motion.span
                                                key="copied"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="flex items-center gap-1.5"
                                            >
                                                <Check className="w-4 h-4" /> Copied!
                                            </motion.span>
                                        ) : (
                                            <motion.span
                                                key="copy"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="flex items-center gap-1.5"
                                            >
                                                <Copy className="w-4 h-4" /> Copy Link
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </div>

                            {/* Share Buttons */}
                            <div className="flex items-center justify-center gap-3 mb-4">
                                {shareLinks.map((link) => (
                                    <motion.a
                                        key={link.name}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(var(--foreground-rgb, 128, 128, 128), 0.1)' }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`w-12 h-12 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/60 transition-colors ${link.color}`}
                                        title={link.name}
                                    >
                                        {link.icon}
                                    </motion.a>
                                ))}
                                <motion.button
                                    onClick={downloadQRCode}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-12 h-12 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                                    title="Download QR"
                                >
                                    <Download className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
