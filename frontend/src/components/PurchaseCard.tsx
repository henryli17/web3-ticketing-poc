import { useEffect, useState } from "react";
import { CurrencyDollar, QrCode, XLg } from "react-bootstrap-icons";
import QRCode from "react-qr-code";
import { getSignature, Purchase } from "../helpers/api";
import { getInstance } from "../helpers/contract";
import { gweiToEth } from "../helpers/utils";
import { useAddress } from "../middleware/Wallet";
import ConfirmationModal from "./ConfirmationModal";
import EventCard from "./EventCard";
import QRModal from "./QRModal";
import QuantityButton from "./QuantityButton";

export type QrData = {
	signature: string,
	eventId: number,
	quantity: number
};

const PurchaseCard = (props: { purchase: Purchase, className?: string, onChange: () => any }) => {
	const [selectedQuantity, setSelectedQuantity] = useState(1);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [remainingQuantity, setRemainingQuantity] = useState(0);
	const [qrData, setQrData] = useState<QrData>();
	const [address] = useAddress();
	const price = gweiToEth(props.purchase.event.price);

	const quantityButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		e.stopPropagation();
		setShowConfirmationModal(true);
	};

	useEffect(() => {
		if (props.purchase.used) {
			setRemainingQuantity(props.purchase.quantity - props.purchase.used);
			setSelectedQuantity(props.purchase.quantity - props.purchase.used);
		} else {
			setRemainingQuantity(props.purchase.quantity);
			setSelectedQuantity(props.purchase.quantity);
		}
	}, [props.purchase, address]);

	const toggleTokenListing = async () => {
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

	const generateQr = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();

		try {
			const w = (window as any);

			if (!w.ethereum) {
				return;
			}

			const message = (await getSignature()).message;
			const signature = await w.ethereum.request({
				method: "personal_sign",
				params: [message, address]
			});
	
			setQrData(
				{ 
					signature: signature,
					eventId: props.purchase.event.id,
					quantity: props.purchase.quantity
				}
			);
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<>
			<EventCard
				event={props.purchase.event}
				quantity={props.purchase.quantity}
				to={(props.purchase.event.cancelled) ? "#" : undefined}
				used={props.purchase.used}
			>
				{
					!props.purchase.expired &&
					!props.purchase.event.cancelled &&
					<div className="col-span-12 lg:col-span-4 xl:col-span-3 mb-5 lg:mt-5 mx-5 mr-5 flex">
						<div className="lg:ml-auto flex h-fit space-x-2">
							{
								!props.purchase.forSale && remainingQuantity > 0 &&
								<button className="btn btn-basic" onClick={e => generateQr(e)}>
									<QrCode className="mr-1" />
									QR
								</button>
							}
							{
								remainingQuantity > 0 &&
								<QuantityButton
									quantity={remainingQuantity}
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
							}
						</div>
					</div>
				}
			</EventCard>
			{
				showConfirmationModal &&
				<ConfirmationModal
					title={props.purchase.forSale ? "Unlist Ticket" : "Sell Ticket"}
					message={
						props.purchase.forSale
							? `Are you sure you want to unlist ${selectedQuantity} tickets?`
							: `Are you sure you want to list ${selectedQuantity} tickets for sale at ${price} ETH each?`
					}
					close={() => setShowConfirmationModal(false)}
					action={() => toggleTokenListing()}
				/>
			}
			{
				qrData &&
				<QRModal
					close={() => setQrData(undefined)}
					title="Ticket QR"
				>
					<div className="mt-5 mb-1 space-y-3">
						<QRCode value={JSON.stringify(qrData)} size={200} />
						<div className="font-medium text-gray-800">
							Remaining Tickets: {remainingQuantity}
						</div>
					</div>
				</QRModal>
			}
		</>
	);
};

export default PurchaseCard;
