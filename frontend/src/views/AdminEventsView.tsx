import { useEffect, useState } from "react";
import { MusicNote, QrCodeScan } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import Web3 from "web3";
import AdminEventCard from "../components/AdminEventCard";
import AdminHeader from "../components/AdminHeader";
import Alert from "../components/Alert";
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
			<AdminHeader subtitle="Events" className="mb-8 flex items-center">
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
			</AdminHeader>
			<div className="space-y-3 mb-4">
				{
					!Web3.givenProvider &&
					<Alert
						className="bg-red-50 text-red-900"
						title="MetaMask client not installed!"
						message="Functionality will be limited."
					/>
				}
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
					<h2 className="font-medium py-5 italic uppercase">
						No Events
					</h2>
				}
				{eventsData.events.map(event => <AdminEventCard event={event} key={event.id} onCancel={() => onEventCancel()} />)}
			</div>
			<div className="flex justify-end space-x-2">
				<PaginationButtons
					prev={() => setOffset(offset - eventsData.limit)}
					next={() => (typeof eventsData.nextOffset === "number") && setOffset(eventsData.nextOffset)}
					prevDisabled={offset === 0}
					nextDisabled={!eventsData.nextOffset}
					className="btn btn-basic"
					hideWhenDisabled={true}
				/>
			</div>
		</div>
	);
};

export default AdminEventsView;
