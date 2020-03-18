const TransferModel = require('../models/Transfer');

class Api {
    async checkPayment({ paymentId }) {
        const transfer = await TransferModel.findOne(
            {
                id: paymentId,
            },
            {
                status: true,
                transactionId: true,
            },
            {
                lean: true,
            }
        );

        if (!transfer) {
            throw {
                code: 404,
                message: 'Payment is not found',
            };
        }

        return {
            id: paymentId,
            isDone: transfer.status === 'done',
            transactionId: transfer.transactionId || null,
        };
    }
}

module.exports = Api;
