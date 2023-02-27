import { Link } from "react-router-dom";
import routes from "../routes";

const PageError = () => {
	return (
		<div className="text-center my-24">
			<h1 className="font-bold text-red-600 mb-3">Oops!</h1>
			<div>
				Something went wrong whilst trying to process your request.
			</div>
			<div className="mb-3">
				Please contact support if this issue persists.
			</div>
			<div className="flex justify-center">
				<Link className="btn w-fit text-red-600 hover:text-red-800" to={routes.home()}>Go Home</Link>
			</div>
		</div>
	);
};

export default PageError;
