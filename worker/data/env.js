const coreEnv = require('../../common/data/env');

module.exports = {
    ...coreEnv,
    CYBERWAY_HTTP_URL: process.env.CYBERWAY_HTTP_URL,
    GLS_PROVIDER_KEY: process.env.GLS_PROVIDER_KEY,
    GLS_SENDER: process.env.GLS_SENDER,
    GLS_SENDER_KEY: process.env.GLS_SENDER_KEY,
};
