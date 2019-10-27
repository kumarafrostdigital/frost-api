import { configureRefreshFetch } from 'refresh-fetch';

export default class AppApiClient {
	constructor(apiUrl, refreshToken, accessToken) {
		this.baseUrl = apiUrl;
		this.appApi = configureRefreshFetch({
			fetch: this.appFetch,
			shouldRefreshToken,
			refreshToken
		});
		this.token = accessToken;
	}

	appFetch = async (url, request = {}) => {
		const { method, headers, body, mustBeLoggedIn } = request;
		const fetchOptions = {
			method,
			headers: { 'Content-Type': 'application/json', ...headers },
			mode: 'cors',
			credentials: 'include',
			body: !!body && Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
		};

		if (mustBeLoggedIn) {
			fetchOptions.headers.Authorization = `Bearer ${this.token()}`;
		}

		// eslint-disable-next-line no-undef
		const response = await fetch(url, fetchOptions);
		let jsonResponse;

		try {
			jsonResponse = await response.json();
		} catch (err) {
			// eslint-disable-next-line
			throw {
				status: 500,
				error: {
					code: 'CLIENT_ERROR',
					detail: 'Something went wrong when parsing json response on client: ' + err
				}
			};
		}

		if (response.status < 400) {
			return jsonResponse;
		}
		throw jsonResponse;
	};

	async fetch(request) {
		const { path, query } = request;
		const url = createUrl(this.baseUrl, path, query);
		return this.appApi(url, request);
	}
}

const createUrl = (base, path, query) => {
	const queryString =
		!!query && Object.keys(query).length > 0 ? `?${convertToQueryString(query)}` : '';
	return `${base}${path}${queryString}`;
};

const shouldRefreshToken = error => error.status === 403;

/**
 * Object to create query string from a JSON object.
 *
 * @param {Object} object
 */
const convertToQueryString = (object = {}) => {
	const arr = Object.keys(object).map(key => {
		return encodeURI(`${key}=${object[key]}`);
	});

	return arr.join('&');
};