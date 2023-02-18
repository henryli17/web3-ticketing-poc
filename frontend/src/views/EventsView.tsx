import { useEffect, useState } from "react";
import CheckboxGroup, { CheckboxItem } from "../components/CheckboxGroup";
import EventCard from "../components/EventCard";
import { getGenres } from "../helpers/api";



const EventsView = () => {
	const [genres, setGenres] = useState<CheckboxItem[]>([]);

	useEffect(() => {
		getGenres()
			.then(genres => {
				setGenres(
					genres.map(genre => {
						return { name: genre, checked: false };
					})
				);
			})
		;
	}, []);

	return (
		<div className="container py-20 px-10 mx-auto grid grid-cols-12 gap-x-3">
			<form className="outline outline-1 outline-gray-300 rounded col-span-12 mb-5 md:mb-0 md:col-span-3 xl:col-span-2">
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
				<EventCard />
				<EventCard />
				<EventCard />
				<EventCard />
			</div>
		</div>
	);
};

export default EventsView;
