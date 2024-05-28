import Route from '../lib/Route.js';
import { getItemsFromDatabase } from '../lib/utils.js';

export default class extends Route {
    constructor(manager, app) {
        super(manager, app, {
            name: 'index',
            route: '/',
            middlewares: ['authenticated']
        });
    }

    /**
     * The GET method for this route.
     * @param {import('express').Request} request The request object.
     * @param {import('express').Response} response The response object.
     */
    async get(request, response) {
        const items = await getItemsFromDatabase();

        response.render('index', {
            path: '/',
            items: items.objects,
        });
    }
}
