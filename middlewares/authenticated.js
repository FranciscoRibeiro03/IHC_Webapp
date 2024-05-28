import Middleware from '../lib/Middleware.js';

export default class extends Middleware {
    constructor(manager, app) {
        super(manager, app, { name: 'authenticated' });
    }

    /**
     * The middleware run method.
     * @param {import('express').Request} request The request object.
     * @param {import('express').Response} response The response object.
	 * @param {import('express').NextFunction} next The next function.
     */
    async run(request, response, next) {
		// if (!Boolean(request.session?.authenticated)) return response.redirect('/login');
        if (!response.locals.isAuthenticated) return response.redirect('/login');
		next();
	}
    
}
