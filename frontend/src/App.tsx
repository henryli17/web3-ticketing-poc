import './App.css';
import { Navigate, Route, Routes } from "react-router-dom";
import routes from "./routes"
import HomeView from "./views/HomeView";

const App = () => {
  	return (
		<>
			<Routes>
				<Route path={routes.home} element={<HomeView />} />
				<Route path="*" element={<Navigate to={routes.home} replace />} />
			</Routes>
		</>
	);
}

export default App;
