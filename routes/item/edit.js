import Route from '../../lib/Route.js';
import Database from '../../lib/database.js';
import { getItemsFromDatabase } from '../../lib/utils.js';

export default class extends Route {
    constructor(manager, app) {
        super(manager, app, {
            name: 'edit',
            route: '/item/:id/edit'
        });
    }

    /**
     * The GET method for this route.
     * @param {import('express').Request} request The request object.
     * @param {import('express').Response} response The response object.
     */
    async get(request, response) {
        const items = await getItemsFromDatabase();
        const item = items.objects.find(item => item.id === request.params.id);

        if (!item) {
            response.redirect('/');
            return;
        }

        response.render('edit', {
            path: '/item/' + request.params.id + '/edit',
            hide_search_bar: false,
            item: item,
        });
    }

    /**
     * The POST method for this route.
     * @param {import('express').Request} request The request object.
     * @param {import('express').Response} response The response object.
     */
    async post(request, response) {
        const { id, name, description, image, video } = request.body;

        const missingFields = [];
        if (!id) missingFields.push('ID');
        if (!name) missingFields.push('Name');
        if (!description) missingFields.push('Description');
        if (!image) missingFields.push('Image');

        if (missingFields.length > 0) {
            response.status(400).send(`Missing fields: ${missingFields.join(', ')}`);
            return;
        }

        // Image and video can either be a string or an array of strings.
        // If it's a string, we need to convert it to an array.
        // If it is undefined, we need to set it to an empty array.
        const imageArray = Array.isArray(image) ? image : image ? [image] : [];
        const videoArray = Array.isArray(video) ? video : video ? [video] : [];

        // Get the items from the database.
        const items = await getItemsFromDatabase();

        // Check if the item already exists.
        const itemExists = items.objects.find(item => item.id === id);

        // If the item already exists, return a 404.
        if (!itemExists) {
            response.status(404).send('Item does not exist.');
            return;
        }

        // Delete the item from the database.
        await Database.run('DELETE FROM item_image WHERE item_id = ?', [id]);
        await Database.run('DELETE FROM item_video WHERE item_id = ?', [id]);
        await Database.run('DELETE FROM item WHERE id = ?', [id]);

        // Add the new item to the database.
        await Database.run('INSERT INTO item (id, name, description) VALUES (?, ?, ?)', [id, name, description]);

        // Add the images to the database.
        for (const imageUrl of imageArray) {
            await Database.run('INSERT INTO item_image (item_id, image_url) VALUES (?, ?)', [id, imageUrl]);
        }

        // Add the videos to the database.
        for (const videoUrl of videoArray) {
            await Database.run('INSERT INTO item_video (item_id, video_url) VALUES (?, ?)', [id, videoUrl]);
        }

        // Redirect to the home page.
        response.status(201).send();
    }
}
