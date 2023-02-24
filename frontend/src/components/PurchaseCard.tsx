import { useEffect, useState } from "react";
import { CurrencyDollar, XLg } from "react-bootstrap-icons";
import {  Purchase } from "../helpers/api";
import { getInstance } from "../helpers/contract";
import { gweiToEth } from "../helpers/utils";
import { useAddress } from "../middleware/Wallet";
import ConfirmationModal from "./ConfirmationModal";
import EventCard from "./EventCard";
import QuantityButton from "./QuantityButton";

const PurchaseCard = (props: { purchase: Purchase, className?: string, onChange: () => any }) => {
	const [selectedQuantity, setSelectedQuantity] = useState(props.purchase.quantity);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [address] = useAddress();
	const price = gweiToEth(props.purchase.event.price);

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
			const contract = await getInstance();

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
			console.error(e);
		}

		props.onChange();
	};

	return (
		<>
			<EventCard
				event={props.purchase.event}
				quantity={props.purchase.quantity}
				to={(props.purchase.event.cancelled) ? "#" : undefined}
			>
				{
					!props.purchase.expired &&
					!props.purchase.event.cancelled &&
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
			</EventCard>
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
