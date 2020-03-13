const env = require('../../common/data/env');

class Api {
    constructor() {
        if (!env.API_KEY) {
            throw new Error('env API_KEY is not specified');
        }
    }

    async sendPayment({ apiKey, userId, quantity, memo }) {
        if (env.API_KEY !== apiKey) {
            throw {
                code: 401,
                message: 'Unauthorized',
            };
        }

        console.log('PAYMENT', { apiKey, userId, quantity, memo });
    }
}

module.exports = Api;
