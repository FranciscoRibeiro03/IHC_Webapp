export default class Middleware {
    constructor(manager, app, options = {}) {
        this.manager = manager;
        this.app = app;
        
        if (!options.name) throw new Error('Middleware name is required');
        this.name = options.name;
    }

	async run(request, response, next) {
		throw new Error(`The run method has not been implemented by Middleware:${this.name}.`);
	}
	
}
