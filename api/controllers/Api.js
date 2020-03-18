const { v1: uuid } = require('uuid');
const env = require('../../common/data/env');

// Format: "123.123 TOKEN", "1.1234 TOKEN" where TOKEN 3-10 symbols.
const QUANTITY_RX = /^\d+\.(\d{3,4}) ([A-Z]{3,10})$/;

class Api {
    constructor({ queue }) {
        if (!env.GLS_API_KEY) {
            throw new Error('env GLS_API_KEY is not specified');
        }

        this._queue = queue;
    }

    async sendPayment({ apiKey, userId, quantity, memo }) {
        if (env.GLS_API_KEY !== apiKey) {
            throw {
                code: 401,
                message: 'Unauthorized',
            };
        }

        if (!this._checkQuantity(quantity)) {
            Logger.warn(`sendPayment: Invalid quantity value: "${quantity}"`);

            throw {
                code: 500,
                message: `Invalid quantity value: "${quantity}"`,
            };
        }

        const id = uuid();

        this._queue.send({ id, userId, quantity, memo });

        return {
            id,
        };
    }

    _checkQuantity(quantity) {
        const match = quantity.match(QUANTITY_RX);

        if (!match) {
            return false;
        }

        if (match[2] === 'CMN') {
            if (match[1].length !== 4) {
                return false;
            }
        } else {
            if (match[1].length !== 3) {
                return false;
            }
        }

        return true;
    }
}

module.exports = Api;
