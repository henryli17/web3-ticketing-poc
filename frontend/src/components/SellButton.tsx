import { CurrencyDollar } from "react-bootstrap-icons";
import { Event } from "../helpers/api";
import { range } from "../helpers/utils";

const SellButton = (props: {
	event: Event,
	quantity: number,
	defaultQuantity: number,
	className?: string,
	onClick?: React.MouseEventHandler<HTMLButtonElement>,
	onChange?: React.ChangeEventHandler<HTMLSelectElement>
}) => {
	const quantityOnClick = (e: React.MouseEvent<HTMLSelectElement, MouseEvent>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	return (
		<button
			type="button"
			className={"btn-base py-2 pl-4 pr-0 outline-green-700 text-green-700 hover:outline-green-900 hover:text-green-900 items-center " + props.className}
			onClick={props.onClick}
		>
			<div className="flex pr-3 items-center border-r border-green-700 h-full">
				<CurrencyDollar size={16} className="mr-1" />
				Sell
			</div>
			<select
				className="border-transparent h-full bg-transparent py-0 pl-3 pr-8 text-sm focus:ring-0 focus:border-transparent"
				onClick={e => quantityOnClick(e)}
				defaultValue={props.quantity}
				onChange={props.onChange}
			>
				{range(1, props.quantity).map(i => <option key={i}>{i}</option>)}
			</select>
		</button>
	);
};

export default SellButton;
