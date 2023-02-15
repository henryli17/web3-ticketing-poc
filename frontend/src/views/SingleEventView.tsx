import { useParams } from "react-router-dom";

const SingleEventView = () => {
	const { id } = useParams();

	return (
		<>
			<div>{id}</div>
		</>
	);
}

export default SingleEventView;
