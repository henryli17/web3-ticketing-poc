import { useEffect, useState } from "react";
import { MusicNote, QrCodeScan } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import AdminEventCard from "../components/AdminEventCard";
import NotFound from "../components/NotFound";
import PaginationButtons from "../components/PaginationButtons";
import SearchBar from "../components/SearchBar";
import { getEvents, GetEventsResponse } from "../helpers/api";
import routes from "../routes";

const AdminEventsView = () => {
	const [eventsData, setEventsData] = useState<GetEventsResponse>();
	const [error, setError] = useState(false);
	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState("");
	const [updateEvents, setUpdateEvents] = useState(false);
	let timeout: NodeJS.Timeout;

	const onEventCancel = () => {
		// Trigger events update either by resetting offset to 0 or updating `updateEvents`
		if (offset !== 0) {
			setOffset(0);
		} else {
			setUpdateEvents(!updateEvents);
		}
	};

	useEffect(() => {
		getEvents({ offset: offset, search: search })
			.then(setEventsData)
			.catch(() => setError(true))
		;
	}, [offset, search, updateEvents]);

	if (error) {
		return <NotFound />;
	}

	if (!eventsData) {
		return <></>;
	}

	return (
		<div className="container mx-auto py-16 px-10">
			<div className="text-gray-500 mb-8 flex items-center">
				<div>
					<h2 className="font-bold">Admin</h2>
					<div className="font-medium">Events</div>
				</div>
				<div className="ml-auto flex space-x-2">
					<Link to={routes.admin.qr()} className="btn btn-basic">
						<QrCodeScan className="mr-1" />
						Scan QR
					</Link>
					<Link to={routes.admin.event("create")} className="btn btn-basic">
						<MusicNote className="mr-1" />
						Create Event
					</Link>
				</div>
			</div>
			<div className="space-y-3 mb-4">
				<SearchBar
					onChange={e => {
						// Only search if there has been no input for 300ms
						clearTimeout(timeout);
						
						timeout = setTimeout(() => {
							setSearch(e.target.value);
						}, 300);
					}}
				/>
				{
					!eventsData.events.length &&
					<div className="p-5 text-2xl">There are currently no events.</div>
				}
				{eventsData.events.map(event => <AdminEventCard event={event} key={event.id} onCancel={() => onEventCancel()} />)}
			</div>
			<div className="flex justify-end space-x-2">
				<PaginationButtons
					prev={() => setOffset(offset - eventsData.limit)}
					next={() => (typeof eventsData.nextOffset === "number") && setOffset(eventsData.nextOffset)}
					prevDisabled={offset === 0}
					nextDisabled={!Boolean(eventsData.nextOffset)}
					className="btn btn-basic"
					hideWhenDisabled={true}
				/>
			</div>
		</div>
	);
};

export default AdminEventsView;
