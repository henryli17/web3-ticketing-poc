import { range } from "../helpers/utils";

const QuantityButton = (props: {
    children?: React.ReactNode;
    quantity: number;
    value: number;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
    disabled?: boolean;
}) => {
    const quantityOnClick = (
        e: React.MouseEvent<HTMLSelectElement, MouseEvent>,
    ) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <button
            type="button"
            className={
                "btn-base py-2 pl-4 pr-0 outline outline-1 " + props.className
            }
            onClick={(e) => props.onClick && props.onClick(e)}
            disabled={props.disabled}
        >
            {props.children && (
                <div className="flex h-full items-center border-r border-current pr-3">
                    {props.children}
                </div>
            )}
            <select
                className="h-full border-transparent bg-transparent py-0 pl-3 pr-8 text-sm focus:border-transparent focus:ring-0"
                onClick={(e) => quantityOnClick(e)}
                value={props.value}
                onChange={(e) => props.onChange && props.onChange(e)}
                disabled={props.disabled}
            >
                {range(1, props.quantity).map((i) => (
                    <option key={i}>{i}</option>
                ))}
            </select>
        </button>
    );
};

export default QuantityButton;
