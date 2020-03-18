const core = require('cyberway-core-service');
const { BasicMain } = core.services;
const env = require('../common/data/env');
const Sender = require('./services/Sender');
const Receiver = require('./services/Receiver');
const Statistics = require('./services/Statistics');

class Main extends BasicMain {
    constructor() {
        super(env);

        this.startMongoBeforeBoot();
        const stats = new Statistics();
        const sender = new Sender({ stats });
        const receiver = new Receiver({ sender, stats });

        this.addNested(stats, sender, receiver);
    }
}

module.exports = Main;
