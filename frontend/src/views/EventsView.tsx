import { useEffect, useState } from "react";
import { CaretDownFill, CaretUpFill, XCircleFill } from "react-bootstrap-icons";
import { useSearchParams } from "react-router-dom";
import CheckboxGroup, { CheckboxItem } from "../components/CheckboxGroup";
import EventCard from "../components/EventCard";
import PageError from "../components/PageError";
import PaginationButtons from "../components/PaginationButtons";
import {
    GetEventsResponse,
    getEvents,
    getGenres,
    getLocations,
} from "../helpers/api";
import { ethToGwei } from "../helpers/utils";

const EventsView = () => {
    const [error, setError] = useState(false);
    const [eventsData, setEventsData] = useState<GetEventsResponse>();
    const [genres, setGenres] = useState<string[]>([]);
    const [locations, setLocations] = useState<string[]>([]);
    const [genreCheckboxItems, setGenreCheckboxItems] = useState<
        CheckboxItem[]
    >([]);
    const [locationCheckboxItems, setLocationCheckboxItems] = useState<
        CheckboxItem[]
    >([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showGenres, setShowGenres] = useState(true);
    const [showLocations, setShowLocations] = useState(true);
    const [showPrice, setShowPrice] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search") || undefined;
    const offset = Number(searchParams.get("offset"));

    const updateFilterSearchParam = (key: string, value: any) => {
        searchParams.set(key, value.toString());
        searchParams.delete("offset");
        setSearchParams(searchParams);
    };

    const setOffset = (offset: number) => {
        searchParams.set("offset", offset.toString());
        setSearchParams(searchParams);
    };

    useEffect(() => {
        getGenres()
            .then(setGenres)
            .catch(() => setError(true));

        getLocations()
            .then(setLocations)
            .catch(() => setError(true));
    }, []);

    useEffect(() => {
        if (!genres.length || !locations.length) {
            return;
        }

        const maxPrice = Number(searchParams.get("maxPrice"));
        const params = {
            offset: Number(searchParams.get("offset")) || 0,
            genres: searchParams.get("genres")?.split(",") || [],
            locations: searchParams.get("locations")?.split(",") || [],
            maxPrice: maxPrice > 0 ? ethToGwei(maxPrice) : undefined,
            search: searchParams.get("search") || undefined,
        };

        setGenreCheckboxItems(
            genres.map((genre) => {
                return { name: genre, checked: params.genres.includes(genre) };
            }),
        );

        setLocationCheckboxItems(
            locations.map((location) => {
                return {
                    name: location,
                    checked: params.locations.includes(location),
                };
            }),
        );

        getEvents(params)
            .then(setEventsData)
            .catch(() => setError(true));
    }, [searchParams, genres, locations]);

    if (error) {
        return <PageError />;
    }

    if (!eventsData) {
        return null;
    }

    return (
        <div className="container py-16 px-10 mx-auto">
            {search && (
                <div className="mb-3 text-lg flex items-center">
                    <button
                        type="button"
                        onClick={() => {
                            searchParams.set("search", "");
                            setSearchParams(searchParams);
                        }}
                    >
                        <XCircleFill className="mr-2 text-red-700 hover:text-red-900" />
                    </button>
                    Showing results for: {search}
                </div>
            )}
            <button
                type="button"
                className="md:hidden text-gray-500 mb-2 text-xs uppercase"
                onClick={() => setShowFilters(!showFilters)}
            >
                {showFilters ? "Hide" : "Show"} Filters
            </button>
            <div className="grid grid-cols-12 gap-x-3">
                <div
                    className={
                        "card-static col-span-12 mb-5 md:mb-0 md:col-span-3 xl:col-span-2 h-fit md:block " +
                        (!showFilters ? "hidden" : "")
                    }
                >
                    <CheckboxItemsFilter
                        title="Genre"
                        items={genreCheckboxItems}
                        setItems={setGenreCheckboxItems}
                        show={showGenres}
                        setShow={setShowGenres}
                        onUpdate={(items) =>
                            updateFilterSearchParam(
                                "genres",
                                items
                                    .filter((i) => i.checked)
                                    .map((i) => i.name)
                                    .join(","),
                            )
                        }
                    />
                    <CheckboxItemsFilter
                        title="Location"
                        items={locationCheckboxItems}
                        setItems={setLocationCheckboxItems}
                        show={showLocations}
                        setShow={setShowLocations}
                        onUpdate={(items) =>
                            updateFilterSearchParam(
                                "locations",
                                items
                                    .filter((i) => i.checked)
                                    .map((i) => i.name)
                                    .join(","),
                            )
                        }
                    />
                    <button
                        type="button"
                        className={
                            "filter-child flex items-center w-full " +
                            (showPrice ? "" : "border-b-0")
                        }
                        onClick={() => setShowPrice(!showPrice)}
                    >
                        Price
                        <div className="ml-auto">
                            {showPrice && <CaretUpFill size={12} />}
                            {!showPrice && <CaretDownFill size={12} />}
                        </div>
                    </button>
                    <div
                        className={
                            "filter-child " + (showPrice ? "" : "hidden")
                        }
                    >
                        <div className="relative shadow-sm my-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-gray-500">
                                MAX ETH
                            </div>
                            <input
                                type="number"
                                className="input pl-20"
                                placeholder="0"
                                min={0}
                                step="0.001"
                                value={searchParams.get("maxPrice") || 0}
                                onChange={(e) =>
                                    updateFilterSearchParam(
                                        "maxPrice",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-3 col-span-12 md:col-span-9 xl:col-span-10">
                    {!eventsData.events.length && (
                        <h2 className="uppercase italic font-medium py-1 md:px-5">
                            No Events Found
                        </h2>
                    )}
                    {eventsData.events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                    <div className="flex justify-end space-x-2">
                        <PaginationButtons
                            prev={() => setOffset(eventsData.prevOffset)}
                            next={() =>
                                typeof eventsData.nextOffset === "number"
                                    ? setOffset(eventsData.nextOffset)
                                    : setOffset(0)
                            }
                            onChange={() => window.scrollTo(0, 0)}
                            prevDisabled={offset <= 0}
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
    title: string;
    items: CheckboxItem[];
    setItems: React.Dispatch<React.SetStateAction<CheckboxItem[]>>;
    show: boolean;
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    onUpdate: (items: CheckboxItem[]) => any;
}) => {
    return (
        <>
            <button
                type="button"
                className="filter-child flex items-center w-full"
                onClick={() => props.setShow(!props.show)}
            >
                {props.title}
                <div className="ml-auto">
                    {props.show && <CaretUpFill size={12} />}
                    {!props.show && <CaretDownFill size={12} />}
                </div>
            </button>
            <div className={"filter-child " + (props.show ? "" : "hidden")}>
                <CheckboxGroup
                    items={props.items}
                    dispatch={props.setItems}
                    onUpdate={(items) => props.onUpdate(items)}
                />
            </div>
        </>
    );
};

export default EventsView;
