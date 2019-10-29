import { HttpMethod } from './Constants';

export const FetchRequest = (path, options = {}) => {
	const _ = (p, o = {}) => {
		const newPath = `${path}/${p}`;
		const newOptions = { ...options, ...o };
		return FetchRequest(newPath, newOptions);
	};

	_.get = queryParams => generateRequest(HttpMethod.get, path, options, null, queryParams);

	_.post = data => generateRequest(HttpMethod.post, path, options, data);

	_.put = data => generateRequest(HttpMethod.put, path, options, data);

	_.patch = data => generateRequest(HttpMethod.patch, path, options, data);

	_.delete = () => generateRequest(HttpMethod.delete, path, options);

	return _;
};

const generateRequest = (
	method,
	path,
	options = undefined,
	body = undefined,
	query = undefined
) => {
	let requestOptions = { method, path, mustBeLoggedIn: true };
	if (options) {
		requestOptions = { ...requestOptions, ...options };
	}
	if (body) {
		requestOptions.body = body;
	}
	if (query) {
		requestOptions.query = query;
	}
	return requestOptions;
};
