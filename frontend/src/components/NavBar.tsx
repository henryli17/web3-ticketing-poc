import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAddressState } from "../middleware/Wallet";
import routes from "../routes";
import ConnectWallet from "./ConnectWallet";
import SearchBar from "./SearchBar";

const NavBar = () => {
	const navigate = useNavigate();
	const [address] = useAddressState();
	const [mobileMenuHidden, setMobileMenuHidden] = useState(true);
	const [navEntries, setNavEntries] = useState<NavEntry[]>(allNavEntries);
	const mobileMenuClasses = (mobileMenuHidden) ? "hidden" : "";

	useEffect(() => {
		const navEntries = allNavEntries
			.filter(navEntry => address || !navEntry.requiresWallet)
			.map(navEntry => { 
				return {
					...navEntry,
					active: window.location.pathname === navEntry.location
				};
			})
		;

		setNavEntries(navEntries);
	}, [navigate, address]);

	return (
		<nav className="bg-white drop-shadow">
			<div className="mx-auto px-2 sm:px-6 lg:px-8">
				<div className="relative flex h-16 items-center justify-between">
					<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
						<button
							type="button"
							onClick={() => setMobileMenuHidden(!mobileMenuHidden)}
							className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
						>
							<svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
							</svg>
						</button>
					</div>
					<div className="flex flex-1 justify-center sm:justify-start h-full">
						<div className="flex flex-shrink-0 items-center">
							<img className="block h-8 w-auto" src="https://ethereum.org/static/a183661dd70e0e5c70689a0ec95ef0ba/13c43/eth-diamond-purple.png" alt="Ethereum Logo" />
						</div>
						<div className="hidden sm:ml-6 sm:block justify-center">
							<div className="flex space-x-4 h-full">
								{navEntries.map((navEntry, i) => <Tab key={i} navEntry={navEntry} />)}
							</div>
						</div>
					</div>
					<div className="pr-2 sm:pr-0 hidden sm:flex items-center">
						<SearchBar />
						<ConnectWallet className="ml-3" />
					</div>
				</div>
			</div>
			<div className={"sm:hidden " + mobileMenuClasses}>
				<div className="pt-2 pb-3">
					<SearchBar className="mx-2 mb-2" />
					<div className="flex mx-2 mb-3">
						<ConnectWallet className="w-full"/>
					</div>
					{navEntries.map((navEntry, i) => <MobileTab key={i} navEntry={navEntry} />)}
				</div>
			</div>
		</nav>
	);
};

interface NavEntry {
	location: string,
	text: string,
	active: boolean,
	requiresWallet: boolean
};

const allNavEntries = [
	{ location: routes.home(), text: "Home", active: false, requiresWallet: false },
	{ location: routes.events(), text: "Events", active: false, requiresWallet: false },
	{ location: routes.purchases(), text: "Purchases", active: false, requiresWallet: true }
];

const Tab = (props: { navEntry: NavEntry }) => {
	const borderColour = (props.navEntry.active) ? "border-indigo-500" : "border-transparent";

	return (
		<button className={"border-b-2 h-full " + borderColour}>
			<Link to={props.navEntry.location} className="text-gray-800 px-3 py-2 text-sm font-medium h-full">
				{props.navEntry.text}
			</Link>
		</button>
	);
};

const MobileTab = (props: { navEntry: NavEntry }) => {
	const buttonClasses = (props.navEntry.active) ? "border-l-4 border-indigo-500 bg-indigo-100" : "";
	const aClasses = (props.navEntry.active) ? "ml-3 text-indigo-800" : "ml-4 text-gray-500";

	return (
		<button className={"py-2 w-full text-left " + buttonClasses}>
			<Link to={props.navEntry.location} className={"font-medium ml-3 " + aClasses}>
				{props.navEntry.text}
			</Link>
		</button>
	);
};

export default NavBar;
