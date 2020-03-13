const core = require('cyberway-core-service');
const { Connector: BasicConnector } = core.services;
const Api = require('../controllers/Api');

class Connector extends BasicConnector {
    constructor() {
        super();

        this._api = new Api();
    }

    async start() {
        await super.start({
            serverRoutes: {
                sendPayment: {
                    handler: this._api.sendPayment,
                    scope: this._api,
                    validation: {
                        required: ['apiKey', 'userId', 'quantity'],
                        properties: {
                            apiKey: {
                                type: 'string',
                            },
                            userId: {
                                type: 'string',
                            },
                            quantity: {
                                type: 'string',
                            },
                            memo: {
                                type: 'string',
                                default: null,
                            },
                        },
                    },
                },
            },
            requiredClients: {},
        });
    }
}

module.exports = Connector;
