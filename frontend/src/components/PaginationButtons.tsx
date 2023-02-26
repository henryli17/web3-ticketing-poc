import { ArrowLeft, ArrowRight } from "react-bootstrap-icons";

const PaginationButtons = (props: {
	prev: () => any,
	next: () => any,
	prevDisabled: boolean,
	nextDisabled: boolean,
	hideWhenDisabled: boolean,
	className?: string
}) => {
	return (
		<>
			{
				(!props.hideWhenDisabled || !props.prevDisabled) &&
				<button
					type="button"
					className={props.className}
					disabled={props.prevDisabled}
					onClick={() => props.prev()}
				>
					<ArrowLeft className="mr-2" />
					Prev
				</button>
			}
			{
				(!props.hideWhenDisabled || !props.nextDisabled) &&
				<button
					type="button"
					className={props.className}
					disabled={props.nextDisabled}
					onClick={() => props.next()}
				>
					Next
					<ArrowRight className="ml-2" />
				</button>
			}
		</>
	);
};

export default PaginationButtons;
