import './index.scss';
import { Navigate, Route, Routes } from "react-router-dom";
import routes from "./routes"
import HomeView from "./views/HomeView";
import Wallet from './middleware/Wallet';
import ShowNavBar from './middleware/ShowNavBar';
import SingleEventView from './views/SingleEventView';

const App = () => {
  	return (
		<>
			<Routes>
				<Route element={<Wallet />}>
					<Route element={<ShowNavBar />}>
						<Route path={routes.home()} element={<HomeView />} />
						<Route path={routes.event()} element={<SingleEventView />} />
						<Route path="*" element={<Navigate to={routes.home()} replace />} />
					</Route>
				</Route>
			</Routes>
		</>
	);
}

export default App;
