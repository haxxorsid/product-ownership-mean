const User = require('../models/user.model');
const Product = require('../models/product.model');
const { validationResult } = require('express-validator/check');
const {decoded} = require('../middlewares/auth.middleware');
const {errorFormatter} = require('../scripts/error.script');

function getLength(number) {
    return number.toString().length;
}

exports.addProduct = function (req, res, next) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        const { cin, title } = req.body;
        User.findOne({ cin }, function (err, user) {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            } else {
                if (user && user.role === 'Manufacturer') {
                    if (user.toJSON().hasOwnProperty('company_prefix')) {
                        if (user.company_prefix.length + getLength(user.last_item_ref + 1) > 13) {
                            res.send(422).json({ status: 'error', msg: 'Cannot add more product. Limit exceeded.' })
                        } else {
                            let product = new Product(
                                {
                                    item_ref: user.last_item_ref + 1,
                                    cin,
                                    title
                                }
                            );
                            product.save(function (err, product) {
                                if (err) {
                                    console.log(err);
                                    res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                                } else {
                                    user.list.push(product._id);
                                    user.last_item_ref = user.last_item_ref + 1;
                                    user.save(function (edrr) {
                                        if (err) {
                                            console.log(err);
                                            res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                                        } else {
                                            res.json({ status: 'success', msg: 'Product added' });
                                        }
                                    });
                                }
                            });
                        }
                    } else {
                        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Company prefix not set"] })
                    }
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

exports.updateProduct = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        const { cin } = req.body;
        Product.find({ item_ref: req.params.item_ref }, function (err, products) {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            } else {
                if (products) {
                    User.findOne({ cin }, function (err, user) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                        } else {
                            if (user) {
                                let productFound;
                                products.forEach(function (product) {
                                    if (user.list.indexOf(product._id) != -1) {
                                        productFound = product;
                                    }
                                });
                                if (productFound) {
                                    productFound.title = req.body.title;
                                    productFound.save();
                                    res.json({ status: 'success', msg: 'Product updated' });
                                } else {
                                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["No such product found under the user"] });
                                }
                            } else {
                                res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["User not found"] });
                            }
                        }
                    });
                } else {
                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Product not found"] });
                }
            }
        });
    }
    catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
};

exports.deleteProduct = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        const { cin } = req.body;
        Product.find({ item_ref: req.params.item_ref }, function (err, products) {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            } else {
                if (products) {
                    User.findOne({ cin }, function (err, user) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                        } else {
                            if (user) {
                                let productFound;
                                products.forEach(function (product) {
                                    if (user.list.indexOf(product._id) != -1) {
                                        productFound = product;
                                    }
                                });
                                if (productFound) {
                                    productFound.set({ deleted_at: Date() });
                                    productFound.save();
                                    res.json({ status: 'success', msg: 'Product deleted' });
                                } else {
                                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["No such product found under the user"] });
                                }
                            } else {
                                res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["User not found"] });
                            }
                        }
                    });
                } else {
                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Product not found"] });
                }
            }
        });
    }
    catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
};

exports.restoreProduct = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        const { cin } = req.body;
        Product.find({ item_ref: req.params.item_ref }, function (err, products) {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            } else {
                if (products) {
                    User.findOne({ cin }, function (err, user) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                        } else {
                            if (user) {
                                let productFound;
                                products.forEach(function (product) {
                                    if (user.list.indexOf(product._id) != -1) {
                                        productFound = product;
                                    }
                                });
                                if (productFound) {
                                    productFound.deleted_at = undefined;
                                    productFound.save();
                                    res.json({ status: 'success', msg: 'Product restored' });
                                } else {
                                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["No such product found under the user"] });
                                }
                            } else {
                                res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["User not found"] });
                            }
                        }
                    });
                } else {
                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Product not found"] });
                }
            }
        });
    }
    catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
};

exports.getProductsByCIN = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        User.findOne({ cin: req.params.cin }, function (err, user) {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            } else {
                if (user) {
                    Product.find({ '_id': { $in: user.list } }, { _id: 0, __v: 0, last_unique_serial: 0 }, function (err, products) {
                        let output = {};
                        products.forEach(function (product) {
                            output[product.item_ref] = product;
                        })
                        res.json({ status: 'success', msg: 'Products found', data: output });
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

exports.getProductByItemRef = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        User.findOne({cin: decoded.cin}, function(err, user){
            if(err || !user){
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            }else{
                Product.find({ item_ref: req.params.item_ref }, {  __v: 0, last_unique_serial: 0 }, function (err, products) {
                    if (err) {
                        console.log(err);
                        res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                    } else {
                        if (products) {
                            let productsOwnedByUser = [];
                            for(var i=0;i<products.length;i++){
                                if(user.list.indexOf(products[i]._id)!=-1){
                                    products[i]._id = undefined;
                                    productsOwnedByUser.push(products[i]);
                                }
                            }
                            res.json({ status: 'success', msg: 'Product found', data: productsOwnedByUser });
                        } else {
                            res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["No products found"] });
                        }
                    }
                });
            }
        });
    } catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
}