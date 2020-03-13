const core = require('cyberway-core-service');
const { BasicMain } = core.services;
const env = require('../common/data/env');
const Sender = require('./services/Sender');

class Main extends BasicMain {
    constructor() {
        super(env);

        this.startMongoBeforeBoot();

        this.addNested(new Sender());
    }
}

module.exports = Main;
