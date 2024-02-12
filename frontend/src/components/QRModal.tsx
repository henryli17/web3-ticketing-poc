const QRModal = (props: {
    close: () => any;
    title: string;
    children: React.ReactNode;
}) => {
    return (
        <div className="relative z-10" role="dialog">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" />
            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm">
                        <div className="flex justify-center bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="text-center">
                                <h3
                                    className="text-lg font-medium leading-6 text-gray-900"
                                    id="modal-title"
                                >
                                    {props.title}
                                </h3>
                                <div className="mt-2">{props.children}</div>
                            </div>
                        </div>
                        <div className="w-full px-4 pb-5">
                            <button
                                type="button"
                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-base text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none disabled:opacity-25"
                                onClick={() => props.close()}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRModal;
