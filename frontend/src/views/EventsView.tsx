import { useEffect, useState } from "react";
import { CaretDownFill, CaretUpFill, XCircleFill } from 'react-bootstrap-icons';
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
	const [eventsData, setEventsData] = useState<GetEventsResponse>();
	const [genres, setGenres] = useState<CheckboxItem[]>([]);
	const [locations, setLocations] = useState<CheckboxItem[]>([]);
	const [offset, setOffset] = useState(0);
	const [showFilters, setShowFilters] = useState(false);
	const [showGenres, setShowGenres] = useState(true);
	const [showLocations, setShowLocations] = useState(true);
	const [showPrice, setShowPrice] = useState(true);
	const [maxPrice, setMaxPrice] = useState(0);
	const [search, setSearch] = useState<string>();
	const [searchParams, setSearchParams] = useSearchParams();

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
			.then(setEventsData)
			.catch(() => setError(true))
		;

		setSearch(params.search);
	}, [offset, genres, locations, maxPrice, searchParams]);

	if (error) {
		return <NotFound />;
	}

	if (!eventsData) {
		return <></>;
	}

	return (
		<div className="container py-16 px-10 mx-auto">
			{
				search &&
				<div className="mb-3 text-lg flex items-center">
					<button type="button" onClick={() => {
						searchParams.set("search", "");
						setSearchParams(searchParams);
					}}>
						<XCircleFill className="mr-2 text-red-700 hover:text-red-900" />
					</button>
					Showing results for: {search}
				</div>
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
					<CheckboxItemsFilter
						title="Genre"
						items={genres}
						dispatch={setGenres}
						show={showGenres}
						setShow={setShowGenres}
					/>
					<CheckboxItemsFilter
						title="Location"
						items={locations}
						dispatch={setLocations}
						show={showLocations}
						setShow={setShowLocations}
					/>
					<div className={"filter-child flex items-center " + (showPrice ? "" : "border-b-0")}>
						Price
						<button className="ml-auto" type="button" onClick={() => setShowPrice(!showPrice)}>
							{showPrice && <CaretUpFill size={12} />}
							{!showPrice && <CaretDownFill size={12} />}
						</button>
					</div>
					<div className={"filter-child " + (showPrice ? "" : "hidden")}>
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
						!eventsData.events.length &&
						<h2 className="uppercase italic font-medium py-1 md:px-5">
							No Events Found
						</h2>
					}
					{eventsData.events.map(event => <EventCard key={event.id} event={event} />)}
					<div className="flex justify-end space-x-2">
						<PaginationButtons
							prev={() => setOffset(offset - eventsData.limit)}
							next={() => (typeof eventsData.nextOffset === "number") && setOffset(eventsData.nextOffset)}
							onChange={() => window.scrollTo(0, 0)}
							prevDisabled={offset === 0}
							nextDisabled={!eventsData.nextOffset}
							className="btn btn-basic"
							hideWhenDisabled={true}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

const CheckboxItemsFilter = (props: {
	title: string,
	items: CheckboxItem[],
	dispatch: React.Dispatch<React.SetStateAction<CheckboxItem[]>>,
	show: boolean,
	setShow: React.Dispatch<React.SetStateAction<boolean>>
}) => {
	return (
		<>
			<div className="filter-child flex items-center">
				{props.title}
				<button className="ml-auto" type="button" onClick={() => props.setShow(!props.show)}>
					{props.show && <CaretUpFill size={12} />}
					{!props.show && <CaretDownFill size={12} />}
				</button>
			</div>
			<div className={"filter-child " + (props.show ? "" : "hidden")}>
				<CheckboxGroup items={props.items} dispatch={props.dispatch} />
			</div>
		</>
	)
};

export default EventsView;
