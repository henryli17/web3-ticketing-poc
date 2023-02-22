const param = (name: string, value: any) => {
	return (value || `:${name}`);
};

const routes = {
	home: () => "/",
	events: () => "/events",
	event: (id?: number) => "/events/" + param("id", id),
	eventResale: (id?: number) => `/events/${param("id", id)}/resale`,
	purchases: () => "/purchases",
	admin: {
		login: () => "/admin/login"
	}
};

export default routes;
