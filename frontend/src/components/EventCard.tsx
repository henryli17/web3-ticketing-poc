const EventCard = () => {
	return (
		<button type="button" className="outline outline-1 outline-gray-300 rounded transition ease-in-out duration-300 hover:outline-indigo-500 flex w-full">
			<div className="my-auto flex w-full">
				<img className="rounded shadow-lg m-5 hidden sm:block" src="https://i.imgur.com/Awaw7ni.png" alt="" width={100} />
				<div className="my-5 mx-5 sm:mr-5 sm:ml-0 text-left w-full flex">
					<div className="my-auto w-full">
						<div className="italic uppercase mb-2">
							<h2 className="font-bold mr-2">
								Taylor Swift
							</h2>
							<div className="text-xl">
								Tour Name
							</div>
						</div>
						<div className="text-xl font-bold text-indigo-500">
							0.01 ETH
						</div>
						<div className="text-md block">
							O2 Academy Brixton · London · 12 May 2024
						</div>
					</div>
				</div>
			</div>
		</button>
	);
};

export default EventCard;
