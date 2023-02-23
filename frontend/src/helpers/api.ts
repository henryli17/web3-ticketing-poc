import axios from 'axios';
import { AbiItem } from 'web3-utils';

enum HttpMethod {
	GET = "get",
	POST = "post"
};

export type GetEventsResponse = {
	events: Event[],
	nextOffset: number | boolean,
	limit: number
};

export type Event = {
	id: number
	name: string
	artist: string
	venue: string
	city: string
	time: string | number
	price: number
	quantity: number
	imageUrl: string
	description: string
	genres: string[]
};

export type Purchase = {
	event: Event,
	quantity: number,
	forSale: boolean,
	expired: boolean
};

export type Contract = {
	ABI: AbiItem,
	address: string
};

const request = <T>(method: HttpMethod, endpoint: string, options?: { data?: object, params?: object }) => {
	const API_BASE = "http://localhost:3001/api";

	return new Promise<T>(async (resolve, reject) => {
		try {
			const res = await axios({
				method: method,
				url: `${API_BASE}/${endpoint}`,
				data: options?.data,
				params: options?.params,
				withCredentials: true
			});

			resolve(res.data);
		} catch (e) {
			reject(e);
		}
	});
}

export const getEvents = (params?: {
	offset?: number,
	genres?: string[],
	locations?: string[],
	maxPrice?: number,
	search?: string
}) => {
	return request<GetEventsResponse>(
		HttpMethod.GET,
		"events",
		{
			params: {
				offset: params?.offset,
				genres: params?.genres?.join(","),
				locations: params?.locations?.join(","),
				maxPrice: params?.maxPrice,
				search: params?.search
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

export const getLocations = () => {
	return request<string[]>(
		HttpMethod.GET,
		"locations"
	);
};

export const getPurchases = (address: string) => {
	return request<Purchase[]>(
		HttpMethod.GET,
		"purchases/" + address
	);
};

export const getContract = () => {
	return request<Contract>(
		HttpMethod.GET,
		"contract"
	);
};

export const login = (password?: string) => {
	return request<undefined>(
		HttpMethod.POST,
		"login",
		{ data: { password: password } }
	);
};

export const createEvent = (event: Omit<Event, "id">) => {
	return request<undefined>(
		HttpMethod.POST,
		"events",
		{ data: event }
	);
};
