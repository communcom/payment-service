const coreEnv = require('../../common/data/env');

module.exports = {
    ...coreEnv,
    GLS_API_KEY: process.env.GLS_API_KEY,
    GLS_CONNECTOR_PORT: process.env.GLS_CONNECTOR_PORT,
};
