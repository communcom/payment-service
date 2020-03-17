const core = require('cyberway-core-service');
const { Connector: BasicConnector } = core.services;

class Connector extends BasicConnector {
    constructor({ api }) {
        super();
        this._api = api;
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
