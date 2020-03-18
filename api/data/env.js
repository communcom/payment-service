const coreEnv = require('../../common/data/env');

module.exports = {
    ...coreEnv,
    GLS_API_KEY: process.env.GLS_API_KEY,
    GLS_WORKER_CONNECT: process.env.GLS_WORKER_CONNECT,
};
