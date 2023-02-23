import { Navigate } from "react-router-dom";
import routes from "../routes";
import { useAdmin } from "./Admin";

const RequireAdmin = ({ redirect: Redirect }: { redirect: React.FC }) => {
	const [admin] = useAdmin();

	if (!admin) {
		return <Navigate to={routes.admin.login()} replace />;
	}

	return <Redirect />;
}; 

export default RequireAdmin;
