export default function ProductSkeleton() {
    return (
        <div className="rounded-[2.5rem] bg-white border border-neutral-100 p-4 shadow-sm animate-pulse">
            <div className="aspect-[4/5] w-full rounded-[2rem] bg-neutral-200/70 mb-4" />

            <div className="px-2 space-y-3">
                <div className="h-4 bg-neutral-200/70 rounded-full w-3/4" />
                <div className="h-3 bg-neutral-200/70 rounded-full w-1/2" />
                <div className="h-5 bg-neutral-200/70 rounded-full w-1/3 pt-2" />
            </div>
        </div>
    );
}