
import { Skeleton } from "@/components/ui/skeleton"

export function PollSkeleton() {
    return (
        <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-card rounded-2xl shadow-sm border border-border">
            {/* Header Skeleton */}
            <div className="flex justify-between items-start gap-4 mb-8">
                <div className="space-y-3 w-full max-w-[80%]">
                    <Skeleton className="h-8 w-full rounded-lg" />
                    <Skeleton className="h-8 w-2/3 rounded-lg" />
                    <div className="flex gap-2 pt-2">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
            </div>

            {/* Options Skeleton */}
            <div className="space-y-4 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="relative h-16 w-full rounded-xl overflow-hidden bg-muted/30 border border-border/50">
                        <Skeleton className="absolute inset-0 opacity-20" />
                    </div>
                ))}
            </div>

            {/* Footer Skeleton */}
            <div className="flex justify-between items-center pt-4 border-t border-border">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
    )
}
