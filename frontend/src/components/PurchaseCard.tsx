import { useState } from "react";
import { Link } from "react-router-dom";
import Web3 from "web3";
import {  Purchase } from "../helpers/api";
import { contract } from "../helpers/contract";
import { prettyDate } from "../helpers/utils";
import routes from "../routes";
import SellButton from "./SellButton";

const PurchaseCard = (props: { purchase: Purchase, className?: string }) => {
	const [quantityToSell, setQuantityToSell] = useState(0);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);

	const sellButtonOnClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		e.stopPropagation();
		setShowConfirmationModal(true);
	};

	const sellTicket = async () => {
		try {
			await contract
				.methods
				.buyToken(props.event.id, 1)
				.send({
					from: address,
					value: Web3.utils.toWei(String(props.event.price), "gwei")
				})
			;
		} catch (e: any) {
			if (e.code !== 4001) {
				// TODO: error message
			}
		}
	};

	return (
		<>
			<Link to={routes.event(props.purchase.event.id)} className={"card flex w-full " + props.className}>
				<div className="my-auto grid grid-cols-12 w-full">
					<div className="col-span-12 lg:col-span-9 xl:col-span-10 flex">
						<img className="rounded shadow-lg m-5 hidden sm:block" src={props.purchase.event.imagePath} alt={props.purchase.event.artist} width={100} />
						<div className="my-5 mx-5 sm:mr-5 sm:ml-0 text-left w-full flex">
							<div className="my-auto w-full">
								<div className="italic mb-2">
									<h2 className="font-bold uppercase mr-2">
										{props.purchase.event.artist}
									</h2>
									<div className="text-xl">
										{props.purchase.event.name}
									</div>
								</div>
								<div className="text-xl font-bold text-indigo-500">
									{Web3.utils.fromWei((props.purchase.event.price * props.purchase.quantity).toString(), "gwei")} ETH
								</div>
								<div className="text-md block">
									{props.purchase.event.venue} · {props.purchase.event.city} · {prettyDate(props.purchase.event.time)}
								</div>
							</div>
						</div>
					</div>
					<div className="col-span-12 lg:col-span-3 xl:col-span-2 mb-5 lg:mt-5 mx-5 mr-5 flex">
						<div className="lg:ml-auto">
							<SellButton
								event={props.purchase.event}
								quantity={props.purchase.quantity}
								onClick={e => sellButtonOnClick(e)}
								onChange={e => setQuantityToSell(parseInt(e.target.value))}
							/>
						</div>
					</div>
				</div>
			</Link>
			{showConfirmationModal && <ConfirmationModal cancel={() => setShowConfirmationModal(false)} continue={() => console.log(quantityToSell)} />}
		</>
	);
};

const ConfirmationModal = (props: { cancel: () => any, continue: () => any }) => {
	return (
		<div className="relative z-10" role="dialog">
			<div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
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
								<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
									<h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">Sell Ticket</h3>
									<div className="mt-2">
										<p className="text-sm text-gray-500">
											Are you sure you want to list 2 tickets for sale?
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className="px-4 py-5 sm:flex sm:flex-row-reverse sm:px-6">
							<button
								type="button"
								className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
								onClick={() => props.continue()}
							>
								Continue
							</button>
							<button
								type="button"
								className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
								onClick={() => props.cancel()}
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

export default PurchaseCard;
