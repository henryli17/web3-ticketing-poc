import { Link } from "react-router-dom";
import routes from "../routes";

const NotFound = () => {
	return (
		<div className="text-center my-24">
			<h1 className="font-bold text-red-600">404</h1>
			<div>
				Oops! Page not found.
			</div>
			<div className="mb-3">
				The page you're looking for doesn't exist.
			</div>
			<div className="flex justify-center">
				<Link className="btn btn-basic w-fit" to={routes.home()}>Go Home</Link>
			</div>
		</div>
	);
};

export default NotFound;
