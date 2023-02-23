import React, { useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";

const Admin = () => <Outlet context={useState(false)} />;

export const useAdmin = () => {
	return useOutletContext<[boolean, React.Dispatch<React.SetStateAction<boolean>>]>();
}

export default Admin;
