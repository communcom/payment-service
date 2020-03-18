const mq = require('amqplib');
const core = require('cyberway-core-service');
const { Service } = core.services;
const { Logger } = core.utils;

const env = require('../data/env');

const QUEUE_NAME = env.GLS_QUEUE_NAME;

class Queue extends Service {
    constructor() {
        super();

        this._mq = null;
        this._channel = null;
    }

    async start() {
        await super.start();

        this._mq = await mq.connect(env.GLS_MQ_CONNECT);

        this._mq.on('error', err => {
            if (this._stopping) {
                return;
            }

            Logger.error('Critical Error: Message queue connection error:', err);
            process.exit(1);
        });

        this._channel = await this._mq.createChannel();

        this._channel.on('close', () => {
            if (this._stopping) {
                return;
            }

            Logger.error('Critical Error: Message queue channel closed');
            process.exit(1);
        });

        await this._channel.assertQueue(QUEUE_NAME, {
            durable: true,
        });
    }

    send(data) {
        this._channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(data)), {
            persistent: true,
        });
    }

    async stop() {
        this._stopping = true;

        try {
            this._mq.close();
        } catch (err) {}

        await super.stop();
    }
}

module.exports = Queue;
