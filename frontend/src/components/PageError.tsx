import { useNavigate } from "react-router-dom";
import { ETH_NETWORK } from "../helpers/contract";

const PageError = () => {
	const navigate = useNavigate();

	return (
		<div className="text-center my-24 mx-5">
			<h1 className="font-bold text-red-600 mb-3">Oops!</h1>
			<div>
				Something went wrong whilst trying to process your request.
			</div>
			<div className="mb-3">
				Please ensure MetaMask is connected to the {ETH_NETWORK} network.
			</div>
			<div className="flex justify-center">
				<button type="button" className="btn w-fit text-red-600 hover:text-red-800" onClick={() => navigate(0)}>
					Try Again
				</button>
			</div>
		</div>
	);
};

export default PageError;
