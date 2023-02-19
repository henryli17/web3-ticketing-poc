import { Link } from "react-router-dom";
import Web3 from "web3";
import {  Purchase } from "../helpers/api";
import { prettyDate } from "../helpers/utils";
import routes from "../routes";
import SellButton from "./SellButton";

const PurchaseCard = (props: { purchase: Purchase, className?: string }) => {
	return (
		<Link to={routes.event(props.purchase.event.id)} className={"card flex w-full " + props.className}>
			<div className="my-auto grid grid-cols-12 w-full">
				<div className="col-span-12 lg:col-span-9 xl:col-span-10 flex">
					<img className="rounded shadow-lg m-5 hidden sm:block" src={props.purchase.event.imagePath} alt={props.purchase.event.artist} width={100} />
					<div className="my-5 mx-5 sm:mr-5 sm:ml-0 text-left w-full flex">
						<div className="my-auto w-full">
							<div className="italic mb-2">
								<h2 className="font-bold uppercase mr-2">
									{props.purchase.event.artist}
								</h2>
								<div className="text-xl">
									{props.purchase.event.name}
								</div>
							</div>
							<div className="text-xl font-bold text-indigo-500">
								{Web3.utils.fromWei((props.purchase.event.price * props.purchase.quantity).toString(), "gwei")} ETH
							</div>
							<div className="text-md block">
								{props.purchase.event.venue} · {props.purchase.event.city} · {prettyDate(props.purchase.event.time)}
							</div>
						</div>
					</div>
				</div>
				<div className="col-span-12 lg:col-span-3 xl:col-span-2 mb-5 lg:mt-5 mx-5 mr-5 flex">
					<div className="lg:ml-auto">
						<SellButton
							eventId={props.purchase.event.id}
							quantity={props.purchase.quantity}
							onClick={(e) => { console.log(e); e.preventDefault(); e.stopPropagation(); return false; }}
						/>
					</div>
				</div>
			</div>
		</Link>
	);
};

export default PurchaseCard;
