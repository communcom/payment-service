const mq = require('amqplib');
const core = require('cyberway-core-service');
const { Service } = core.services;
const { Logger } = core.utils;
const env = require('../../common/data/env');
const TransferModel = require('../models/Transfer');

const QUEUE_NAME = env.GLS_QUEUE_NAME;

class Receiver extends Service {
    constructor({ sender, stats }) {
        super();
        this._sender = sender;
        this._stats = stats;
    }

    async start() {
        await super.start();

        this._mq = await mq.connect(env.GLS_MQ_CONNECT);

        this._mq.on('error', err => {
            if (this._stopping) {
                return;
            }

            Logger.error('Message queue connection error:', err);

            try {
                this._mq.close();
            } catch (err) {}

            this._sender.turnOff();
        });

        this._channel = await this._mq.createChannel();

        this._channel.on('close', () => {
            if (this._stopping) {
                return;
            }

            Logger.error('Message queue channel closed');
            this._sender.turnOff();
        });

        await this._channel.assertQueue(QUEUE_NAME, {
            durable: true,
        });

        this._channel.consume(
            QUEUE_NAME,
            async msg => {
                const data = JSON.parse(msg.content);

                try {
                    await this._saveRequest(data);
                    this._channel.ack(msg);
                    this._stats.inc('receiver', 'received');
                    this._sender.checkAsync();
                } catch (err) {
                    Logger.error('Payment saving failed:', err);

                    try {
                        this._mq.close();
                    } catch (err) {}

                    this._sender.turnOff();
                }
            },
            { noAck: false }
        );
    }

    async stop() {
        this._stopping = true;

        try {
            this._mq.close();
        } catch (err) {}

        await super.stop();
    }

    async _saveRequest({ id, userId, quantity, memo }) {
        try {
            await TransferModel.create({
                id,
                status: 'pending',
                statusChangedAt: new Date(),
                token: quantity.match(/\s([A-Z]{3,10})$/)[1],
                toUserId: userId,
                quantity,
                memo: memo || null,
            });
        } catch (err) {
            // If duplication then do nothing
            if (!(err.name === 'MongoError' && err.code === 11000)) {
                throw err;
            }
        }
    }
}

module.exports = Receiver;
