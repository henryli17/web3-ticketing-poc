import { useEffect, useState } from "react";
import { ArrowRightShort } from "react-bootstrap-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../helpers/api";
import { useAdmin } from "../middleware/Admin";
import routes from "../routes";

const AdminLoginView = () => {
	const { state } = useLocation();
	const [admin, setAdmin] = useAdmin();
	const [password, setPassword] = useState("");
	const [error, setError] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		login()
			.then(() => setAdmin(true))
			.catch(() => setAdmin(false))
		;
	}, [setAdmin])

	useEffect(() => {
		if (admin) {
			navigate(
				state?.next || routes.admin.events(),
				{ replace: true }
			);
		}
	}, [admin, navigate, state]);
	
	const submit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		login(password)
			.then(() => setAdmin(true))
			.catch(() => setError(true))
		;
	};

	return (
		<div className="container mx-auto h-screen flex justify-center items-center">
			<form className="text-gray-600" onSubmit={e => submit(e)}>
				<label className="text-xs uppercase  mx-1">Admin Login</label>
				<div className="flex items-center relative w-60">
					<input
						type="password"
						className="input pr-9 shadow-sm"
						placeholder="Password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						autoComplete="off"
					/>
					<button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center">
						<ArrowRightShort />
					</button>
				</div>
				<div className={"text-red-700 uppercase text-xs my-1 mx-1 pointer-events-0 " + (error ? "opacity-1" : "opacity-0")}>
					Incorrect Password
				</div>
			</form>
		</div>
	);
};

export default AdminLoginView;
