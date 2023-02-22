import { useEffect, useState } from "react";
import NotFound from "../components/NotFound";
import PurchaseCard from "../components/PurchaseCard";
import { getPurchases, Purchase } from "../helpers/api";
import { useAddress } from "../middleware/Wallet";

enum PurchaseType {
	UPCOMING = "upcoming",
	SELLING = "selling",
	EXPIRED = "expired"
};

const PurchasesView = () => {
	const [error, setError] = useState(false);
	const [address] = useAddress();
	const [purchaseData, setPurchaseData] = useState<PurchaseData>();
	const [updatePurchases, setUpdatePurchases] = useState(false);
	const [purchaseType, setPurchaseType] = useState<PurchaseType>(PurchaseType.UPCOMING);
	const [hasPurchases, setHasPurchases] = useState(false);

	useEffect(() => {
		getPurchases(address)
			.then(purchases => {
				const purchaseData: PurchaseData = { expired: [], upcoming: [], selling: [] };

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
	
	useEffect(() => {
		if (!purchaseData) {
			return;
		}

		if (purchaseData[purchaseType].length) {
			setHasPurchases(true);
			return;
		}

		// If the selected purchase type has no data, try to select one that does
		for (const type of Object.values(PurchaseType)) {
			if (purchaseData[type].length) {
				setPurchaseType(_ => type);
				return;
			}
		}

		// All purchase types had no data
		setHasPurchases(false);
	}, [purchaseData, purchaseType])

	if (error) {
		return <NotFound />;
	}

	if (!purchaseData) {
		return <></>;
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
				!hasPurchases &&
				<h2 className="px-10">We didn't find any purchases yet.</h2>
			}
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

export default PurchasesView;
