import { Navigate } from "react-router-dom";
import routes from "../routes";
import { useAddressState } from "./Wallet";

const RequireWallet = ({ Redirect }: { Redirect: React.FC }) => {
    const [address] = useAddressState();

    if (address === null) {
        return <></>;
    }
	
	if (!address.length) {
		return <Navigate to={routes.home()} replace />;
	}

	return <Redirect />;
}; 

export default RequireWallet;
