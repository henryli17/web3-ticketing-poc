import { useEffect, useState } from "react";
import { CurrencyDollar, X, XLg } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import Web3 from "web3";
import {  Purchase } from "../helpers/api";
import { instance } from "../helpers/contract";
import { prettyDate } from "../helpers/utils";
import { useAddressState } from "../middleware/Wallet";
import routes from "../routes";
import ConfirmationModal from "./ConfirmationModal";
import QuantityButton from "./QuantityButton";

const PurchaseCard = (props: { purchase: Purchase, className?: string, onChange: () => any }) => {
	const [selectedQuantity, setSelectedQuantity] = useState(props.purchase.quantity);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [address] = useAddressState();
	const price = Number(Web3.utils.fromWei(props.purchase.event.price.toString(), "gwei"));

	const quantityButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		e.stopPropagation();
		setShowConfirmationModal(true);
	};

	useEffect(() => {
		setSelectedQuantity(props.purchase.quantity);
	}, [props.purchase]);

	const action = async () => {
		try {
			const contract = await instance();

			if (props.purchase.forSale) {
				await contract
					.methods
					.unlistTokenForResale(props.purchase.event.id, selectedQuantity)
					.send({ from: address })
				;
			} else {
				await contract
					.methods
					.listTokenForResale(props.purchase.event.id, selectedQuantity)
					.send({ from: address })
				;
			}
		} catch (e: any) {
			if (e.code !== 4001) {
				// TODO: error message
			}
		}

		props.onChange();
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
								<div className="text-xl font-bold text-indigo-500 flex items-center">
									{props.purchase.quantity} <X /> {price} ETH
								</div>
								<div className="text-md block">
									{props.purchase.event.venue} · {props.purchase.event.city} · {prettyDate(props.purchase.event.time)}
								</div>
							</div>
						</div>
					</div>
					{
						!props.purchase.expired &&
						<div className="col-span-12 lg:col-span-3 xl:col-span-2 mb-5 lg:mt-5 mx-5 mr-5 flex">
							<div className="lg:ml-auto">
								<QuantityButton
									quantity={props.purchase.quantity}
									className={props.purchase.forSale ? "outline-red-700 text-red-700 hover:outline-red-900 hover:text-red-900" : "outline-green-700 text-green-700 hover:outline-green-900 hover:text-green-900"}
									value={selectedQuantity}
									onClick={e => quantityButtonClick(e)}
									onChange={e => setSelectedQuantity(parseInt(e.target.value))}
								>
									{
										!props.purchase.forSale &&
										<>
											<CurrencyDollar size={16} className="mr-1" />
											Sell
										</>
									}
									{
										props.purchase.forSale &&
										<>
											<XLg size={16} className="mr-1" />
											Unlist
										</>
									}
								</QuantityButton>
							</div>
						</div>
					}
				</div>
			</Link>
			{
				showConfirmationModal &&
				<ConfirmationModal
					title={props.purchase.forSale ? "Unlist Ticket" : "Sell Ticket"}
					message={`Are you sure you want to ${props.purchase.forSale ? "unlist" : "list"} ${selectedQuantity} tickets${props.purchase.forSale ? "?" : " for " + price + " ETH each?"}`}
					close={() => setShowConfirmationModal(false)}
					action={() => action()}
				/>
			}
		</>
	);
};

export default PurchaseCard;
