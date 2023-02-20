import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "react-bootstrap-icons";
import CheckboxGroup, { CheckboxItem } from "../components/CheckboxGroup";
import EventCard from "../components/EventCard";
import NotFound from "../components/NotFound";
import PaginationButtons from "../components/PaginationButtons";
import { getEvents, GetEventsResponse, getGenres } from "../helpers/api";

const EventsView = () => {
	const [error, setError] = useState(false);
	const [eventsRes, setEventsRes] = useState<GetEventsResponse>({ events: [], nextOffset: false });
	const [genres, setGenres] = useState<CheckboxItem[]>([]);
	const [offset, setOffset] = useState(0);

	useEffect(() => {
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
	}, [])

	useEffect(() => {
		const params = {
			offset: offset,
			genres: genres.filter(g => g.checked).map(g => g.name)
		};

		getEvents(params)
			.then(setEventsRes)
			.catch(() => setError(true))
		;
	}, [offset, genres]);

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
				{eventsRes.events.map(event => <EventCard key={event.id} event={event} />)}
				<div className="flex justify-end space-x-2">
					<PaginationButtons
						prev={() => setOffset(offset - eventsRes.events.length)}
						next={() => (typeof eventsRes.nextOffset === "number") && setOffset(eventsRes.nextOffset)}
						prevDisabled={offset === 0}
						nextDisabled={!Boolean(eventsRes.nextOffset)}
						className="btn btn-basic"
					/>
				</div>
			</div>
		</div>
	);
};

export default EventsView;
