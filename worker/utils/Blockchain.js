const fetch = require('node-fetch');
const { uniq } = require('lodash');
const { TextEncoder, TextDecoder } = require('text-encoding');
const { JsonRpc, Api } = require('cyberwayjs');
const JsSignatureProvider = require('cyberwayjs/dist/eosjs-jssig').default;

const env = require('../data/env');

class Blockchain {
    constructor() {
        this.rpc = new JsonRpc(env.CYBERWAY_HTTP_URL, { fetch });
        const signatureProvider = new JsSignatureProvider(
            uniq([env.GLS_PROVIDER_KEY, env.GLS_SENDER_KEY])
        );

        this.api = new Api({
            rpc: this.rpc,
            signatureProvider,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });
    }

    async transferCMN({ userId, quantity, memo }) {
        return await this._transfer({
            contract: 'cyber.token',
            userId,
            quantity,
            memo,
        });
    }

    async transferCommunityPoints({ userId, quantity, memo }) {
        return await this._transfer({
            contract: 'c.point',
            userId,
            quantity,
            memo,
        });
    }

    async _transfer({ contract, userId, quantity, memo }) {
        const transaction = this._generateTokenTransferTransaction({
            contract,
            userId,
            quantity,
            memo,
        });

        const trx = await this.api.transact(transaction, {
            broadcast: false,
            blocksBehind: 5,
            expireSeconds: 3600,
        });

        const { transaction_id } = await this.api.pushSignedTransaction(trx);

        return {
            fromUserId: env.GLS_SENDER,
            transactionId: transaction_id,
        };
    }

    _generateTokenTransferTransaction({ contract, userId, quantity, memo }) {
        return {
            actions: [
                {
                    account: contract,
                    name: 'transfer',
                    authorization: [
                        {
                            actor: env.GLS_SENDER,
                            permission: 'active',
                        },
                    ],
                    data: {
                        from: env.GLS_SENDER,
                        to: userId,
                        quantity,
                        memo: memo || '',
                    },
                },
                this._generateProvideBwAction(),
            ],
        };
    }

    _generateProvideBwAction() {
        return {
            account: 'cyber',
            name: 'providebw',
            authorization: [
                {
                    actor: 'c',
                    permission: 'providebw',
                },
            ],
            data: {
                provider: 'c',
                account: env.GLS_SENDER,
            },
        };
    }
}

module.exports = Blockchain;
