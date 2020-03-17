const core = require('cyberway-core-service');
const { BasicMain } = core.services;
const env = require('../common/data/env');
const Sender = require('./services/Sender');
const Receiver = require('./services/Receiver');

class Main extends BasicMain {
    constructor() {
        super(env);

        this.startMongoBeforeBoot();
        const sender = new Sender();
        const receiver = new Receiver({ sender });

        this.addNested(sender, receiver);
    }
}

module.exports = Main;
