const CheckboxGroup = (props: { items: CheckboxItem[], dispatch: React.Dispatch<React.SetStateAction<CheckboxItem[]>> }) => {
	const toggle = (name: string) => {
		props.dispatch(items => {
			return items.map(item => {
				return {
					...item,
					checked: (item.name === name) ? !item.checked : item.checked
				};
			});
		});
	};

	return (
		<>
			{
				props.items.map((item, i) => {				
					return (
						<div key={i} className="flex items-center">
							<input
								type="checkbox"
								className="rounded text-indigo-500 mr-1.5 appearance-none focus:ring-0 focus:ring-offset-0"
								id={item.name}
								value={item.name}
								onChange={(e) => toggle(item.name)}
								checked={item.checked}
							/>
							<label htmlFor={item.name}>
								{item.name}
							</label>
						</div>
					);
				})
			}
		</>
	);
};

export interface CheckboxItem {
	name: string,
	checked: boolean
};

export default CheckboxGroup;
