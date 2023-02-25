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
import Admin from './middleware/Admin';
import AdminEventsView from './views/AdminEventsView';
import RequireAdmin from './middleware/RequireAdmin';
import AdminCreateEditEventView from './views/AdminCreateEditEventView';
import AdminQrScanView from './views/AdminQrScanView';

const App = () => {
  	return (
		<>
			<Routes>
				<Route element={<Wallet />}>
					<Route element={<ShowNavBar />}>
						<Route path={routes.home()} element={<HomeView />} />
						<Route path={routes.events()} element={<EventsView />} />
						<Route path={routes.event()} element={<SingleEventView />} />
						<Route path={routes.eventResale()} element={<RequireWallet redirect={SingleEventResaleView} />} />
						<Route path={routes.purchases()} element={<RequireWallet redirect={PurchasesView} />} />
						<Route path="*" element={<Navigate to={routes.home()} replace />} />
					</Route>
				</Route>
				<Route element={<Admin />}>
					<Route path={routes.admin.login()} element={<AdminLoginView />} />
					<Route path={routes.admin.events()} element={<RequireAdmin redirect={AdminEventsView} />} />
					<Route path={routes.admin.event()} element={<RequireAdmin redirect={AdminCreateEditEventView} />} />
					<Route path={routes.admin.qr()} element={<RequireAdmin redirect={AdminQrScanView} />} />
				</Route>
			</Routes>
		</>
	);
}

export default App;
