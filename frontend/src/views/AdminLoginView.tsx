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
            .catch(() => setAdmin(false));
    }, [setAdmin]);

    useEffect(() => {
        if (admin) {
            navigate(state?.next || routes.admin.events(), { replace: true });
        }
    }, [admin, navigate, state]);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        login(password)
            .then(() => setAdmin(true))
            .catch(() => setError(true));
    };

    return (
        <div className="container mx-auto flex h-screen items-center justify-center">
            <form className="text-gray-600" onSubmit={(e) => submit(e)}>
                <label className="mx-1 text-xs  uppercase">Admin Login</label>
                <div className="relative flex w-60 items-center">
                    <input
                        type="password"
                        className="input pr-9 shadow-sm"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                        <ArrowRightShort />
                    </button>
                </div>
                <div
                    className={
                        "pointer-events-0 my-1 mx-1 text-xs uppercase text-red-700 " +
                        (error ? "opacity-1" : "opacity-0")
                    }
                >
                    Incorrect Password
                </div>
            </form>
        </div>
    );
};

export default AdminLoginView;
