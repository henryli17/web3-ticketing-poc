import { useEffect, useState } from "react";
import NotFound from "../components/NotFound";
import PurchaseCard from "../components/PurchaseCard";
import { getPurchases, Purchase } from "../helpers/api";
import { useAddressState } from "../middleware/Wallet";

enum PurchaseType {
	UPCOMING = "upcoming",
	SELLING = "selling",
	EXPIRED = "expired"
};

const PurchasesView = () => {
	const [error, setError] = useState(false);
	const [address] = useAddressState();
	const [purchaseData, setPurchaseData] = useState<PurchaseData>(emptyPurchaseData());
	const [updatePurchases, setUpdatePurchases] = useState(false);
	const [purchaseType, setPurchaseType] = useState<PurchaseType>(PurchaseType.UPCOMING)

	useEffect(() => {
		getPurchases(address)
			.then(purchases => {
				const purchaseData = emptyPurchaseData();

				for (const purchase of purchases) {
					if (purchase.expired) {
						purchaseData.expired.push(purchase);
					} else if (purchase.forSale) {
						purchaseData.selling.push(purchase);
					} else {
						purchaseData.upcoming.push(purchase);
					}
				}

				setPurchaseData(purchaseData);
			})
			.catch(() => setError(true))
		;
	}, [address, updatePurchases]);

	if (error) {
		return <NotFound />;
	}


	return (
		<div className="container mx-auto py-16 px-10 space-y-3">
			<div className="flex space-x-5 mb-5">
				{
					Object.values(PurchaseType)
						.filter(purchaseType => purchaseData[purchaseType].length) // Do not show tabs with no items
						.map((type, i) => {
							const border = (type === purchaseType) ? "border-indigo-500" : "border-transparent";

							return (
								<button
									type="button"
									key={i}
									onClick={() => setPurchaseType(type)}
									className={"menu-tab capitalize " + border}
								>
									{type}
								</button>
							);
						})
				}
			</div>
			{
				purchaseData[purchaseType].map((purchase, i) => {
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

type PurchaseData = {
	expired: Purchase[],
	upcoming: Purchase[],
	selling: Purchase[]
};

const emptyPurchaseData = (): PurchaseData => {
	return { expired: [], upcoming: [], selling: [] };
};

export default PurchasesView;
