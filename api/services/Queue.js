const mq = require('amqplib');
const core = require('cyberway-core-service');
const { Service } = core.services;

const env = require('../../common/data/env');

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
            Logger.error('Critical Error:', err);
            process.exit(1);
        });

        this._channel = await this._mq.createChannel();
        await this._channel.assertQueue(QUEUE_NAME, {
            durable: true,
        });
    }

    async send(data) {
        this._channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(data)), {
            persistent: true,
        });
    }
}

module.exports = Queue;
