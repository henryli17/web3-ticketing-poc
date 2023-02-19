import { useEffect, useState } from "react";
import CheckboxGroup, { CheckboxItem } from "../components/CheckboxGroup";
import EventCard from "../components/EventCard";
import NotFound from "../components/NotFound";
import { getEvents, getGenres } from "../helpers/api";
import { Event } from "../helpers/api";

const EventsView = () => {
	const [error, setError] = useState(false);
	const [events, setEvents] = useState<Event[]>([]);
	const [genres, setGenres] = useState<CheckboxItem[]>([]);

	useEffect(() => {
		getEvents()
			.then(setEvents)
			.catch(() => setError(true))
		;

		getGenres()
			.then(genres => {
				setGenres(
					genres.map(genre => {
						return { name: genre, checked: false };
					})
				);
			})
			.catch(() => setError(true))
		;
	}, []);

	if (error) {
		return <NotFound />;
	}

	return (
		<div className="container py-16 px-10 mx-auto grid grid-cols-12 gap-x-3">
			<form className="card-static col-span-12 mb-5 md:mb-0 md:col-span-3 xl:col-span-2">
				<div className="filter-child">
					Genre
				</div>
				<div className="filter-child">
					<CheckboxGroup items={genres} dispatch={setGenres} />
				</div>
				<div className="filter-child">
					Location
				</div>
			</form>
			<div className="space-y-3 col-span-12 md:col-span-9 xl:col-span-10">
				{events.map(event => <EventCard key={event.id} event={event} />)}
			</div>
		</div>
	);
};

export default EventsView;
