const core = require('cyberway-core-service');
const { MongoDB } = core.services;

module.exports = MongoDB.makeModel(
    'Transfer',
    {
        id: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'processing', 'done'],
        },
        statusChangedAt: {
            type: Date,
            required: true,
        },
        fromUserId: {
            type: String,
        },
        toUserId: {
            type: String,
            required: true,
        },
        quantity: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        transactionId: {
            type: String,
        },
        memo: {
            type: String,
        },
        failCount: {
            type: Number,
            required: true,
            default: 0,
        },
        nextTryAt: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    {
        index: [
            {
                fields: {
                    id: 1,
                },
                options: {
                    unique: true,
                },
            },
            {
                fields: {
                    status: 1,
                    nextTryAt: 1,
                },
            },
            {
                fields: {
                    status: 1,
                    statusChangedAt: 1,
                },
            },
        ],
    }
);
