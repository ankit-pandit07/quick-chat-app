export default function Loading() {
    return (
        <div className="flex-1 h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground animate-pulse">Loading chat...</p>
            </div>
        </div>
    );
}
