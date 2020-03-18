const core = require('cyberway-core-service');
const { Connector: BasicConnector } = core.services;
const env = require('../data/env');

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
                checkPayment: {
                    handler: this._api.checkPayment,
                    scope: this._api,
                    validation: {
                        required: ['apiKey', 'paymentId'],
                        properties: {
                            apiKey: {
                                type: 'string',
                            },
                            paymentId: {
                                type: 'string',
                            },
                        },
                    },
                },
            },
            requiredClients: {
                paymentWorker: env.GLS_WORKER_CONNECT,
            },
        });
    }
}

module.exports = Connector;
