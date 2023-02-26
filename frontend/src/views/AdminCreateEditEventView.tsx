import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import routes from "../routes";
import * as Yup from "yup";
import { createEvent, Event, getEvent, updateEvent } from "../helpers/api";
import { ethToGwei, gweiToEth, omit } from "../helpers/utils";
import { useAdmin } from "../middleware/Admin";
import Alert from "../components/Alert";
import { getInstance } from "../helpers/contract";
import BackCaret from "../components/BackCaret";
import AdminHeader from "../components/AdminHeader";
import { FileUploader } from "react-drag-drop-files";

enum Action {
	CREATE = "Create",
	EDIT = "Edit"
};

const AdminCreateEditEventView = () => {
	const { id } = useParams();
	const [error, setError] = useState(false);
	const [success, setSuccess] = useState(false);
	const [minQuantity, setMinQuantity] = useState(1);
	const [event, setEvent] = useState<Event>();
	const [image, setImage] = useState<File>();
	const [, setAdmin]= useAdmin();
	const navigate = useNavigate();
	const dateToString = (date: Date) => {
		return date.toISOString().substring(
			0,
			date.toISOString().length - 8)
		;
	};
	const formik = useFormik({
		initialValues: {
			name: event?.name || "",
			artist: event?.artist || "",
			venue: event?.venue || "",
			city: event?.city || event?.name || "",
			time: (event?.city) ? dateToString(new Date(event.time)) : "",
			price: (event?.price) ? gweiToEth(event.price) : "",
			quantity: event?.quantity || "",
			description: event?.description || "",
			genres: event?.genres.join("\n") || ""
		},
		validationSchema: Yup.object({
			name: Yup.string().required("Required"),
			artist: Yup.string().required("Required"),
			venue: Yup.string().required("Required"),
			city: Yup.string().required("Required"),
			time: Yup.string().required("Required"),
			price: Yup.number().required("Required").min(0),
			quantity: Yup.number().required("Required").min(minQuantity),
			description: Yup.string().required("Required"),
			genres: Yup.string().required("Required")
		}),
		onSubmit: async values => {
			try {
				const event: any = {
					...values,
					id: Number(id),
					time: new Date(values.time).getTime() / 1000,
					price: ethToGwei(values.price),
					quantity: Number(values.quantity)
				};

				const formData = new FormData();

				if (image) {
					formData.append("image", image);
				}

				for (const [key, value] of Object.entries(event)) {
					formData.append(key, String(value));
				}

				if (action === Action.CREATE) {
					formData.delete("id");
					await createEvent(formData);
					navigate(routes.admin.events());
				} else {
					formData.delete("price");
					await updateEvent(formData);
					setSuccess(true);
				}
			} catch (e: any) {
				console.error(e);

				// 401 Unauthorised
				if (e?.response?.status === 401) {
					setAdmin(false);
				} else {
					setError(true);
				}
			}
		},
		enableReinitialize: true
	});

	const action = (id === "create") ? Action.CREATE : Action.EDIT;
	const tomorrow = new Date();
	
	tomorrow.setDate(tomorrow.getDate() + 1);

	useEffect(() => {
		(async () => {
			if (!id || action === Action.CREATE) {
				return;
			}

			try {
				const event = await getEvent(Number(id));
				const contract = await getInstance();
				const contractEvent = await contract
					.methods
					.events(event.id)
					.call()
				;

				setEvent(event);
				setMinQuantity(contractEvent.supplied);
			} catch (e) {
				navigate(routes.admin.events());
			}
		})();
	}, [id, action, navigate, success]);

	return (
		<div className="container mx-auto py-16 px-10">
			<BackCaret to={routes.admin.events()} />
			<AdminHeader className="mb-8" subtitle={action + " Event"} />
			<form onSubmit={e => formik.handleSubmit(e)} className="space-y-3">
				<Input
					name="name"
					label="Name"
					type="text"
					formik={formik}
				/>
				<Input
					name="artist"
					label="Artist"
					type="text"
					formik={formik}
				/>
				<Input
					name="venue"
					label="Venue"
					type="text"
					formik={formik}
				/>
				<Input
					name="city"
					label="City"
					type="text"
					formik={formik}
				/>
				<Input
					name="time"
					label="Time"
					type="datetime-local"
					min={dateToString(tomorrow)}
					formik={formik}
				/>
				<Input
					name="price"
					label="ETH Price"
					type="number"
					formik={formik}
					step={0.01}
					min={0}
					disabled={action === Action.EDIT}
				/>
				<Input
					name="quantity"
					label="Ticket Quantity"
					type="number"
					formik={formik}
					min={minQuantity}
				/>
				<Input
					name="description"
					label="Description"
					type="textarea"
					formik={formik}
				/>
				<Input
					name="genres"
					label="Genres (1 per line)"
					type="textarea"
					formik={formik}
				/>
				<div>
					<div className="flex my-0.5">
						<label className="uppercase text-sm text-indigo-500 mx-1">
							Image (4:5 Aspect Ratio)
						</label>
					</div>
					<FileUploader
						handleChange={(file: File) => setImage(file)}
						types={["PNG", "JPG", "JPEG", "WEBP", "TIF", "GIF", "HEIC", "BMP"]}
						required={action === Action.CREATE}
					/>
					{
						(event?.imageUrl || image) &&
						<img
							className="mt-3 rounded shadow-lg"
							src={image ? URL.createObjectURL((image as Blob)) : event?.imageUrl}
							alt={event?.artist || formik.values.artist}
							width={200}
							height={275}
						/>
					}
				</div>
				{
					error &&
					<Alert
						title="Error!"
						message={`Failed to ${action.toLowerCase()} event.`}
						className="bg-red-50 text-red-700"
					/>
				}
				{
					success &&
					<Alert
						message={`Event successfully updated.`}
						className="bg-green-50 text-green-700"
					/>
				}
				<div className="flex">
					<div className="ml-auto flex space-x-2">
						<Link to={routes.admin.events()} className="btn text-red-600 hover:text-red-800">
							Cancel
						</Link>
						<button type="submit" className="btn btn-basic">
							Save
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

const Input = (props: {
	formik: any,
	name: string,
	type: string,
	label: string
	min?: string | number,
	max?: string | number,
	step?: string | number,
	disabled?: boolean
}) => {
	return (
		<div>
			<div className="flex my-0.5">
				<label className="uppercase text-sm text-indigo-500 mx-1">
					{props.label}
				</label>
				{
					props.formik.touched[props.name] && props.formik.errors[props.name] &&
					<div className="text-red-600 text-sm ml-auto">
						{props.formik.errors[props.name]}
					</div>
				}
			</div>
			<div>
				{
					props.type === "textarea" &&
					<textarea
						placeholder={props.label}
						className="input"
						name={props.name}
						value={props.formik.values[props.name]}
						onChange={e => props.formik.handleChange(e)}
						rows={5}
						disabled={props.disabled}
					/>
				}
				{
					props.type !== "textarea" &&					
					<input
						type={props.type}
						placeholder={props.label}
						className="input"
						name={props.name}
						value={props.formik.values[props.name]}
						onChange={e => props.formik.handleChange(e)}
						min={props.min}
						max={props.max}
						step={props.step}
						disabled={props.disabled}
					/>
				}
		
			</div>
		</div>
	);
};

export default AdminCreateEditEventView;
