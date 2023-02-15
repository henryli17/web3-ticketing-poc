const SearchBar = (props: { className?: string }) => {
	return (
		<div className={"relative shadow-sm " + props.className}>
			<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-4 h-4">
					<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
				</svg>
			</div>
			<input
				type="text"
				className="block w-full rounded-md border-gray-300 pl-9 pr-5 sm:text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:border-1 focus:ring-0"
				placeholder="Search"
			/>
		</div>
	);
};

export default SearchBar;
