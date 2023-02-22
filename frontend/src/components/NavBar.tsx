import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAddressState } from "../middleware/Wallet";
import routes from "../routes";
import AlertModal from "./AlertModal";
import ConnectWallet from "./ConnectWallet";
import SearchBar from "./SearchBar";

const NavBar = () => {
	const navigate = useNavigate();
	const [address] = useAddressState();
	const [mobileMenuHidden, setMobileMenuHidden] = useState(true);
	const [navEntries, setNavEntries] = useState<NavEntry[]>(allNavEntries);
	const [showAlert, setShowAlert] = useState(false);

	const search = (search: string) => {
		navigate(
			`${routes.events()}?search=${encodeURIComponent(search)}`
		)
	};

	useEffect(() => {
		const isActive = (navEntry: NavEntry) => {
			if (navEntry.location === "/") {
				return window.location.pathname === "/";
			} else {
				return window.location.pathname.startsWith(navEntry.location);
			}
		};

		const navEntries = allNavEntries
			.filter(navEntry => address || !navEntry.requiresWallet)
			.map(navEntry => { 
				return { ...navEntry, active: isActive(navEntry)};
			})
		;

		setNavEntries(navEntries);
	}, [navigate, address]);

	return (
		<>
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
							<Link to={routes.home()} className="flex flex-shrink-0 items-center">
								<img className="block h-8 w-auto" src="https://ethereum.org/static/a183661dd70e0e5c70689a0ec95ef0ba/13c43/eth-diamond-purple.png" alt="Ethereum Logo" />
							</Link>
							<div className="hidden sm:ml-6 sm:block justify-center">
								<div className="flex space-x-4 h-full">
									{
										navEntries.map((navEntry, i) => {
											if (navEntry.location === routes.home()) {
												return <Tab key={i} navEntry={navEntry} className="hidden md:flex" />
											} else {
												return <Tab key={i} navEntry={navEntry} />;
											}
										})
									}
								</div>
							</div>
						</div>
						<div className="pr-2 sm:pr-0 hidden sm:flex items-center">
							<SearchBar className="w-40 md:w-56" onSubmit={search} />
							<ConnectWallet className="ml-3" onLocked={() => setShowAlert(true)} />
						</div>
					</div>
				</div>
				<div className={"sm:hidden " + (mobileMenuHidden ? "hidden" : "")}>
					<div className="pt-2 pb-3 w-full">
						<SearchBar className="mx-2 mb-2" onSubmit={search} />
						<div className="flex mx-2 mb-3">
							<ConnectWallet className="w-full" onLocked={() => setShowAlert(true)} />
						</div>
						{navEntries.map((navEntry, i) => <MobileTab key={i} navEntry={navEntry} />)}
					</div>
				</div>
			</nav>
			{
				showAlert &&
				<AlertModal 
					close={() => setShowAlert(false)}
					title="Unlock Wallet"
					message="Please manually unlock your MetaMask wallet to allow us to connect to it."
				/>
			}
		</>
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

const Tab = (props: { navEntry: NavEntry, className?: string }) => {
	const borderColour = (props.navEntry.active) ? "border-indigo-500" : "border-transparent";

	return (
		<Link to={props.navEntry.location} className={`border-b-2 h-full text-gray-800 px-3 py-2 text-sm font-medium h-full items-center flex ${borderColour} ${props.className}`}>
			{props.navEntry.text}
		</Link>
	);
};

const MobileTab = (props: { navEntry: NavEntry }) => {
	const className = (props.navEntry.active) ? "border-l-4 border-indigo-500 bg-indigo-100 text-indigo-800" : "text-gray-500";

	return (
		<Link to={props.navEntry.location} className={"py-2 w-full text-left flex " + className}>
			<div className={(props.navEntry.active) ? "ml-3 text-indigo-800" : "ml-4 text-gray-600"}>
				{props.navEntry.text}
			</div>
		</Link>
	);
};

export default NavBar;
