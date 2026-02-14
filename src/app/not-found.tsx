import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Poll Not Found</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
                The poll you are looking for does not exist, has been deleted, or the link is incorrect.
            </p>
            <Link href="/">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Create a New Poll
                </Button>
            </Link>
        </div>
    )
}
