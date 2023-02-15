import { useParams } from "react-router-dom";

const GenrePill = (props: { name: string }) => {
	return (
		<button type="button" className="rounded-full bg-indigo-500 uppercase text-white px-5 py-1">
			{props.name}
		</button>
	)
};

const SingleEventView = () => {
	const { id } = useParams();

	return (
		<div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 py-20 px-10">
			<div className="grid-span-1 flex mb-16 lg:mb-0">
				<div className="my-auto">
					<img className="mx-auto shadow-lg w-10/12 md:w-8/12 lg:w-10/12 xl:w-8/12 rounded" src="https://i.imgur.com/Awaw7ni.png" alt="" />
				</div>
			</div>
			<div className="grid-span-1 flex">
				<div className="my-auto">
					<h1 className="italic uppercase font-bold mb-1">
						Taylor Swift Tour
					</h1>
					<div className="text-2xl mb-8">
						12th Feb 2023
					</div>
					<div className="text-2xl mb-8">
						The O2, London
					</div>
					<div className="text-2xl uppercase font-bold">
						Price
					</div>
					<h2 className="font-bold text-indigo-500 mb-8">
						0.01 ETH
					</h2>
					<button type="button" className="btn btn-basic w-32 mb-8">
						Purchase
					</button>
					<div className="mb-8 text-lg">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
					</div>
					<div className="space-x-2">
						<GenrePill name="Rock" />
						<GenrePill name="Indie" />
					</div>
				</div>
			</div>
		</div>
	);
}

export default SingleEventView;
