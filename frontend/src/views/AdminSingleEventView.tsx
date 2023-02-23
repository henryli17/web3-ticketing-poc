import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import routes from "../routes";
import * as Yup from "yup";

enum Action {
	CREATE = "Create",
	EDIT = "Edit"
};

const AdminSingleEventView = () => {
	const { id } = useParams();
	const [action, setAction] = useState<Action>();
	const formik = useFormik({
		initialValues: {
			name: "",
			artist: "",
			venue: "",
			city: "",
			time: "",
			price: "",
			quantity: "",
			imageUrl: "",
			description: "",
			genres: ""
		},
		validationSchema: Yup.object({
			name: Yup.string().required("Required"),
			artist: Yup.string().required("Required"),
			venue: Yup.string().required("Required"),
			city: Yup.string().required("Required"),
			time: Yup.string().required("Required"),
			price: Yup.number().required("Required").min(0),
			quantity: Yup.number().required("Required").min(1),
			imageUrl: Yup.string().required("Required"),
			description: Yup.string().required("Required"),
			genres: Yup.string().required("Required")
		}),
		onSubmit: async values => {
			console.log("called");
			console.log(values);
		}
	});

	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);

	useEffect(() => {
		setAction((id === "create") ? Action.CREATE : Action.EDIT);
	}, [id]);

	return (
		<div className="container mx-auto py-16 px-10">
			<div className="text-gray-500 mb-8 items-center">
				<h2 className="font-bold">Admin</h2>
				<div className="font-medium">
					{action} Event
				</div>
			</div>
			<form onSubmit={e => { formik.handleSubmit(e); console.log(formik.errors) }} className="space-y-3">
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
					min={tomorrow.toISOString().substring(0, tomorrow.toISOString().length - 8)}
					formik={formik}
				/>
				<Input
					name="price"
					label="ETH Price"
					type="number"
					formik={formik}
					step={0.01}
					min={0}
				/>
				<Input
					name="quantity"
					label="Ticket Quantity"
					type="number"
					formik={formik}
					min={1}
				/>
				<Input
					name="imageUrl"
					label="Image URL"
					type="text"
					formik={formik}
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
	step?: string | number
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
					/>
				}
		
			</div>
		</div>
	);
};

export default AdminSingleEventView;
