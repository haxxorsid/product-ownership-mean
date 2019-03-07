const User = require('../models/user.model');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const tokenModule = require('../scripts/token.script');
const {errorFormatter} = require('../scripts/error.script');
const {decoded} = require('../middlewares/auth.middleware');

exports.createUser = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        const { cin, email, password, role } = req.body;
        const hash = bcrypt.hashSync(password, salt);
        let user = new User(
            {
                cin,
                email,
                password: hash,
                role
            }
        );

        user.save(function (err) {
            if (err) {
                if (err.code == 11000) {
                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Email/CIN already exists"] });
                } else {
                    console.log(err);
                    res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                }

            } else {
                res.json({ status: 'success', msg: 'User created' });
            }
        });
    } catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
};

exports.login = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        User.findOne({ email: req.body.email }, function (err, user) {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            } else {
                if (user) {
                    if (bcrypt.compareSync(req.body.password, user.password)) {
                        res.json({ status: 'success', msg: 'Login successful', data: { token: tokenModule.sign({ cin: user.cin, email: user.email, role: user.role }) } });
                    } else {
                        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Wrong old password"] });
                    }
                } else {
                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Invalid login details"] });
                }
            }
        });
    } catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
};

exports.resetpassword = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        const hash = bcrypt.hashSync(req.body.passwordNew, salt);
        User.findOne({ cin: req.params.cin }, function (err, user) {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            } else {
                if (user) {
                    if (bcrypt.compareSync(req.body.password, user.password)) {
                        user.password = hash;
                        user.save();
                        res.json({ status: 'success', msg: 'User updated' });
                    } else {
                        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Wrong old password"] });
                    }

                } else {
                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["User not found"] });
                }
            }
        });
    }
    catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
};

exports.resetemail = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        User.findOneAndUpdate({ cin: req.params.cin }, { $set: { email: req.body.email } }, function (err, user) {
            if (err) {
                if (err.code == 11000) {
                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["email: Email already exists"] });
                } else {
                    console.log(err);
                    res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                }
            } else {
                if (user) {
                    res.json({ status: 'success', msg: 'User updated' });
                } else {
                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["User not found"] });
                }
            }
        });
    }
    catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
};

exports.info = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        User.findOneAndUpdate({ cin: req.params.cin }, { $set: { email: req.body.email, cin: req.body.newCIN, role: req.body.role } }, function (err, user) {
            if (err) {
                if (err.code == 11000) {
                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["Email/CIN already exists"] });
                } else {
                    console.log(err);
                    res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                }
            } else {
                if (user) {
                    res.json({ status: 'success', msg: 'User updated' });
                } else {
                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["User not found"] });
                }
            }
        });
    }
    catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
};

exports.prefix = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        User.findOne({ cin: req.params.cin }, function (err, user) {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            } else {
                if (user) {
                    if (decoded.role !== "Admin" && !user.toJSON().hasOwnProperty('company_prefix')) {
                        user.company_prefix = req.body.company_prefix;
                        user.save(function (err, user) {
                            if (err) {
                                if (err.code == 11000) {
                                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["company_prefix: Company Prefix already exists"] });
                                } else {
                                    console.log(err);
                                    res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
                                }
                            } else {
                                res.json({ status: 'success', msg: 'User updated' });
                            }
                        });
                    } else {
                        res.status(422).json({ status: 'error', msg: 'Company prefix already set.' });
                    }
                } else {
                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["User not found"] });
                }
            }

        });
    }
    catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
};

exports.deleteUser = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        User.findOneAndUpdate({ cin: req.params.cin }, { $set: { deleted_at: Date.now } }, function (err, user) {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            } else {
                if (user) {
                    res.json({ status: 'success', msg: 'User deleted' });
                } else {
                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["User not found"] });
                }
            }
        });
    } catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
};

exports.getUsers = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        User.find({}, { _id: 0, list: 0, password: 0, last_item_ref: 0, __v: 0 }, function (err, users) {
            var userMap = {};

            users.forEach(function (user) {
                userMap[user.cin] = user;
            });
            res.json({ status: 'success', msg: 'Users found', data: userMap });
        });
    }catch(err){
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }
}

exports.getUserByCIN = function (req, res) {
    try {
        validationResult(req).formatWith(errorFormatter).throw();
        User.findOne({ cin: req.params.cin }, { _id: 0, list: 0, password: 0, last_item_ref: 0, __v: 0 }, function (err, user) {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 'error', msg: 'Some unknown error occurred' });
            } else {
                if (user) {
                    res.json({ status: 'success', msg: 'User found', data: user });
                } else {
                    res.status(422).json({ status: 'error', msg: 'Invalid input', reason: ["User not found"] });
                }
            }

        });
    } catch (err) {
        res.status(422).json({ status: 'error', msg: 'Invalid input', reason: err.array({ onlyFirstError: true }) });
    }

}