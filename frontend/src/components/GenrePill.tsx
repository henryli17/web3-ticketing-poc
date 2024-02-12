import { Link } from "react-router-dom";
import routes from "../routes";

const GenrePill = (props: { name: string; className?: string }) => {
    return (
        <Link
            to={`${routes.events()}?genres=${encodeURIComponent(props.name)}`}
            className={props.className}
        >
            <div className="h-8 whitespace-nowrap rounded-full bg-indigo-500 px-5 py-1 uppercase text-white">
                {props.name}
            </div>
        </Link>
    );
};

export default GenrePill;
