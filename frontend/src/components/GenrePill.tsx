import { Link } from "react-router-dom";
import routes from "../routes";

const GenrePill = (props: { name: string }) => {
	return (
		<Link to={`${routes.events()}?genres=${encodeURIComponent(props.name)}`}>
			<div className="rounded-full bg-indigo-500 uppercase text-white px-5 py-1">
				{props.name}
			</div>
		</Link>
	);
};

export default GenrePill;
