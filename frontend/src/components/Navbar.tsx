import { useState } from "react";

const Link = (props: { href: string, text: string, active: boolean }) => {
	const borderColour = (props.active) ? "border-indigo-500" : "border-transparent";

	return (
		<button className={"border-b-2 h-full " + borderColour}>
			<a href={props.href} className="text-gray-800 px-3 py-2 text-sm font-medium h-full">
				{props.text}
			</a>
		</button>
	);
};

const MobileLink = (props: { href: string, text: string, active: boolean }) => {
	const buttonClasses = !props.active || "border-l-4 border-indigo-500 bg-indigo-100";
	const aClasses = (props.active) ? "ml-3 text-indigo-800" : "ml-4 text-gray-500";

	return (
		<button className={"py-2 w-full text-left " + buttonClasses}>
			<a href={props.href} className={"font-medium ml-3 " + aClasses}>
				{props.text}
			</a>
		</button>
	);
};

const Search = (props: { className?: string }) => {
	return (
		<div className={"relative shadow-sm " + props.className}>
			<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-4 h-4">
					<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
				</svg>
			</div>
			<input type="text" className="block w-full rounded-md border-gray-300 pl-9 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Search" />
		</div>
	);
};

const Navbar = () => {
	const [mobileMenuHidden, setMobileMenuHidden] = useState(true);

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
								<Link href="/" text="Events" active={true} />
								<Link href="/" text="Purchases" active={false} />
							</div>
						</div>
					</div>
					<div className="pr-2 sm:pr-0 hidden md:flex items-center">
						<Search />
						<div className="ml-3">
							Connect Wallet
						</div>
					</div>
				</div>
			</div>
			<div className={"sm:hidden " + (!mobileMenuHidden || "hidden")}>
				<div className="pt-2 pb-3">
					<Search className="mx-2 mb-3" />
					<MobileLink href="/" text="Events" active={true} />
					<MobileLink href="/" text="Purchases" active={false} />
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
