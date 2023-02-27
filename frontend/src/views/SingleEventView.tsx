import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Alert from "../components/Alert";
import ConnectWallet from "../components/ConnectWallet";
import GenrePill from "../components/GenrePill";
import NotFound from "../components/NotFound";
import QuantityButton from "../components/QuantityButton";
import Spinner from "../components/Spinner";
import { Event, getEvent } from "../helpers/api";
import { getInstance, getResaleTokens, ResaleToken } from "../helpers/contract";
import { gweiToEth, gweiToWei, prettyDate } from "../helpers/utils";
import { useAddress } from "../middleware/Wallet";
import routes from "../routes";

const SingleEventView = () => {
	const { id } = useParams();
	const [error, setError] = useState(false);
	const [event, setEvent] = useState<Event>();
	const [resaleTokens, setResaleTokens] = useState<ResaleToken[]>([]);
	const [refreshEvent, setRefreshEvent] = useState(false);
	const [success, setSuccess] = useState<boolean>();
	const [locked, setLocked] = useState(false);
	const [address] = useAddress();

	useEffect(() => {
		getEvent(Number(id))
			.then(setEvent)
			.catch(() => setError(true))
		;
	}, [id]);

	useEffect(() => {
		if (!address) {
			return;
		}

		setLocked(false);
		getResaleTokens(Number(id))
			.then(resaleTokens => {
				setResaleTokens(
					resaleTokens.filter(r => !r.sold && r.owner !== address)
				)
			})
			.catch(() => setError(true))
		;
	}, [id, address, refreshEvent]);

	if (error) {
		return <NotFound />;
	}

	if (!event) {
		return <></>;
	}

	return (
		<div className="container mx-auto p-10">
			{	
				success &&
				<Alert
					title="Nice!"
					message="Your tickets were successfully purchased!"
					className="bg-green-50 text-green-800"
				/>
			}
			{	
				locked &&
				<Alert
					message="Please manually unlock your MetaMask wallet to allow us to connect to it."
					className="bg-indigo-50 text-indigo-800"
				/>
			}
			<div className="grid grid-cols-1 py-10 lg:grid-cols-2 ">
				<div className="grid-span-1 flex mb-16 lg:mb-0">
					<div className="my-auto">
						<img className="mx-auto shadow-lg w-10/12 md:w-8/12 lg:w-10/12 xl:w-8/12 rounded" src={event.imageUrl} alt={event.artist} />
					</div>
				</div>
				<div className="grid-span-1 flex">
					<div className="my-auto w-full">
						<h1 className="italic uppercase font-bold mb-1">
							{event.artist}
						</h1>
						<div className="text-2xl mb-8 italic">
							{event.name}
						</div>
						<div className="text-2xl">
							{prettyDate(event.time)}
						</div>
						<div className="text-2xl mb-8 capitalize">
							{event.venue}, {event.city}
						</div>
						<div className="text-2xl uppercase font-bold">
							Price
						</div>
						<h2 className="font-bold text-indigo-500 mb-8">
							{gweiToEth(event.price)} ETH
						</h2>
						<div className="flex mb-8 space-x-2">
							<PurchaseButton
								address={address}
								event={event}
								className="btn-basic"
								onBeforePurchase={() => setSuccess(undefined)}
								onSuccess={() => {
									setSuccess(true);
									setRefreshEvent(!refreshEvent);
								}}
								onLocked={() => setLocked(true)}
								quantityRemaining={event.remaining || 0}
							/>
							{
								address && resaleTokens.length > 0 &&
								<Link to={routes.eventResale(Number(id))} type="button" className="btn btn-basic">
									View Resale
								</Link>
							}
						</div>
						<div className="mb-8 text-lg">
							{event.description}
						</div>
						<div className="flex-wrap flex">
							{event.genres.map(genre => <GenrePill name={genre} key={genre} className="my-1 mr-2" />)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const PurchaseButton = (props: {
	className?: string,
	address: string | null,
	event: Event,
	onBeforePurchase: () => any,
	onSuccess: () => any,
	onLocked: () => any,
	quantityRemaining: number
}) => {
	const [quantity, setQuantity] = useState(1);
	const [disabled, setDisabled] = useState(false);

	if (!props.address) {
		return <ConnectWallet className={props.className} onLocked={() => props.onLocked()} />;
	}
	
	if (props.quantityRemaining <= 0) {
		return (
			<button
				className={"btn btn-basic " + props.className}
				disabled={true}
			>
				Sold Out
			</button>
		);
	}

	const purchase = async () => {
		props.onBeforePurchase();
		setDisabled(true);

		try {
			const contract = await getInstance();

			await contract
				.methods
				.buyToken(props.event.id, quantity)
				.send({
					from: props.address,
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
			quantity={Math.min(6, props.quantityRemaining)}
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
