const core = require('cyberway-core-service');
const { BasicMain } = core.services;
const env = require('./data/env');
const Connector = require('./services/Connector');
const Queue = require('./services/Queue');
const Api = require('./controllers/Api');

class Main extends BasicMain {
    constructor() {
        super(env);
        const queue = new Queue();
        const api = new Api({
            queue,
        });
        const connector = new Connector({
            api,
        });
        api.setConnector(connector);

        this.addNested(queue, connector);
    }
}

module.exports = Main;
