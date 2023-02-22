import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useEffectOnce } from "usehooks-ts";
import CheckboxGroup, { CheckboxItem } from "../components/CheckboxGroup";
import EventCard from "../components/EventCard";
import NotFound from "../components/NotFound";
import PaginationButtons from "../components/PaginationButtons";
import { getEvents, GetEventsResponse, getGenres, getLocations } from "../helpers/api";
import { ethToGwei } from "../helpers/utils";

const EventsView = () => {
	const [error, setError] = useState(false);
	const [eventsRes, setEventsRes] = useState<GetEventsResponse>({ events: [], nextOffset: false });
	const [genres, setGenres] = useState<CheckboxItem[]>([]);
	const [locations, setLocations] = useState<CheckboxItem[]>([]);
	const [offset, setOffset] = useState(0);
	const [showFilters, setShowFilters] = useState(true);
	const [maxPrice, setMaxPrice] = useState(0);
	const [search, setSearch] = useState<string>();
	const [searchParams] = useSearchParams();

	useEffectOnce(() => {
		getGenres()
			.then(genres => {
				const checkedGenres = searchParams.get("genres")?.split(",") || [];

				setGenres(
					genres.map(genre => {
						return { name: genre, checked: checkedGenres.includes(genre) };
					})
				);
			})
			.catch(() => setError(true))
		;

		getLocations()
			.then(locations => {
				const checkedLocations = searchParams.get("locations")?.split(",") || [];

				setLocations(
					locations.map(location => {
						return { name: location, checked: checkedLocations.includes(location) };
					})
				);
			})
			.catch(() => setError(true))
		;
	});

	useEffect(() => {
		const params = {
			offset: offset,
			genres: genres.filter(g => g.checked).map(g => g.name),
			locations: locations.filter(l => l.checked).map(l => l.name),
			maxPrice: (maxPrice > 0) ? ethToGwei(maxPrice) : undefined,
			search: searchParams.get("search") || undefined
		};

		getEvents(params)
			.then(setEventsRes)
			.catch(() => setError(true))
		;

		setSearch(params.search);
	}, [offset, genres, locations, maxPrice, searchParams]);

	if (error) {
		return <NotFound />;
	}

	return (
		<div className="container py-16 px-10 mx-auto">
			{
				search &&
				<div className="mb-3 text-lg">Showing results for: {search}</div>
			}
			<button
				type="button"
				className="md:hidden text-gray-500 mb-2 text-xs uppercase"
				onClick={() => setShowFilters(!showFilters)}
			>
				{showFilters ? "Hide" : "Show"} Filters
			</button>
			<div className="grid grid-cols-12 gap-x-3">
				<div className={"card-static col-span-12 mb-5 md:mb-0 md:col-span-3 xl:col-span-2 h-fit md:block " + (!showFilters ? "hidden" : "")}>
					<div className="filter-child">
						Genre
					</div>
					<div className="filter-child">
						<CheckboxGroup items={genres} dispatch={setGenres} />
					</div>
					<div className="filter-child">
						Location
					</div>
					<div className="filter-child">
						<CheckboxGroup items={locations} dispatch={setLocations} />
					</div>
					<div className="filter-child">
						Price
					</div>
					<div className="filter-child">
						<div className="relative shadow-sm my-1">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-gray-500">
								MAX ETH
							</div>
							<input
								type="number"
								className="input pl-20"
								placeholder="0"
								min={0}
								step="0.01"
								value={maxPrice}
								onChange={e => setMaxPrice(Number(e.target.value))}
							/>
						</div>
					</div>
				</div>
				<div className="space-y-3 col-span-12 md:col-span-9 xl:col-span-10">
					{
						!eventsRes.events.length &&
						<div className="p-5 text-2xl">No events matching your query could be found.</div>
					}
					{eventsRes.events.map(event => <EventCard key={event.id} event={event} />)}
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
			</div>
		</div>
	);
};

export default EventsView;
