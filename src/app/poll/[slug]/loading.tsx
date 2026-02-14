
import { PollSkeleton } from "@/components/poll-skeleton";

export default function Loading() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <PollSkeleton />
        </div>
    );
}
