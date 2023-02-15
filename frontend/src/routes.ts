const param = (name: string, value: any) => {
	return (value || `:${name}`);
};

const routes = {
	home: () => "/",
	event: (id?: number) => "/events/" + param("id", id),
};

export default routes;
