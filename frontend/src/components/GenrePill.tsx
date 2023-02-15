const GenrePill = (props: { name: string }) => {
	return (
		<button type="button" className="rounded-full bg-indigo-500 uppercase text-white px-5 py-1">
			{props.name}
		</button>
	);
};

export default GenrePill;
