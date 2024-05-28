#!/usr/bin/env node
import sqlite3 from 'sqlite3';
import { readFileSync, existsSync, rmSync } from 'fs';

const items = [
    {
        "id": "pc_francisco",
        "name": "PC Francisco",
        "description": "Este é o PC do Francisco. É muito bom.",
        "images": [
            "https://p2-ofp.static.pub/fes/cms/2023/02/14/hs6xs9wjsyekx1wnlv9cx2y12t79il629810.png",
            "https://www.worten.pt/i/5fa371b50d7845a068f0dfcd2b678b8610aa08ca.jpg"
        ],
        "videos": [
            "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
        ]
    },
    {
        "id": "pc_aoki",
        "name": "PC Aoki",
        "description": "Este é o PC do Aoki. É pior que o PC do Francisco. :>",
        "images": [
            "https://assetsio.gnwcdn.com/asus-rog-zephyrus-g14-2022-(3).jpg",
            "https://dlcdnwebimgs.asus.com/files/media/374F7027-F79C-4971-B4D1-E16F45C0848E/v2/images/large/1x/carousel_4_1.png"
        ],
        "videos": [
            "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
            "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
        ]
    }
]

async function runDatabase(db, query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

async function main() {
    if (existsSync('./database.db')) {
        rmSync('./database.db');
    }

    const db = new sqlite3.Database('./database.db');

    const commandsToExecute = readFileSync('./init.sql', 'utf-8').split(';').map((command) => command.trim()).filter((command) => command.length > 0);
    for (const command of commandsToExecute) {
        await runDatabase(db, command).catch((err) => console.log(err.message));
    }
    console.log("Database initialized");

    for (const item of items) {
        await runDatabase(db, 'INSERT INTO item (id, name, description) VALUES (?, ?, ?)', [item.id, item.name, item.description]).catch((err) => console.log(err.message));
        for (const image of item.images) {
            await runDatabase(db, 'INSERT INTO item_image (item_id, image_url) VALUES (?, ?)', [item.id, image]).catch((err) => console.log(err.message));
        }
        for (const video of item.videos) {
            await runDatabase(db, 'INSERT INTO item_video (item_id, video_url) VALUES (?, ?)', [item.id, video]).catch((err) => console.log(err.message));
        }
    }

    db.close();
}

main().then(r => console.log("Done"));