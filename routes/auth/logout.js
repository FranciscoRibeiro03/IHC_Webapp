import Route from '../../lib/Route.js';
import Logger from '../../lib/logger.js';

export default class extends Route {
    constructor(manager, app) {
        super(manager, app, {
            name: 'logout',
            route: '/logout',
            middlewares: ['authenticated']
        });
    }

    /**
     * The POST method for this route.
     * @param {import('express').Request} request The request object.
     * @param {import('express').Response} response The response object.
     */
    async post(request, response) {
		return request.session.destroy((error) => {
			if (error) Logger.error(error);
			response.redirect('/');
		});
    }
}
