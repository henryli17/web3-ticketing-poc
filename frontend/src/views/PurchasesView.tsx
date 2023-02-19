import { useEffect, useState } from "react";
import NotFound from "../components/NotFound";
import PurchaseCard from "../components/PurchaseCard";
import { getPurchases, Purchase } from "../helpers/api";
import { useAddressState } from "../middleware/Wallet";

const PurchasesView = () => {
	const [error, setError] = useState(false);
	const [address] = useAddressState();
	const [purchases, setPurchases] = useState<Purchase[]>([]);

	useEffect(() => {
		getPurchases(address)
			.then(setPurchases)
			.catch(() => setError(true))
		;
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

export default PurchasesView;
