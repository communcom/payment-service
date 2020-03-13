const env = require('../../common/data/env');

class Api {
    constructor() {
        if (!env.GLS_API_KEY) {
            throw new Error('env GLS_API_KEY is not specified');
        }
    }

    async sendPayment({ apiKey, userId, quantity, memo }) {
        if (env.GLS_API_KEY !== apiKey) {
            throw {
                code: 401,
                message: 'Unauthorized',
            };
        }

        console.log('PAYMENT', { apiKey, userId, quantity, memo });
    }
}

module.exports = Api;
