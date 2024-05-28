export default class Route {
    constructor(manager, app, options = {}) {
        this.manager = manager;
        this.app = app;

        if (!options.name) throw new Error('Route name is required');
        if (!options.route) throw new Error('Route route is required');

        this.name = options.name;
        this.route = options.route;

        this.middlewares = [];

        for (const middleware of options.middlewares ?? []) {
            const appMiddleware = this.manager.middlewares.get(middleware);
            if (!appMiddleware) throw new Error(`Middleware ${middleware} not found`);

            this.middlewares.push(appMiddleware.run);
        }

        if (this.get)
            this.app.get(options.route, this.middlewares, (req, res, next) => this.get(req, res, next));
        if (this.post)
            this.app.post(options.route, this.middlewares, (req, res, next) => this.post(req, res, next));
        if (this.delete)
            this.app.delete(options.route, this.middlewares, (req, res, next) => this.delete(req, res, next));
    }
}
