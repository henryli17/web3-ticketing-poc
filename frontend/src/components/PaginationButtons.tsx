import { ArrowLeft, ArrowRight } from "react-bootstrap-icons";

const PaginationButtons = (props: {
    prev: () => any;
    next: () => any;
    prevDisabled: boolean;
    nextDisabled: boolean;
    hideWhenDisabled: boolean;
    className?: string;
    onChange?: () => any;
}) => {
    return (
        <>
            {(!props.hideWhenDisabled || !props.prevDisabled) && (
                <button
                    type="button"
                    className={props.className}
                    disabled={props.prevDisabled}
                    onClick={() => {
                        props.prev();

                        if (props.onChange) {
                            props.onChange();
                        }
                    }}
                >
                    <ArrowLeft className="mr-2" />
                    Prev
                </button>
            )}
            {(!props.hideWhenDisabled || !props.nextDisabled) && (
                <button
                    type="button"
                    className={props.className}
                    disabled={props.nextDisabled}
                    onClick={() => {
                        props.next();

                        if (props.onChange) {
                            props.onChange();
                        }
                    }}
                >
                    Next
                    <ArrowRight className="ml-2" />
                </button>
            )}
        </>
    );
};

export default PaginationButtons;
