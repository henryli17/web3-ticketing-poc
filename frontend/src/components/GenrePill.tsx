import { Link } from "react-router-dom";
import routes from "../routes";

const GenrePill = (props: { name: string, className?: string }) => {
	return (
		<Link to={`${routes.events()}?genres=${encodeURIComponent(props.name)}`} className={props.className}>
			<div className="rounded-full bg-indigo-500 uppercase text-white px-5 py-1 h-8 whitespace-nowrap">
				{props.name}
			</div>
		</Link>
	);
};

export default GenrePill;
