import { useState } from "react";

const SearchBar = (props: {
    className?: string;
    onSubmit?: (search: string) => any;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
}) => {
    const [search, setSearch] = useState("");

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!props.onSubmit) {
            return;
        }

        props.onSubmit(search);
    };

    const change = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);

        if (props.onChange) {
            props.onChange(e);
        }
    };

    return (
        <form
            className={"relative shadow-sm " + props.className}
            onSubmit={(e) => submit(e)}
        >
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                    className="h-4 w-4"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                </svg>
            </div>
            <input
                type="text"
                className="input pl-9 pr-5"
                placeholder="Search"
                value={search}
                onChange={(e) => change(e)}
            />
        </form>
    );
};

export default SearchBar;
