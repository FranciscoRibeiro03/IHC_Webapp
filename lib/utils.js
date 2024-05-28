import { readdirSync, statSync } from 'fs';

import Database from './database.js';

/**
 * Reads files recursively and returns an array of all the files
 * @param {string} dir The directory to read
 * @returns {string[]} An array of all the files in the directory
 */
export function readDirRecursiveSync(dir) {
    let results = [];
    const list = readdirSync(dir);
    for (let file of list) {
        file = dir + '/' + file;
        const stat = statSync(file);
        if (stat && stat.isDirectory()) {
            /* Recurse into a subdirectory */
            results = results.concat(readDirRecursiveSync(file));
        } else {
            /* Is a file */
            results.push(file);
        }
    }
    return results;
}

/**
 * Gets all the items from the database, formatted for the API
 * @returns {Promise<Object>} The formatted items
 */
export async function getItemsFromDatabase() {
    const items = await Database.getAll(`SELECT * FROM item`);

    const formattedItems = { objects: [] };

    for (const item of items) {
        const formattedItem = {
            id: item.id,
            name: item.name,
            description: item.description,
            images: [],
            videos: []
        };

        const images = await Database.getAll(`SELECT * FROM item_image WHERE item_id = ?`, [item.id]);
        for (const image of images) {
            formattedItem.images.push(image.image_url);
        }

        const videos = await Database.getAll(`SELECT * FROM item_video WHERE item_id = ?`, [item.id]);
        for (const video of videos) {
            formattedItem.videos.push(video.video_url);
        }

        formattedItems.objects.push(formattedItem);
    }

    return formattedItems;
}
