import cors from 'cors';
import path from 'path';
import http from 'http';
import express from 'express';
import { fileURLToPath } from 'url';
import session from 'express-session';
import SQLiteStore from 'connect-sqlite3';

import Database from './lib/database.js';
import Logger from './lib/logger.js';
import { readDirRecursiveSync } from './lib/utils.js';

export default class ExpressApp {
    constructor() {
        this.routes = new Map();
        this.middlewares = new Map();

        const SQLiteStoreSession = SQLiteStore(session);

        this.app = express();

        this.app.use(cors());

        this.app.use((req, res, next) => {
            express.json({ limit: '100mb' })(req, res, err => {
                if (err) {
                    Logger.error(err);
                    return res.status(400).send('Invalid Body');
                }
                next();
            }
        )});

        this.app.use(express.urlencoded({ extended: true }));

        this.app.set('view engine', 'ejs');
        this.app.set('views', 'views');

        this.app.use(express.static('public'));

        this.app.use(session({
            name: '__Host-meta-quest-mr-webapp',
            secret: 'Meta-Quest-MR-WebApp-Secret-Key',
            resave: false,
            saveUninitialized: false,
            store: new SQLiteStoreSession({
                db: 'database.db'
            }),
            cookie: {
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: 'lax',
                httpOnly: true,
            }
        }));

        this.app.use((req, res, next) => {
            res.locals.isAuthenticated = true;
            next();
        });

        this.init().then(r => Logger.info('ExpressApp initialized'));
    }

    async init() {
        await Database.init();
        await this.configureMiddlewares();
        await this.configureRoutes();

        this.app.use((req, res, next) => {
            const timestampBasedId = Date.now().toString(36).toUpperCase();
            Logger.warn(`[${timestampBasedId}] User ${req.ip} tried to access ${req.method} ${req.url} but it doesn't exist`);

            res.status(404).render('notfound', {
                path: '/404',
                hide_search_bar: false,
                id: timestampBasedId,
            });
        });

        this.app.use((err, req, res, next) => {
            const timestampBasedId = Date.now().toString(36).toUpperCase();
            Logger.error(`[${timestampBasedId}] Error while processing ${req.method} ${req.url}`);
            Logger.error(err);

            res.status(500).render('error', {
                path: '/500',
                hide_search_bar: false,
                id: timestampBasedId,
            });
        });
    }

    async configureMiddlewares() {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const middlewares = readDirRecursiveSync(__dirname + '/middlewares');
        for (const middleware of middlewares) {
            const loaded = await import(middleware);
            const loadedMiddleware = 'default' in loaded ? loaded.default : loaded;
            if (!loadedMiddleware) continue;
            const middlewareInstance = new loadedMiddleware(this, this.app);
            this.middlewares.set(middlewareInstance.name, middlewareInstance);
            Logger.debug(
                `Loaded middleware ${middlewareInstance.name}`
            );
        }
    }

    async configureRoutes() {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const routes = readDirRecursiveSync(__dirname + '/routes');
        for (const route of routes) {
            const loaded = await import(route);
            const loadedRoute = 'default' in loaded ? loaded.default : loaded;
            if (!loadedRoute) continue;
            const routeInstance = new loadedRoute(this, this.app);
            this.routes.set(routeInstance.name, routeInstance);
            Logger.debug(
                `Loaded route ${routeInstance.name} on ${routeInstance.route}`
            );
        }
    }

    listen(httpPort) {
        this.httpServer = http.createServer(this.app);
        this.httpServer.listen(httpPort, () => {
            Logger.info(`API listening on port ${httpPort}`);
        });
    }
}
