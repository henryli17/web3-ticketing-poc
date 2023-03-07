import { Navigate, Route, Routes } from "react-router-dom";
import './index.scss';
import Admin from './middleware/Admin';
import RequireAdmin from './middleware/RequireAdmin';
import RequireWallet from './middleware/RequireWallet';
import ShowNavBar from './middleware/ShowNavBar';
import Wallet from './middleware/Wallet';
import routes from "./routes";
import AdminCreateEditEventView from './views/AdminCreateEditEventView';
import AdminEventsView from './views/AdminEventsView';
import AdminLoginView from './views/AdminLoginView';
import AdminQrScanView from './views/AdminQrScanView';
import EventsView from './views/EventsView';
import HomeView from "./views/HomeView";
import PurchasesView from './views/PurchasesView';
import SingleEventResaleView from './views/SingleEventResaleView';
import SingleEventView from './views/SingleEventView';

const App = () => {
  	return (
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
	);
}

export default App;
