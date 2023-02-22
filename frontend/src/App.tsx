import './index.scss';
import { Navigate, Route, Routes } from "react-router-dom";
import routes from "./routes"
import HomeView from "./views/HomeView";
import Wallet from './middleware/Wallet';
import ShowNavBar from './middleware/ShowNavBar';
import SingleEventView from './views/SingleEventView';
import EventsView from './views/EventsView';
import PurchasesView from './views/PurchasesView';
import RequireWallet from './middleware/RequireWallet';
import SingleEventResaleView from './views/SingleEventResaleView';
import AdminLoginView from './views/AdminLoginView';

const App = () => {
  	return (
		<>
			<Routes>
				<Route element={<Wallet />}>
					<Route element={<ShowNavBar />}>
						<Route path={routes.home()} element={<HomeView />} />
						<Route path={routes.events()} element={<EventsView />} />
						<Route path={routes.event()} element={<SingleEventView />} />
						<Route path={routes.eventResale()} element={<RequireWallet Redirect={SingleEventResaleView} />} />
						<Route path={routes.purchases()} element={<RequireWallet Redirect={PurchasesView} />} />
						<Route path="*" element={<Navigate to={routes.home()} replace />} />
					</Route>
				</Route>
				<Route path={routes.admin.login()} element={<AdminLoginView />} />
			</Routes>
		</>
	);
}

export default App;
