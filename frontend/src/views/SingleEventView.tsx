import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Web3 from "web3";
import ConnectWallet from "../components/ConnectWallet";
import GenrePill from "../components/GenrePill";
import NotFound from "../components/NotFound";
import Spinner from "../components/Spinner";
import { Event, getEvent } from "../helpers/api";
import { instance } from "../helpers/contract";
import { prettyDate } from "../helpers/utils";
import { useAddressState } from "../middleware/Wallet";

const SingleEventView = () => {
	const { id } = useParams();
	const [error, setError] = useState(false);
	const [event, setEvent] = useState<Event>();

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
		<div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 py-20 px-10">
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
						{Web3.utils.fromWei(event.price.toString(), "gwei")} ETH
					</h2>
					<PurchaseButton event={event} className="mb-8" />
					<div className="mb-8 text-lg">
						{event.description}
					</div>
					<div className="space-x-2">
						{event.genres.map(genre => <GenrePill name={genre} key={genre} />)}
					</div>
				</div>
			</div>
		</div>
	);
};

const PurchaseButton = (props: { className?: string, event: Event }) => {
	const [address] = useAddressState();
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

		setDisabled(false);
	};

	return (
		<button 
			type="button"
			className={"btn btn-basic w-32 " + props.className}
			onClick={() => purchase()}
			disabled={disabled}
		>
			{disabled && <Spinner />}
			Purchase
		</button>
	);
};

export default SingleEventView;
