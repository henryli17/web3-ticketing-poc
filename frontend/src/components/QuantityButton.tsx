import { range } from "../helpers/utils";

const QuantityButton = (props: {
	children: React.ReactNode,
	quantity: number,
	defaultQuantity: number,
	className?: string,
	onClick?: React.MouseEventHandler<HTMLButtonElement>,
	onChange?: React.ChangeEventHandler<HTMLSelectElement>,
	disabled?: boolean
}) => {
	const quantityOnClick = (e: React.MouseEvent<HTMLSelectElement, MouseEvent>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	return (
		<button
			type="button"
			className={"btn-base py-2 pl-4 pr-0 items-center " + props.className}
			onClick={props.onClick}
			disabled={props.disabled}
		>
			<div className="flex pr-3 items-center border-r border-current h-full">
				{props.children}
			</div>
			<select
				className="border-transparent h-full bg-transparent py-0 pl-3 pr-8 text-sm focus:ring-0 focus:border-transparent"
				onClick={e => quantityOnClick(e)}
				defaultValue={props.defaultQuantity}
				onChange={props.onChange}
				disabled={props.disabled}
			>
				{range(1, props.quantity).map(i => <option key={i}>{i}</option>)}
			</select>
		</button>
	);
};

export default QuantityButton;
