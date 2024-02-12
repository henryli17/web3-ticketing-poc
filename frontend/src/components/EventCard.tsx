import { X } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { Event } from "../helpers/api";
import { gweiToEth, prettyDate } from "../helpers/utils";
import routes from "../routes";

const EventCard = (props: {
    event: Event;
    className?: string;
    to?: string;
    quantity?: number;
    children?: React.ReactNode;
    used?: number;
}) => {
    return (
        <Link
            to={props.to || routes.event(props.event.id)}
            className={"card flex w-full py-5 px-5 " + props.className}
        >
            <div className="my-auto grid w-full grid-cols-12">
                <div className="col-span-12 flex items-center lg:col-span-8 xl:col-span-9">
                    <img
                        className="thumbnail mr-5 hidden rounded shadow-lg sm:block"
                        src={props.event.imageUrl}
                        alt={props.event.artist}
                    />
                    <div className="flex w-full text-left">
                        <div className="my-auto w-full">
                            <div className="mb-2 italic">
                                <h2 className="mr-2 font-bold uppercase">
                                    {props.event.artist}
                                </h2>
                                <div className="text-xl">
                                    {props.event.name}
                                </div>
                            </div>
                            <div className="mb-0.5 flex flex-wrap items-center text-xl font-bold text-indigo-500">
                                <div className="mr-2 flex items-center">
                                    {props.quantity && (
                                        <>
                                            {props.quantity} <X />
                                        </>
                                    )}
                                    {gweiToEth(props.event.price)} ETH
                                </div>
                                {!!props.used && props.used > 0 && (
                                    <div className="text-xs font-medium uppercase text-indigo-500">
                                        [{props.used} Used]
                                    </div>
                                )}
                            </div>
                            <div className="text-md block capitalize">
                                {props.event.venue} · {props.event.city} ·{" "}
                                {prettyDate(props.event.time)}
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
