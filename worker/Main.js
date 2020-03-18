const core = require('cyberway-core-service');
const { BasicMain } = core.services;
const env = require('./data/env');
const Sender = require('./services/Sender');
const Receiver = require('./services/Receiver');
const Statistics = require('./services/Statistics');
const Connector = require('./services/Connector');
const Api = require('./controllers/Api');

class Main extends BasicMain {
    constructor() {
        super(env);

        this.startMongoBeforeBoot();
        const stats = new Statistics();
        const sender = new Sender({ stats });
        const receiver = new Receiver({ sender, stats });
        const api = new Api();
        const connector = new Connector({ api });

        this.addNested(stats, sender, receiver, connector);
    }
}

module.exports = Main;
