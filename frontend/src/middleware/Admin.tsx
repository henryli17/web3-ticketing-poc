import React, { useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { login } from "../helpers/api";

const Admin = () => {
	const [admin, setAdmin] = useState(false);

	useEffect(() => {
		login()
			.then(() => setAdmin(true))
			.catch(() => setAdmin(false))
		;
	}, []);

	return <Outlet context={[admin, setAdmin]} />;
};

export const useAdmin = () => {
	return useOutletContext<[boolean, React.Dispatch<React.SetStateAction<boolean>>]>();
}

export default Admin;
