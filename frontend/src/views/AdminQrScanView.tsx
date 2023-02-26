import { useEffect, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import AlertModal from '../components/AlertModal';
import BackCaret from '../components/BackCaret';
import ConfirmationModal from '../components/ConfirmationModal';
import { QrData } from '../components/PurchaseCard';
import QuantityButton from '../components/QuantityButton';
import { eventToken } from '../helpers/api';
import { useAdmin } from '../middleware/Admin';
import routes from '../routes';

const AdminQrScanView = () => {
	const [alertTitle, setAlertTitle] = useState("");
	const [alertMessage, setAlertMessage] = useState("");
	const [ticket, setTicket] = useState<QrData>();
	const [quantity, setQuantity] = useState(1);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [showAlertModal, setShowAlertModal] = useState(false);
	const [, setAdmin] = useAdmin();
	let scanned = showAlertModal;

	useEffect(() => {
		// Reset quantity to 1 when ticket changes
		setQuantity(1);
	}, [ticket]);

	const scan = (data: any) => {
		if (scanned || !data) {
			return;
		}
		
		try {
			const ticket = JSON.parse(data.text);
			const keys = Object.keys(ticket);
	
			// Check the QR code is for a ticket
			for (const key of ["signature", "eventId", "quantity"]) {
				if (!keys.includes(key)) {
					return;
				}
			}
	
			setTicket(JSON.parse(data.text));
			setShowConfirmationModal(true);
		} catch (e: any) {
			return;
		}
	};

	const markTicketAsUsed = async () => {
		if (!ticket || quantity <= 0) {
			console.log(ticket);
			console.log(quantity);
			return;
		}

		try {
			await eventToken(ticket.signature, ticket.eventId, quantity);
			setAlertTitle("Success");
			setAlertMessage("Tickets were validated and have now been marked as used.")
		} catch (e: any) {
			setAlertTitle("Error");

			// 401 Unauthorised
			if (e?.response?.status === 401) {
				setAdmin(false);
				return;
			} 

			if (e?.response?.data?.message) {
				setAlertMessage("Tickets were invalid. Reason: " + e.response.data.message);
			} else {
				setAlertMessage("There was an issue whilst trying to mark tickets as used.")
			}
		}

		setShowAlertModal(true);
	};
	
	return (
		<div className="container mx-auto py-16 px-10">
			<BackCaret to={routes.admin.events()} />
			<div className="text-gray-500">
				<h2 className="font-bold">Admin</h2>
				<div className="font-medium">Scan QR</div>
			</div>
			<div className="w-1/2">
				<QrReader
					onResult={data => scan(data)}
					constraints={{ facingMode: "environment" }}
				/>
			</div>
			{
				showConfirmationModal &&
				ticket &&
				<ConfirmationModal
					close={() => setShowConfirmationModal(false)}
					action={() => markTicketAsUsed()}
					title="Ticket Scanned"
					message="Please choose a quantity to mark as used."
				>
					<QuantityButton
						quantity={ticket.quantity}
						value={quantity}
						className="mt-2 text-red-700"
						onChange={e => setQuantity(parseInt(e.target.value))}
					/>
				</ConfirmationModal>
			}
			{
				showAlertModal &&
				<AlertModal
					close={() => setShowAlertModal(false)}
					title={alertTitle}
					message={alertMessage}
				/>
			}
		</div>
	);
};

export default AdminQrScanView;
