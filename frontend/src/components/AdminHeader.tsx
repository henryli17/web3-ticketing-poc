const AdminHeader = (props: {
    subtitle: string;
    children?: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={"text-gray-500 " + props.className}>
            <div>
                <h2 className="font-bold">Admin</h2>
                <div className="font-medium">{props.subtitle}</div>
            </div>
            {props.children}
        </div>
    );
};

export default AdminHeader;
