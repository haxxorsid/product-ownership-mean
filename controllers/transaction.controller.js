const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');
const inventoryController = require('../controllers/inventory.controller');
const { validationResult } = require('express-validator/check');
const {errorFormatter} = require('../scripts/error.script');

function checkIfResultValid(result, itemIds) {
    if (result && result.length == itemIds.length) {
        for (var i = 0; i < result.length; i++) {
            if (result[i].toJSON().hasOwnProperty('deleted_at')) {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
}

exports.create = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        User.findOne({ cin: req.body.cin }, { lean: true }, function (err, user1) {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            } else {
                if (user1) {
                    User.findOne({ cin: req.body.receiver }, { lean: true }, async function (err, user2) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                        } else {
                            if (user2) {
                                let itemIds = [];
                                async function iterateList(i) {
                                    if (i < req.body.list.length) {
                                        return inventoryController.getItemIdBySGTIN(req.body.list[i]).then((itemId) => {
                                            if (itemId != false) {
                                                itemIds.push(itemId);
                                                return iterateList(i + 1);
                                            } else {
                                                res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Item " + req.body.list[i] + " not found"] });
                                            }
                                        });
                                    } else {
                                        return true;
                                    }
                                }
                                await iterateList(0);
                                let result = await inventoryController.getItemsOwned(user1._id, itemIds, 0);

                                if (checkIfResultValid(result, itemIds)) {
                                    let transaction = new Transaction(
                                        {
                                            sender: user1._id,
                                            receiver: user2._id,
                                            list: itemIds,
                                            status: "Pending"
                                        }
                                    );
                                    transaction.save(function (err) {
                                        if (err) {
                                            console.log(err);
                                            res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                                        } else {
                                            res.json({ status: 'success', msg: 'Transaction created' });
                                        }
                                    });
                                } else {
                                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Owner doesn't own promised items"] });
                                }
                            } else {
                                res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Receiver not found"] });
                            }
                        }
                    });
                } else {
                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Sender not found"] });
                }
            }
        });
    } catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
}

exports.accept = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        Transaction.findOne({ id: req.params.id }, async function (err, transaction) {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            } else {
                if (transaction) {
                    let result = await inventoryController.getItemsOwned(transaction.sender, transaction.list, 0);
                    if (checkIfResultValid(result, transaction.list)) {
                        let result = {};
                        User.findOne({ _id: transaction.receiver }, async function (err, user) {
                            if (user.cin !== req.body.cin) {
                                res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["User is not the receiver"] });
                            } else {
                                transaction.status = "Done";
                                transaction.save();
                                await inventoryController.insertItems(transaction.receiver, transaction.list, 0);
                                res.json({ status: 'success', msg: 'Transaction performed' });
                            }
                        });
                    } else {
                        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Owner doesn't own promised items"] });
                    }

                } else {
                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Transaction not found"] });
                }
            }
        });
    } catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
}

exports.cancel = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        Transaction.findOne({ id: req.params.id }, function (err, transaction) {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            } else {
                if (transaction) {
                    let result = {};
                    User.findOne({ _id: transaction.sender }, function (err, user1) {
                        User.findOne({ _id: transaction.receiver }, function (err, user2) {
                            if (user1.cin !== req.body.cin && user2.cin !== req.body.cin) {
                                res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["User is not authorized to cancel the transaction"] });
                            } else {
                                if (user1.cin === req.body.cin) {
                                    transaction.set({ status: "Cancelled By Sender" });
                                } else {
                                    transaction.set({ status: "Cancelled By Receiver" });
                                }
                                transaction.set({ deleted_at: Date() });
                                transaction.save();
                                res.json({ status: 'success', msg: 'Transaction cancelled' });
                            }
                        });
                    });
                } else {
                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Transaction not found"] });
                }
            }
        });
    } catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
}

exports.getTransactionByCIN = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        User.findOne({ cin: req.params.cin }, function (err, user) {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            } else {
                if (user) {
                    let result = {};
                    Transaction.find({ sender: user._id }, { _id: 0, __v: 0 }, { lean: true }, async function (err, transactions) {
                        for (var i = 0; i < transactions.length; i++) {
                            let trans = transactions[i];
                            trans["sender"] = user.cin;
                            let receiver = await User.findOne({ _id: trans["receiver"] });
                            trans["receiver"] = receiver.cin;
                            for (var j = 0; j < trans.list.length; j++) {
                                trans.list[j] = await inventoryController.getItemSGTINbyID(trans.list[j]);
                            }
                        }
                        result['sender'] = transactions;
                        Transaction.find({ receiver: user._id }, { _id: 0, __v: 0 }, { lean: true }, async function (err, transactions) {
                            for (var i = 0; i < transactions.length; i++) {
                                let trans = transactions[i];
                                trans['receiver'] = user.cin;
                                let sender = await User.findOne({ _id: trans["sender"] });
                                trans["sender"] = sender.cin;
                                for (var j = 0; j < trans.list.length; j++) {
                                    trans.list[j] = await inventoryController.getItemSGTINbyID(trans.list[j]);
                                }
                            }
                            result['receiver'] = transactions;
                            res.json({ status: 'success', msg: 'Transaction found', data: result });
                        })
                    });
                } else {
                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["User not found"] });
                }
            }
        });
    } catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
}

exports.getTransactionByID = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        User.findOne({cin: decoded.cin}, function(err, user){
            if(err || !user){
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            }else{
                Transaction.findOne({ id: req.params.id }, { _id: 0, __v: 0 }, { lean: true }, function (err, transaction) {
                    if (err) {
                        console.log(err);
                        res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                    } else {
                        if (transaction) {
                            if(transaction.sender === user._id || transaction.receiver === user._id){
                                User.findOne({ _id: transaction.sender }, function (err, user) {
                                    transaction['sender'] = user.cin;
                                    User.findOne({ _id: transaction.receiver }, async function (err, user) {
                                        transaction['receiver'] = user.cin;
                                        for (var i = 0; i < transaction.list.length; i++) {
                                            transaction.list[i] = await inventoryController.getItemSGTINbyID(transaction.list[i]);
                                        }
                                        res.json({ status: 'success', msg: 'Transaction found', data: transaction });
                                    })
                                });
                            }else{
                                res.status(403 ).json({ status: 'error', msg: 'Unauthorized access'});
                            }
                        } else {
                            res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Transaction not found"] });
                        }
                    }
                });
            }
        });
    } catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
}