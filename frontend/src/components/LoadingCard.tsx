const LoadingCard = (props: { className?: string }) => {
    return (
        <div
            className={
                "card shadow rounded-md p-5 w-full mx-auto " + props.className
            }
        >
            <div className="animate-pulse flex space-x-4">
                <div className="rounded bg-slate-200 h-32 w-24" />
                <div className="flex-1 space-y-6 py-1">
                    <div className="h-2 bg-slate-200 rounded" />
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="h-2 bg-slate-200 rounded col-span-2" />
                            <div className="h-2 bg-slate-200 rounded col-span-1" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="h-2 bg-slate-200 rounded col-span-2" />
                            <div className="h-2 bg-slate-200 rounded col-span-1" />
                        </div>
                        <div className="h-2 bg-slate-200 rounded" />
                        <div className="h-2 bg-slate-200 rounded" />
                        <div className="h-2 bg-slate-200 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingCard;
