module.exports = {
    CYBERWAY_HTTP_URL: process.env.CYBERWAY_HTTP_URL,
    GLS_API_KEY: process.env.GLS_API_KEY,
    GLS_PROVIDER_KEY: process.env.GLS_PROVIDER_KEY,
    GLS_SENDER: process.env.GLS_SENDER,
    GLS_SENDER_KEY: process.env.GLS_SENDER_KEY,

    GLS_MQ_CONNECT: process.env.GLS_MQ_CONNECT,
    GLS_QUEUE_NAME: process.env.GLS_QUEUE_NAME || 'payments',
};
