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
	children?: React.ReactNode,
	used?: number
}) => {
	return (
		<Link to={props.to || routes.event(props.event.id)} className={"card flex w-full py-5 px-5 " + props.className}>
			<div className="my-auto grid grid-cols-12 w-full">
				<div className="col-span-12 lg:col-span-8 xl:col-span-9 flex items-center">
					<img className="rounded shadow-lg hidden sm:block thumbnail mr-5" src={props.event.imageUrl} alt={props.event.artist} />
					<div className="text-left w-full flex">
						<div className="my-auto w-full">
							<div className="italic mb-2">
								<h2 className="font-bold uppercase mr-2">
									{props.event.artist}
								</h2>
								<div className="text-xl">
									{props.event.name}
								</div>
							</div>
							<div className="text-xl font-bold text-indigo-500 flex flex-wrap items-center mb-0.5">
								<div className="flex items-center mr-2">
									{
										props.quantity &&
										<>
											{props.quantity} <X />
										</>
									}
									{gweiToEth(props.event.price)} ETH
								</div>
								{
									!!props.used && props.used > 0 &&
									<div className="text-indigo-500 font-medium text-xs uppercase">
										[{props.used} Used]
									</div>
								}
							</div>
							<div className="text-md block capitalize">
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
