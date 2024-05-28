import Route from '../lib/Route.js';
import Logger from '../lib/logger.js';

import { IMGUR_CLIENT_ID } from '../lib/consts.js'

export default class extends Route {
    constructor(manager, app) {
        super(manager, app, {
            name: 'uploadMedia',
            route: '/upload',
        });
    }

    /**
     * The POST method for this route.
     * @param {import('express').Request} request The request object.
     * @param {import('express').Response} response The response object.
     */
    async post(request, response) {
        if (!request.body || !request.body.file) {
            return response.status(400).end();
        }

        const { file } = request.body;

        const fileData = file.data.replace(/^data:(image|video)\/\w+;base64,/, '');

        const formData = new FormData();
        formData.append('image', fileData);
        formData.append('type', 'base64');
        formData.append('title', 'Uploaded Image');
        formData.append('description', 'Uploaded with the Media Manager');

        const imgurResponse = await fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
                'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
            },
            body: formData,
            redirect: 'follow'
        }).catch(() => null);

        if (!imgurResponse) {
            Logger.error('Failed to upload image to Imgur');
            return response.status(500).end();
        }

        const imgurJson = await imgurResponse.json().catch(() => null);
        if (!imgurJson || !imgurJson.data || !imgurJson.data.link) {
            Logger.error('Failed to parse Imgur response');
            Logger.error(imgurJson);
            return response.status(500).end();
        }

        if (imgurJson.data.processing && imgurJson.data.processing.status) {
            const mediaHash = imgurJson.data.id;
            let imgurStatus = imgurJson.data.processing.status;
            while (imgurStatus !== "completed") {
                await new Promise(resolve => setTimeout(resolve, 500));
                const imgurResponse = await fetch(`https://api.imgur.com/3/image/${mediaHash}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
                    },
                    redirect: 'follow'
                }).catch(() => null);
                const imgurJson = await imgurResponse.json().catch(() => null);
                imgurStatus = imgurJson.data.processing.status;
            }
        }

        return response.status(201).send(imgurJson.data.link);
    }
}
