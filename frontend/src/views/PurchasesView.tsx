import { useEffect, useState } from "react";
import NotFound from "../components/NotFound";
import { getTokens } from "../helpers/contract";
import { useAddressState } from "../middleware/Wallet";

const PurchasesView = () => {
	const [error, setError] = useState(false);
	const [address] = useAddressState();
	const [purchases, setPurchases] = useState<Map<Number, Number>>(new Map());

	useEffect(() => {
		getTokens(address)
			.then(setPurchases)
			.catch(() => setError(true))
		;
	}, [address]);

	if (error) {
		return <NotFound />;
	}

	return (
		<div onClick={() => console.log(purchases)}>
			Hi
		</div>
	);
};

export default PurchasesView;
