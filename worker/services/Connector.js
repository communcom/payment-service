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
                checkPayment: {
                    handler: this._api.checkPayment,
                    scope: this._api,
                    validation: {
                        required: ['paymentId'],
                        properties: {
                            paymentId: {
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
