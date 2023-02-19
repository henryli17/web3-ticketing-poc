import { useEffect, useState } from "react";
import NotFound from "../components/NotFound";
import PurchaseCard from "../components/PurchaseCard";
import { getEvents, Event } from "../helpers/api";
import { getTokens } from "../helpers/contract";
import { useAddressState } from "../middleware/Wallet";

const PurchasesView = () => {
	const [error, setError] = useState(false);
	const [address] = useAddressState();
	const [purchases, setPurchases] = useState<Purchase[]>([]);

	useEffect(() => {
		const updatePurchases = async () => {
			try {
				const tokens = await getTokens(address);
				const events = await getEvents({ id: Array.from(tokens.keys()) });
				const eventsById = new Map();
				const purchases = [];

				for (const event of events) {
					eventsById.set(event.id, event);
				}

				for (const [eventId, quantity] of tokens.entries()) {
					purchases.push({
						event: eventsById.get(eventId),
						quantity: quantity
					});
				}

				setPurchases(purchases);
			} catch (e) {
				setError(true);
			}
		};

		updatePurchases();
	}, [address]);

	if (error) {
		return <NotFound />;
	}

	return (
		<div className="container mx-auto py-16 px-10">
			{purchases.map(purchase => <PurchaseCard key={purchase.event.id} event={purchase.event} quantity={purchase.quantity} />)}
		</div>
	);
};

type Purchase = {
	event: Event,
	quantity: number
}

export default PurchasesView;
