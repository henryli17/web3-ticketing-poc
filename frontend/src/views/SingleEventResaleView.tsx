import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "../components/Alert";
import BackCaret from "../components/BackCaret";
import PageError from "../components/PageError";
import Spinner from "../components/Spinner";
import { Event, getEvent } from "../helpers/api";
import { ResaleToken, getInstance, getResaleTokens } from "../helpers/contract";
import { gweiToEth, gweiToWei } from "../helpers/utils";
import { useAddress } from "../middleware/Wallet";
import routes from "../routes";

const SingleEventResaleView = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<Event>();
  const [resaleTokens, setResaleTokens] = useState<ResaleToken[]>([]);
  const [address] = useAddress();
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState<boolean>();
  const [updateResaleTokens, setUpdateResaleTokens] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!address) {
      return;
    }

    getResaleTokens(Number(id))
      .then((resaleTokens) => {
        const r = resaleTokens.filter((r) => !r.sold && r.owner !== address);

        if (r.length > 0) {
          setResaleTokens(r);
        } else {
          navigate(routes.event(Number(id)), { replace: true });
        }
      })
      .catch(() => setError(true));
  }, [id, address, updateResaleTokens, navigate]);

  useEffect(() => {
    getEvent(Number(id))
      .then(setEvent)
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return <PageError />;
  }

  if (!event || !address) {
    return null;
  }

  return (
    <div className="container mx-auto p-10">
      <BackCaret to={routes.event(Number(id))} />
      <div>
        <h1 className="italic uppercase font-bold">{event.artist}</h1>
        <div className="text-2xl mb-8 italic">{event.name}</div>
        <div className="text-2xl uppercase font-bold">Price</div>
        <h2 className="font-bold text-indigo-500 mb-8">
          {gweiToEth(event.price)} ETH
        </h2>
      </div>
      {success && (
        <Alert
          title="Nice!"
          message="Your tickets were successfully purchased!"
          className="bg-green-50 text-green-800"
        />
      )}
      <div className="divide-y divide-gray-300">
        {resaleTokens.map((resaleToken, i) => {
          return (
            <ResaleListing
              key={i}
              event={event}
              resaleToken={resaleToken}
              address={address}
              onBeforePurchase={() => setSuccess(undefined)}
              onPurchaseSuccess={() => {
                setSuccess(true);
                setUpdateResaleTokens(!updateResaleTokens);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const ResaleListing = (props: {
	event: Event,
	resaleToken: ResaleToken,
	address: string,
	onBeforePurchase: () => any,
	onPurchaseSuccess: () => any
}) => {
	const [disabled, setDisabled] = useState(false);

	const purchase = async () => {
		props.onBeforePurchase();
		setDisabled(true);

		try {
			const instance = await getInstance();

			await instance
				.methods
				.buyResaleToken(props.resaleToken.owner, Number(props.event.id))
				.send({ from: props.address, value: gweiToWei(props.event.price) })
			;

			props.onPurchaseSuccess();
		} catch (e) {
			console.error(e);
		}

		setDisabled(false);
	};

	return (
		<div className="grid grid-cols-12 py-4 items-center">
			<div className="flex space-x-3 items-center col-span-12 md:col-span-10">
				<div className="uppercase font-medium text-sm bg-indigo-500 text-white py-1 px-2">
					Resale
				</div>
				<div className="break-words w-3/5">
					{props.resaleToken.owner}
				</div>
			</div>
			<div className="col-span-12 md:col-span-2 flex">
				<button
					className="ml-auto btn btn-basic md:w-fit w-full mt-3 md:mt-0"
					type="button"
					disabled={disabled}
					onClick={() => purchase()}
				>
					{disabled && <Spinner />}
					Purchase
				</button>
			</div>
		</div>
	);
};

export default SingleEventResaleView;
