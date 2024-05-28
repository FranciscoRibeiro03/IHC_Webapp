import Route from '../../lib/Route.js';
import Logger from '../../lib/logger.js';

export default class extends Route {
    constructor(manager, app) {
        super(manager, app, {
            name: 'login',
            route: '/login',
            middlewares: ['notAuthenticated']
        });
    }

    /**
     * The GET method for this route.
     * @param {import('express').Request} request The request object.
     * @param {import('express').Response} response The response object.
     */
    get(request, response) {
        response.render('login', {
            path: '/login',
            error: false,
            old: {
                email: '',
                password: ''
            }
        });
    }

    /**
     * The POST method for this route.
     * @param {import('express').Request} request The request object.
     * @param {import('express').Response} response The response object.
     */
    async post(request, response) {
        const username = request.body['username'];
        const password = request.body['password'];

        if (username !== 'admin' || password !== 'admin')
            return response.status(401).render('login', {
                path: '/login',
                error: true,
                old: { username, password }
            });

        request.session.authenticated = true;

        return request.session.save((error) => {
            if (error) Logger.error(error);
            response.redirect('/')
        });
    }
}
