import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NotFound from "../components/NotFound";
import { getResaleTokens, ResaleToken } from "../helpers/contract";
import { useAddressState } from "../middleware/Wallet";

const SingleEventResaleView = () => {
	const { id } = useParams();
	const [resaleTokens, setResaleTokens] = useState<ResaleToken[]>([]);
	const [address] = useAddressState();
	const [error, setError] = useState(false);

	useEffect(() => {
		getResaleTokens(Number(id))
			.then(resaleTokens => {
				setResaleTokens(
					resaleTokens.filter(r => !r.sold && r.owner !== address)
				)
			})
			.catch(() => setError(true))
		;
	}, [id, address]);

	if (error) {
		return <NotFound />;
	}

	return (
		<div>
			{
				resaleTokens.map((resaleToken, i) => {
					return (
						<div key={i}>
							{resaleToken.owner}
						</div>
					);
				})
			}
		</div>
	);
};

export default SingleEventResaleView;
