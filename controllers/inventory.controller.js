const Inventory = require('../models/inventory.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const { validationResult } = require('express-validator/check');
const {errorFormatter} = require('../scripts/error.script');

function getLength(number) {
    return number.toString().length;
}

function prefix(x, y) {
    let num = x.length + getLength(y);
    return "0".repeat(13 - num);
}

async function insertItems(userId, itemIds, i) {
    if (i < itemIds.length) {
        Inventory.findOne({ _id: itemIds[i] }, async function (err, item) {
            if (item) {
                item.deleted_at = Date();
                await item.save();
                let newItem = new Inventory({
                    owner: userId,
                    company_prefix: item.company_prefix,
                    item_ref: item.item_ref,
                    unique_serial: item.unique_serial
                });
                await newItem.save();
                await insertItems(userId, itemIds, i + 1);
            }
        });
    }
}
module.exports.insertItems = insertItems;

exports.getItemsOwned = function (userId, itemIds, i) {
    return Inventory.find({ owner: userId, _id: { $in: itemIds } }, function (err, items) {

    });
}

exports.getItemIdBySGTIN = async function (sgtin) {
    let parts = sgtin.split('-');
    let prefix = parts[0];
    let ref = Number(parts[1]);
    let serial = Number(parts[2]);
    return Inventory.findOne({ company_prefix: prefix, item_ref: ref, unique_serial: serial }, { lean: true }, function (err, item) {
        if (item) {
            return item._id;
        } else {
            return false;
        }
    });
}
exports.getItemSGTINbyID = async function (id) {
    let item = await Inventory.findOne({ _id: id });
    return item.company_prefix + '.' + prefix(item.company_prefix, item.item_ref) + item.item_ref + '.' + item.unique_serial;
}

exports.produce = function (req, res, next) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        const { cin } = req.body;
        User.findOne({ cin }, function (err, user) {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            } else {
                if (user && user.role === 'Manufacturer' && user.company_prefix) {
                    Product.find({ item_ref: req.params.item_ref }, async function (err, products) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                        } else {
                            let productFound;
                            products.forEach(function (product) {
                                if (user.list.indexOf(product._id) != -1) {
                                    productFound = product;
                                }
                            });
                            if (productFound && !productFound.toJSON().hasOwnProperty('deleted_at')) {
                                if (productFound.last_unique_serial + 1 > 274877906943) {
                                    res.send(422).json({ status: 'error', msg: 'Invalid input', reason: ['Cannot produce more than 274877906943 copies of a product.'] })
                                } else {
                                    productFound.last_unique_serial = productFound.last_unique_serial + 1;
                                    let result = await Inventory.findOne({ company_prefix: user.company_prefix, item_ref: req.params.item_ref, unique_serial: productFound.last_unique_serial });
                                    if (result) {
                                        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Duplication"] });
                                    } else {
                                        let item = new Inventory(
                                            {
                                                owner: user._id,
                                                company_prefix: user.company_prefix,
                                                item_ref: req.params.item_ref,
                                                unique_serial: productFound.last_unique_serial
                                            }
                                        );
                                        item.save(function (err) {
                                            if (err) {
                                                console.log(err);
                                                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                                            } else {
                                                productFound.save();
                                                res.json({ status: 'success', msg: 'Item produced' });
                                            }
                                        });
                                    }

                                }
                            } else {
                                res.status(422).json({ status: 'error', msg: 'Product with item reference not found' });
                            }
                        }
                    })
                } else {
                    if (!user) {
                        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["User not found"] });
                    } else {
                        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["User doesn't have manufacturer privilage (company prefix not set?)"] });
                    }
                }
            }

        });
    } catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
};

exports.scrap = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        User.findOne({ cin: req.body.cin }, function (err, user) {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            } else {
                if (user) {
                    let parts = req.params.sgtin.split('-');
                    let prefix = parts[0];
                    let ref = Number(parts[1]);
                    let serial = Number(parts[2]);
                    Inventory.findOne({ owner: user._id, company_prefix: prefix, item_ref: ref, unique_serial: serial }, function (err, item) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                        } else {
                            if (item) {
                                item.deleted_at = Date();
                                item.save();
                                res.json({ status: 'success', msg: 'Item deleted' });
                            } else {
                                res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Item not found"] });
                            }
                        }

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

exports.getInventoryByCIN = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        User.findOne({ cin: req.params.cin }, function (err, user) {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            } else {
                if (user) {
                    Inventory.find({ owner: user._id }, { _id: 0, __v: 0, owner: 0 }, function (err, items) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                        } else {
                            var itemsMap = {};
                            items.forEach(function (item) {
                                itemsMap[item.company_prefix + '.' + prefix(item.company_prefix, item.item_ref) + item.item_ref + '.' + item.unique_serial] = item;
                            });
                            res.json({ status: 'success', msg: 'Items found', data: itemsMap });
                        }
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

exports.getInventoryBySGTIN = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        let parts = req.params.sgtin.split('-');
        let prefix = parts[0];
        let ref = Number(parts[1]);
        let serial = Number(parts[2]);
        User.findOne({cin: decoded.cin}, function(err, user){
            if(err || !user){
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            }else{
                Inventory.findOne({ company_prefix: prefix, item_ref: ref, unique_serial: serial }, { _id: 0, __v: 0 }, { lean: true }, function (err, item) {
                    if (err) {
                        console.log(err);
                        res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                    } else {
                        if (item) {
                            if(item.owner === user._id){
                                User.findOne({ _id: item.owner }, function (err, user) {
                                    item['owner'] = user.cin;
                                    res.json({ status: 'success', msg: 'Item found', data: item });
                                });
                            }else{
                                res.status(403).json({ status: 'error', msg: 'Unauthorized access'});
                            }
                            
                        } else {
                            res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Item not found or it is not owned by the user"] });
                        }
                    }
                });
            }
        });
    } catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
}