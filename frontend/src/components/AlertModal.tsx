const AlertModal = (props: {
    close: () => any;
    title: string;
    message: string;
    className?: string;
}) => {
    return (
        <div className="relative z-10" role="dialog">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" />
            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div
                                    className={
                                        "mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 " +
                                        (props.className || "bg-indigo-100")
                                    }
                                >
                                    <svg
                                        className={
                                            "h-6 w-6 " +
                                            (props.className ||
                                                "text-indigo-500")
                                        }
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                        />
                                    </svg>
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3
                                        className="text-lg font-medium leading-6 text-gray-900"
                                        id="modal-title"
                                    >
                                        {props.title}
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 break-words sm:w-[calc(100%-3.5rem)]">
                                            {props.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 py-5 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                type="button"
                                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-25"
                                onClick={() => props.close()}
                            >
                                Okay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
