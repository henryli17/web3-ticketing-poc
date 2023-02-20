import { useEffect, useState } from "react";
import LoadingCard from "../components/LoadingCard";
import NotFound from "../components/NotFound";
import PurchaseCard from "../components/PurchaseCard";
import { getPurchases, Purchase } from "../helpers/api";
import { useAddressState } from "../middleware/Wallet";

const PurchasesView = () => {
	const [error, setError] = useState(false);
	const [address] = useAddressState();
	const [purchases, setPurchases] = useState<Purchase[] | null>(null);
	const [updatePurchases, setUpdatePurchases] = useState(false);

	useEffect(() => {
		getPurchases(address)
			.then(setPurchases)
			.catch(() => setError(true))
		;
	}, [address, updatePurchases]);

	if (error) {
		return <NotFound />;
	}

	return (
		<div className="container mx-auto py-16 px-10 space-y-3">
			{!purchases && <LoadingCard className="h-40" />}
			{
				purchases &&
				purchases.map((purchase, i) => {
					return (
						<PurchaseCard
							key={i}
							purchase={purchase}
							onChange={() => setUpdatePurchases(!updatePurchases)}
						/>
					);
				})
			}
		</div>
	);
};

export default PurchasesView;
