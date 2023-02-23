import { X } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { Event } from "../helpers/api";
import { gweiToEth, prettyDate } from "../helpers/utils";
import routes from "../routes";

const EventCard = (props: {
	event: Event,
	className?: string,
	to?: string,
	quantity?: number,
	children?: React.ReactNode
}) => {
	return (
		<Link to={props.to || routes.event(props.event.id)} className={"card flex w-full " + props.className}>
			<div className="my-auto grid grid-cols-12 w-full">
				<div className="col-span-12 lg:col-span-9 xl:col-span-10 flex">
					<img className="rounded shadow-lg m-5 hidden sm:block" src={props.event.imageUrl} alt={props.event.artist} width={100} />
					<div className="my-5 mx-5 sm:mr-5 sm:ml-0 text-left w-full flex">
						<div className="my-auto w-full">
							<div className="italic mb-2">
								<h2 className="font-bold uppercase mr-2">
									{props.event.artist}
								</h2>
								<div className="text-xl">
									{props.event.name}
								</div>
							</div>
							<div className="text-xl font-bold text-indigo-500 flex items-center">
								{
									props.quantity &&
									<>
										{props.quantity} <X />
									</>
								}
								{gweiToEth(props.event.price)} ETH
							</div>
							<div className="text-md block">
								{props.event.venue} · {props.event.city} · {prettyDate(props.event.time)}
							</div>
						</div>
					</div>
				</div>
				{props.children}
			</div>
		</Link>
	);
};

export default EventCard;
