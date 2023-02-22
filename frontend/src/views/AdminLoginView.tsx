import { useState } from "react";
import { ArrowRightShort } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { login } from "../helpers/api";

const AdminLoginView = () => {
	const [password, setPassword] = useState("");
	const [error, setError] = useState(false);
	const navigate = useNavigate();
	
	const submit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			await login(password);
			setError(false);
		} catch (e) {
			setError(true);
		}
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