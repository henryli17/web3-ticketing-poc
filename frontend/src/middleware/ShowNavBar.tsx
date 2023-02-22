import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useAddress } from "./Wallet";

const ShowNavBar = () => {
	return (
		<>
			<NavBar />
			<Outlet context={useAddress()} />
		</>
	);
};

export default ShowNavBar;
