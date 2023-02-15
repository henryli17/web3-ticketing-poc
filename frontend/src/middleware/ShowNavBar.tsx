import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";

const ShowNavBar = () => {
	return (
		<>
			<NavBar />
			<Outlet />
		</>
	);
};

export default ShowNavBar;
