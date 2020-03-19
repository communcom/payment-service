const core = require('cyberway-core-service');
const { Service } = core.services;
const { Logger, sendAlert } = core.utils;
const TransferModel = require('../models/Transfer');
const Blockchain = require('../utils/Blockchain');

const PARALLEL_COUNT = 10;
const DEFAULT_PENALTY_MS = 5000;
const MAX_PENALTY_MULTIPLIER = 100;

class Sender extends Service {
    constructor({ stats }) {
        super();
        this._stopping = false;
        this._bc = new Blockchain();
        this._stats = stats;

        this._inProcessCounter = 0;
    }

    async start() {
        this._startWorkLoop().catch(err => {
            Logger.error('Critical Error: Sender: work loop failed:', err);
            this.turnOff();
        });
    }

    async stop() {
        await new Promise(resolve => {
            this._stopResolve = resolve;
            this.turnOff({ gracefulStop: true });
        });
    }

    async _startWorkLoop() {
        while (true) {
            const transfers = await TransferModel.find(
                {
                    status: 'pending',
                    nextTryAt: {
                        $lte: Date.now(),
                    },
                },
                {
                    id: true,
                    toUserId: true,
                    quantity: true,
                    memo: true,
                    failCount: true,
                },
                {
                    limit: PARALLEL_COUNT,
                    lean: true,
                    sort: {
                        nextTryAt: 1,
                    },
                }
            );

            if (transfers.length === 0) {
                await this._idle(5000);
            } else {
                await Promise.all(
                    transfers.map(async transfer => {
                        this._inProcessCounter++;

                        try {
                            await this._handleTransfer(transfer);
                        } catch (err) {
                            Logger.error('Critical Error:', err);
                            this.turnOff();
                        }

                        this._inProcessCounter--;

                        if (this._stopping && this._inProcessCounter === 0) {
                            this._exit();
                        }
                    })
                );
            }

            if (this._stopping) {
                break;
            }
        }
    }

    turnOff({ gracefulStop } = {}) {
        this._gracefulStop = gracefulStop;

        if (this._stopping) {
            return;
        }

        this._stopping = true;

        if (!gracefulStop) {
            Logger.error('Terminating...');
        }

        setTimeout(() => {
            if (this._inProcessCounter === 0) {
                this._exit();
                return;
            }

            setTimeout(() => {
                this._exit();
            }, 10000);

            if (this._stopIdle) {
                this._stopIdle();
            }
        }, 10);
    }

    _exit() {
        if (this.isDone()) {
            return;
        }

        if (this._gracefulStop && this._stopResolve) {
            this._stopResolve();
        } else {
            process.exit(1);
        }
    }

    checkAsync() {
        if (this._stopIdle) {
            this._stopIdle();
        }
    }

    _idle(ms) {
        return new Promise(resolve => {
            this._stopIdle = resolve;

            setTimeout(() => {
                this._stopIdle = null;
                resolve();
            }, ms);
        });
    }

    async _handleTransfer({ id, toUserId, quantity, memo, failCount }) {
        await TransferModel.updateOne(
            {
                id,
            },
            {
                $set: {
                    status: 'processing',
                    statusChangedAt: new Date(),
                },
            }
        );

        let result = null;

        try {
            if (quantity.endsWith(' CMN')) {
                result = await this._bc.transferCMN({ userId: toUserId, quantity, memo });
            } else {
                result = await this._bc.transferCommunityPoints({
                    userId: toUserId,
                    quantity,
                    memo,
                });
            }
        } catch (err) {
            this._stats.inc('transfer', 'error');
            Logger.warn(
                `Transfer "${id}" failed, amount: "${quantity}", next try has scheduled,`,
                err
            );

            if (failCount === 0) {
                sendAlert({
                    type: 'error',
                    prefix: '<!channel> ',
                    title: `Transfer "${id}" failed, amount: "${quantity}"`,
                    text: err.message,
                });
            }

            await TransferModel.updateOne(
                {
                    id,
                },
                {
                    $set: {
                        status: 'pending',
                        statusChangedAt: new Date(),
                        failCount: failCount + 1,
                        nextTryAt: Date.now() + this._calculatePenalty(failCount + 1),
                    },
                }
            );
            return;
        }

        try {
            const { fromUserId, transactionId } = result;

            this._stats.inc('transfer', 'done');

            await TransferModel.updateOne(
                {
                    id,
                },
                {
                    $set: {
                        status: 'done',
                        statusChangedAt: new Date(),
                        fromUserId,
                        transactionId,
                        nextTryAt: null,
                    },
                }
            );
        } catch (err) {
            Logger.error(`Transfer "${id}", status can't be updated to "done"`);
            throw err;
        }
    }

    _calculatePenalty(failCount) {
        // base in range [0.8, 1.2)
        const penaltyBase = 0.8 + Math.random() * 0.4;
        let penaltyMultiplier;

        if (failCount === 1) {
            penaltyMultiplier = 1;
        } else {
            penaltyMultiplier = Math.min((failCount * 0.89) ** 1.5, MAX_PENALTY_MULTIPLIER);
        }

        return Math.floor(DEFAULT_PENALTY_MS * penaltyBase * penaltyMultiplier);
    }
}

module.exports = Sender;
