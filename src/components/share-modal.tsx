"use client"

import { QRCodeSVG } from "qrcode.react"
import { Copy, Check, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface ShareModalProps {
    isOpen: boolean
    onClose: () => void
    url: string
    title: string
}

export function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success("Link copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Share Poll</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Share this poll with others to get more votes.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center space-y-6 py-6">
                    {/* QR Code */}
                    <div className="p-4 bg-white rounded-2xl shadow-inner border border-border/50">
                        <QRCodeSVG
                            value={url}
                            size={180}
                            level="H"
                            includeMargin
                            className="rounded-lg"
                        />
                    </div>

                    <div className="w-full space-y-2">
                        <Label htmlFor="link" className="sr-only">Link</Label>
                        <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl border border-border/50">
                            <Input
                                id="link"
                                value={url}
                                readOnly
                                className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm"
                            />
                            <Button
                                type="button"
                                size="sm"
                                onClick={copyToClipboard}
                                className={`rounded-lg transition-all duration-300 ${copied ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                            >
                                {copied ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex items-center gap-1"
                                    >
                                        <Check className="h-4 w-4" /> <span className="sr-only">Copied</span>
                                    </motion.div>
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
