const core = require('cyberway-core-service');
const { Service } = core.services;
const { Logger } = core.utils;
const TransferModel = require('../models/Transfer');

const LOG_EVERY_MS = 60 * 60 * 1000;

class Statistics extends Service {
    constructor() {
        super();

        this._reset();
    }

    _reset() {
        this._values = {
            transfer: {
                error: 0,
                done: 0,
                hung_inprogress: 0,
            },
            receiver: {
                received: 0,
            },
        };
    }

    async start() {
        setTimeout(() => {
            this._check();
        }, 5000);

        this._interval = setInterval(() => {
            this._check();
        }, LOG_EVERY_MS);
    }

    async stop() {
        clearInterval(this._interval);
    }

    inc(namespace, key) {
        let data = this._values[namespace];

        if (!data) {
            data = this._values[namespace] = {};
        }

        data[key] = (data[key] || 0) + 1;
    }

    async _check() {
        try {
            const deltaSecondAgo = new Date();
            deltaSecondAgo.setSeconds(deltaSecondAgo.getSeconds() - 10);

            const results = await TransferModel.count({
                status: 'processing',
                statusChangedAt: {
                    $lte: deltaSecondAgo,
                },
            });

            const values = this._values;
            this._reset();

            values.transfer.hung_inprogress = results;

            const chunks = [];

            for (const [key, value] of Object.entries(values)) {
                chunks.push(`${key} ${JSON.stringify(value)}`);
            }

            Logger.info(`[Statistics] ${chunks.join(' ')}`);
        } catch (err) {
            Logger.warn('Statistics processing failed:', err);
        }
    }
}

module.exports = Statistics;
