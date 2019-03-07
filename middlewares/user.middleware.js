const { body, param } = require('express-validator/check');
const {validateRole, validateCIN} = require('../middlewares/auth.middleware');

exports.userMiddleware = function (method) {
    switch (method) {
        case 'createUser':
            return [
                validateRole('Admin'),
                body('cin').exists().withMessage('CIN not provided').trim().escape().isAlphanumeric().withMessage('CIN must be alphanumeric').isLength({ min: 21, max: 21 }).withMessage('CIN must be 21 chars long'),
                body('email').exists().withMessage('Email not provided').isEmail().normalizeEmail().withMessage('Invalid email format'),
                body('password').exists().withMessage('Password not provided').trim().escape().isLength({ min: 8, max: 16 }).withMessage('Password must be 8-16 chars long'),
                body('role').exists().withMessage('Role not provided').isIn(['Admin', 'Manufacturer', 'Other']).withMessage( 'Role can be either of Admin, Manufacturer or Other')
            ];
        case 'login':
            return [
                body('email').exists().withMessage('Email not provided').isEmail().normalizeEmail().withMessage('Invalid email format').normalizeEmail(),
                body('password').exists().withMessage('Password not provided').trim().escape().isLength({ min: 8, max: 16 }).withMessage('Password must be 8-16 chars long').trim().escape()
            ];
        case 'resetpassword':
            return [
                validateRole('Any'),
                param('cin').exists().withMessage('CIN not provided').trim().escape().isAlphanumeric().withMessage('Invalid CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid CIN provided'),
                validateCIN(param),
                body('password').exists().withMessage('Old Password not provided').trim().escape().isLength({ min: 8, max: 16 }).withMessage('Wrong old password'),
                body('passwordNew').exists().withMessage('New Password not provided').trim().escape().isLength({ min: 8, max: 16 }).withMessage('New Password must be 8-16 chars long'),
                body('passwordConfirmation').exists().withMessage('New Password confirmation not provided').trim().escape().custom((value, { req }) => {
                    if (value !== req.body.passwordNew) {
                      throw new Error('Password confirmation does not match new password');
                    } else {
                        return value;
                    }
                  })
            ];
        case 'resetemail':
            return [
                validateRole('Any'),
                param('cin').exists().withMessage('CIN not provided').trim().escape().isAlphanumeric().withMessage('Invalid CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid CIN provided'),
                validateCIN(param),
                body('email').exists().withMessage('Email not provided').isEmail().normalizeEmail().withMessage('Invalid email format')
            ];          
        case 'info':
            return [
                validateRole('Admin'),
                param('cin').exists().withMessage('CIN not provided').trim().escape().isAlphanumeric().withMessage('Invalid CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid CIN provided'),
                body('newCIN').exists().withMessage('CIN not provided').trim().escape().isAlphanumeric().withMessage('New CIN must be alphanumeric').isLength({ min: 21, max: 21 }).withMessage('New CIN must be 21 chars long'),
                body('email').exists().withMessage('Email not provided').isEmail().normalizeEmail().withMessage('Invalid email format'),
                body('role').exists().withMessage('Role not provided').isIn(['Admin', 'Manufacturer', 'Other']).withMessage( 'Role can be either of Admin, Manufacturer or Other')
            ];
        case 'prefix':
            return [
                validateRole('Any'),
                param('cin').exists().withMessage('CIN not provided').trim().escape().isAlphanumeric().withMessage('Invalid CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid CIN provided'),
                validateCIN(param, true),
                body('company_prefix').exists().withMessage('Company Prefix not provided').trim().escape().isNumeric().withMessage('Company Prefix must be numeric').isLength({ min: 1, max: 11 }).withMessage('Company Prefix must be 1-11 digits long'),
            ];
        case 'deleteUser':
            return [
                validateRole('Admin'),
                param('cin').exists().withMessage('CIN not provided').trim().escape().isAlphanumeric().withMessage('Invalid CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid CIN provided')
            ];
        case 'getUserByCIN':
            return [
                validateRole('Any'),
                param('cin').exists().withMessage('CIN not provided').trim().escape().isAlphanumeric().withMessage('Invalid CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid CIN provided'),
                validateCIN(param, true)
            ];
        case 'getUsers':
            return [validateRole('Admin')];
        default:
            return [];
    }
}