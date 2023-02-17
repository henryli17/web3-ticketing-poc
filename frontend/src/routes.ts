const param = (name: string, value: any) => {
	return (value || `:${name}`);
};

const routes = {
	home: () => "/",
	events: () => "/events",
	event: (id?: number) => "/events/" + param("id", id),
	purchases: () => "/purchases"
};

export default routes;
