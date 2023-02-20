import axios from 'axios';

enum HttpMethod {
	GET = "get",
	POST = "post"
};

export type Event = {
	id: number
	name: string
	artist: string
	venue: string
	city: string
	time: string
	price: number
	ticketQuantity: number
	imagePath: string
	description: string
	genres: string[]
};

export type Purchase = {
	event: Event,
	quantity: number,
	forSale: boolean,
	expired: boolean
};

const request = <T>(method: HttpMethod, endpoint: string, options?: { data?: object, params?: object }) => {
	const API_BASE = "http://localhost:8080/api";

	return new Promise<T>(async (resolve, reject) => {
		try {
			const res = await axios({
				method: method,
				url: `${API_BASE}/${endpoint}`,
				data: options?.data,
				params: options?.params
			});

			resolve(res.data);
		} catch (e) {
			reject(e);
		}
	});
}

export const getEvents = (params?: { id?: Number[] }) => {
	return request<Event[]>(
		HttpMethod.GET,
		"events",
		{
			params: {
				id: params?.id?.join(",")
			}
		}
	);
};

export const getEvent = (id: number) => {
	return request<Event>(
		HttpMethod.GET,
		"events/" + id,
	);
};

export const getGenres = () => {
	return request<string[]>(
		HttpMethod.GET,
		"genres"
	);
};

export const getPurchases = (address: string) => {
	return request<Purchase[]>(
		HttpMethod.GET,
		"purchases/" + address
	);
};
