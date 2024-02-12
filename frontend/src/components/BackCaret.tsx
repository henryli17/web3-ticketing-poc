import { CaretLeftFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

const BackCaret = (props: { to: string }) => {
    return (
        <Link to={props.to} className="flex items-center text-indigo-500 mb-5">
            <CaretLeftFill className="mr-1.5" />
            Back
        </Link>
    );
};

export default BackCaret;
