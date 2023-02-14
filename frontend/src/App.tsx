import './index.scss';
import { Navigate, Route, Routes } from "react-router-dom";
import routes from "./routes"
import HomeView from "./views/HomeView";
import WalletMiddleware from './middleware/WalletMiddleware';

const App = () => {
  	return (
		<>
			<Routes>
				<Route element={<WalletMiddleware />}>
					<Route path={routes.home} element={<HomeView />} />
					<Route path="*" element={<Navigate to={routes.home} replace />} />
				</Route>
			</Routes>
		</>
	);
}

export default App;
