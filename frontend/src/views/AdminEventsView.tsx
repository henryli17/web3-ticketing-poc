import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import NotFound from "../components/NotFound";
import PaginationButtons from "../components/PaginationButtons";
import SearchBar from "../components/SearchBar";
import { getEvents, GetEventsResponse } from "../helpers/api";

const AdminEventsView = () => {
	const [eventsRes, setEventsRes] = useState<GetEventsResponse>();
	const [error, setError] = useState(false);
	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState("");

	useEffect(() => {

		getEvents({ offset: offset, search: search })
			.then(setEventsRes)
			.catch(() => setError(true))
		;
	}, [offset, search]);

	if (error) {
		return <NotFound />;
	}

	if (!eventsRes) {
		return <></>;
	}

	return (
		<div className="container mx-auto py-16 px-10">
			<div className="text-gray-500 mb-8 flex items-center">
				<div>
					<h2 className="font-bold">Admin</h2>
					<div className="font-medium">Events</div>
				</div>
				<div className="ml-auto">
					<button className="btn btn-basic">
						Create Event
					</button>
				</div>
			</div>
			<div className="space-y-3">
				<SearchBar
					onSubmit={(search) => setSearch(search)}
					onChange={e => {
						if (e.target.value === "") {
							setSearch("");
						}
					}}
				/>
				{
					!eventsRes.events.length &&
					<div className="p-5 text-2xl">There are currently no events.</div>
				}
				{eventsRes.events.map(event => <EventCard key={event.id} event={event} />)}
			</div>
			<div className="flex justify-end space-x-2">
				<PaginationButtons
					prev={() => setOffset(offset - eventsRes.events.length)}
					next={() => (typeof eventsRes.nextOffset === "number") && setOffset(eventsRes.nextOffset)}
					prevDisabled={offset === 0}
					nextDisabled={!Boolean(eventsRes.nextOffset)}
					className="btn btn-basic"
					hideWhenDisabled={true}
				/>
			</div>
		</div>
	);
};

export default AdminEventsView;
