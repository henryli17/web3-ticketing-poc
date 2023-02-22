import { Navigate } from "react-router-dom";
import routes from "../routes";
import { useAddress } from "./Wallet";

const RequireWallet = ({ Redirect }: { Redirect: React.FC }) => {
    const [address] = useAddress();

    if (address === null) {
        return <></>;
    }
	
	if (!address.length) {
		return <Navigate to={routes.home()} replace />;
	}

	return <Redirect />;
}; 

export default RequireWallet;
