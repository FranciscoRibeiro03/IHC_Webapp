import Route from '../../lib/Route.js';
import Database from '../../lib/database.js';

import { getItemsFromDatabase } from '../../lib/utils.js';

export default class extends Route {
    constructor(manager, app) {
        super(manager, app, {
            name: 'item',
            route: '/item/:id'
        });
    }

    /**
     * The GET method for this route.
     * @param {import('express').Request} request The request object.
     * @param {import('express').Response} response The response object.
     */
    async get(request, response) {
        const { id } = request.params;
        const items = await getItemsFromDatabase();
        const item = items.objects.find(item => item.id === id);

        if (!item) return response.redirect('/');

        response.render('item', {
            path: '/item',
            hide_search_bar: false,
            item: item
        });
    }

    /**
     * The DELETE method for this route.
     * @param {import('express').Request} request The request object.
     * @param {import('express').Response} response The response object.
     */
    async delete(request, response) {
        const { id } = request.params;
        const items = await getItemsFromDatabase();
        const item = items.objects.find(item => item.id === id);

        if (!item) return response.status(404).send();

        await Database.run("DELETE FROM item_image WHERE item_id = ?", item.id);
        await Database.run("DELETE FROM item_video WHERE item_id = ?", item.id);
        await Database.run("DELETE FROM item WHERE id = ?", item.id);

        response.status(204).send();
    }
}
