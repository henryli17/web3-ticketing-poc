import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Web3 from "web3";
import ConnectWallet from "../components/ConnectWallet";
import GenrePill from "../components/GenrePill";
import NotFound from "../components/NotFound";
import QuantityButton from "../components/QuantityButton";
import Spinner from "../components/Spinner";
import SuccessAlert from "../components/SuccessAlert";
import { Event, getEvent } from "../helpers/api";
import { instance } from "../helpers/contract";
import { gweiToEth, gweiToWei, prettyDate } from "../helpers/utils";
import { useAddressState } from "../middleware/Wallet";

const SingleEventView = () => {
	const { id } = useParams();
	const [error, setError] = useState(false);
	const [event, setEvent] = useState<Event>();
	const [showSuccess, setShowSuccess] = useState(false);

	useEffect(() => {
		getEvent(Number(id))
			.then(setEvent)
			.catch(() => setError(true))
		;
	}, [id]);

	if (!event) {
		return <></>;
	} else if (error) {
		return <NotFound />;
	}

	return (
		<div className="container mx-auto p-10">
			{	
				showSuccess &&
				<SuccessAlert title="Nice!" message="Your tickets were successfully purchased!" />
			}
			<div className="grid grid-cols-1 py-10 lg:grid-cols-2 ">
				<div className="grid-span-1 flex mb-16 lg:mb-0">
					<div className="my-auto">
						<img className="mx-auto shadow-lg w-10/12 md:w-8/12 lg:w-10/12 xl:w-8/12 rounded" src={event.imagePath} alt={event.artist} />
					</div>
				</div>
				<div className="grid-span-1 flex">
					<div className="my-auto">
						<h1 className="italic uppercase font-bold mb-1">
							{event.artist}
						</h1>
						<div className="text-2xl mb-8 italic">
							{event.name}
						</div>
						<div className="text-2xl">
							{prettyDate(event.time)}
						</div>
						<div className="text-2xl mb-8">
							{event.venue}, {event.city}
						</div>
						<div className="text-2xl uppercase font-bold">
							Price
						</div>
						<h2 className="font-bold text-indigo-500 mb-8">
							{gweiToEth(event.price)} ETH
						</h2>
						<PurchaseButton event={event} className="mb-8 btn-basic" onSuccess={() => setShowSuccess(true)} />
						<div className="mb-8 text-lg">
							{event.description}
						</div>
						<div className="space-x-2 flex">
							{event.genres.map(genre => <GenrePill name={genre} key={genre} />)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const PurchaseButton = (props: {
	className?: string,
	event: Event,
	onSuccess: () => any
}) => {
	const [address] = useAddressState();
	const [quantity, setQuantity] = useState(1);
	const [disabled, setDisabled] = useState(false);

	if (!address) {
		return <ConnectWallet className={props.className} />;
	}

	const purchase = async () => {
		setDisabled(true);

		try {
			const contract = await instance();

			await contract
				.methods
				.buyToken(props.event.id, quantity)
				.send({
					from: address,
					value: gweiToWei(props.event.price * quantity)
				})
			;

			props.onSuccess();
		} catch (e: any) {
			console.error(e)
		}

		setDisabled(false);
	};

	return (
		<QuantityButton
			className={props.className}
			quantity={6}
			value={quantity}
			onClick={() => purchase()}
			onChange={e => setQuantity(Number(e.target.value))}
			disabled={disabled}
		>
			{disabled && <Spinner />}
			Purchase
		</QuantityButton>
	);
};

export default SingleEventView;
