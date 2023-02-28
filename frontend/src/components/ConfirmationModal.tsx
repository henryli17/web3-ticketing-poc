import { useState } from "react";
import Spinner from "./Spinner";

const ConfirmationModal = (props: {
	close: () => any,
	action: () => any,
	title: string,
	message: string,
	children?: React.ReactNode
}) => {
	const [disabled, setDisabled] = useState(false);

	const action = async () => {
		setDisabled(true);
		await props.action();
		props.close();
	};

	return (
		<div className="relative z-10" role="dialog">
			<div className="fixed inset-0 bg-gray-500 bg-opacity-75" />
			<div className="fixed inset-0 z-10 overflow-y-auto">
				<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
					<div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
						<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
							<div className="sm:flex sm:items-start">
								<div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
									<svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
										<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
									</svg>
								</div>
								<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
									<h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
										{props.title}
									</h3>
									<div className="mt-2 break-words sm:w-[calc(100%-3.5rem)]">
										<p className="text-sm text-gray-500">
											{props.message}
										</p>
										{props.children}
									</div>
								</div>
							</div>
						</div>
						<div className="px-4 py-5 sm:flex sm:flex-row-reverse sm:px-6">
							<button
								type="button"
								disabled={disabled}
								className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-25"
								onClick={() => action()}
							>
								{disabled && <Spinner />}
								Continue
							</button>
							<button
								type="button"
								disabled={disabled}
								className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-25"
								onClick={() => props.close()}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ConfirmationModal;
