import { useState } from "react";
import { XLg } from "react-bootstrap-icons";
import { deleteEvent, Event } from "../helpers/api";
import routes from "../routes";
import AlertModal from "./AlertModal";
import ConfirmationModal from "./ConfirmationModal";
import EventCard from "./EventCard";

const AdminEventCard = (props: { event: Event, onCancel: () => any }) => {
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [showErrorModal, setShowErrorModal] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	
	const cancelEvent = async () => {
		try {
			await deleteEvent(props.event.id);
			props.onCancel();
		} catch (e: any) {
			setErrorMessage(e.response.data?.message || "");
			setShowErrorModal(true);
		}
	};

	return (
		<>
			<EventCard event={props.event} to={routes.admin.event(props.event.id)}>
				<div className="col-span-12 lg:col-span-4 xl:col-span-3 mb-5 lg:mt-5 mx-5 mr-5 flex">
					<div className="lg:ml-auto">
						<button
							className="btn btn-base text-red-700 hover:text-red-900"
							onClick={e => {
								e.preventDefault();
								setShowConfirmationModal(true);
							}}
						>
							<XLg className="mr-1" />
							Cancel
						</button>
					</div>
				</div>
			</EventCard>
			{
				showConfirmationModal &&
				<ConfirmationModal
					title={"Cancel Event"}
					message={`Are you sure you want to cancel ${props.event.name} by ${props.event.artist}? This cannot be undone!`}
					close={() => setShowConfirmationModal(false)}
					action={() => cancelEvent()}
				/>
			}
			{
				showErrorModal &&
				<AlertModal
					close={() => setShowErrorModal(false)}
					title="Error"
					message={errorMessage || "An error occurred when trying to cancel the event."}
					className="bg-red-50 text-red-500"
				/>
			}
		</>
	);
};

export default AdminEventCard;
