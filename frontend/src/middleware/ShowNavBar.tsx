import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useAddressState } from "./Wallet";

const ShowNavBar = () => {
	return (
		<>
			<NavBar />
			<Outlet context={useAddressState()} />
		</>
	);
};

export default ShowNavBar;
