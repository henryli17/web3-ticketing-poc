import { Navigate } from "react-router-dom";
import routes from "../routes";
import { useAddress } from "./Wallet";

const RequireWallet = ({ redirect: Redirect }: { redirect: React.FC }) => {
	const [address] = useAddress();

	// Still attempting to connect to wallet
	if (address === null) {
		return <></>;
	}
	
	// Wallet present, but not connected
	if (!address.length) {
		return <Navigate to={routes.home()} replace />;
	}

	return <Redirect />;
}; 

export default RequireWallet;
