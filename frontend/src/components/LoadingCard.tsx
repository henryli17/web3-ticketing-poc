const LoadingCard = (props: { className?: string }) => {
    return (
        <div
            className={
                "card mx-auto w-full rounded-md p-5 shadow " + props.className
            }
        >
            <div className="flex animate-pulse space-x-4">
                <div className="h-32 w-24 rounded bg-slate-200" />
                <div className="flex-1 space-y-6 py-1">
                    <div className="h-2 rounded bg-slate-200" />
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 h-2 rounded bg-slate-200" />
                            <div className="col-span-1 h-2 rounded bg-slate-200" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 h-2 rounded bg-slate-200" />
                            <div className="col-span-1 h-2 rounded bg-slate-200" />
                        </div>
                        <div className="h-2 rounded bg-slate-200" />
                        <div className="h-2 rounded bg-slate-200" />
                        <div className="h-2 rounded bg-slate-200" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingCard;
