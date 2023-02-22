import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NotFound from "../components/NotFound";
import { getEvent, Event } from "../helpers/api";
import { getResaleTokens, ResaleToken } from "../helpers/contract";
import { gweiToEth } from "../helpers/utils";
import { useAddressState } from "../middleware/Wallet";

const SingleEventResaleView = () => {
	const { id } = useParams();
	const [event, setEvent] = useState<Event>();
	const [resaleTokens, setResaleTokens] = useState<ResaleToken[]>([]);
	const [address] = useAddressState();
	const [error, setError] = useState(false);

	useEffect(() => {
		getResaleTokens(Number(id))
			.then(resaleTokens => {
				const r = resaleTokens.filter(r => !r.sold && r.owner !== address);

				if (r.length > 0) {
					setResaleTokens(r);
				} else {
					setError(true);
				}
			})
			.catch(() => setError(true))
		;

		getEvent(Number(id))
			.then(setEvent)
			.catch(() => setError(true))
		;
	}, [id, address]);

	if (error) {
		return <NotFound />;
	}

	if (!event) {
		return <></>;
	}

	return (
		<div className="container mx-auto p-10">
			<div>
				<h1 className="italic uppercase font-bold">
					{event.artist}
				</h1>
				<div className="text-2xl mb-8 italic">
					{event.name}
				</div>
				<div className="text-2xl uppercase font-bold">
					Price
				</div>
				<h2 className="font-bold text-indigo-500 mb-8">
					{gweiToEth(event.price)} ETH
				</h2>
			</div>
			<div className="divide-y divide-gray-300">
				{
					resaleTokens.map((resaleToken, i) => {
						return (
							<div key={i} className="grid grid-cols-12 py-4 items-center">
								<div className="flex space-x-3 items-center col-span-12 md:col-span-10">
									<div className="uppercase font-medium text-sm bg-indigo-500 text-white py-1 px-2">
										Resale
									</div>
									<div className="break-words w-3/5">
										{resaleToken.owner}
									</div>
								</div>
								<div className="col-span-12 md:col-span-2 flex">
									<button className="ml-auto btn btn-basic md:w-fit w-full mt-3 md:mt-0">
										Purchase
									</button>
								</div>
							</div>
						);
					})
				}
			</div>
		</div>
	);
};

export default SingleEventResaleView;
