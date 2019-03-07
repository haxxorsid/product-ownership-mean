const { body, param } = require('express-validator/check');
const { validateRole, validateCIN} = require('../middlewares/auth.middleware');
const shortid = require('shortid');

exports.transactionMiddleware = function (method) {
    switch (method) {
        case 'create':
            return [
                validateRole('Any'),
                body('cin').exists().withMessage('Sender CIN not provided').isAlphanumeric().withMessage('Invalid Sender CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid Sender CIN provided'),
                validateCIN(body),
                body('receiver').exists().withMessage('Receiver CIN not provided').isAlphanumeric().withMessage('Invalid Receiver CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid Receiver CIN provided'),
                body('list').isArray().withMessage('List must be an array of sgtins').custom((value) => {
                    if(value.length == 0 ){
                        throw new Error('Item array should not be empty');
                    } else {
                        return value;
                    }
                }),
            ];
        case 'accept':
            return [
                validateRole('Any'),
                param('id').exists().withMessage('ID not provided').custom((value) => {
                    if(!shortid.isValid(value)){
                        throw new Error('ID not valid');
                    } else {
                        return value;
                    }
                }),
                body('cin').exists().withMessage('CIN not provided').isAlphanumeric().withMessage('Invalid CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid CIN provided'),
                validateCIN(body)
            ];            
        case 'cancel':
            return [
                validateRole('Any'),
                param('id').exists().withMessage('ID not provided').custom((value) => {
                    if(!shortid.isValid(value)){
                        throw new Error('ID not valid');
                    } else {
                        return value;
                    }
                }),
                body('cin').exists().withMessage('CIN not provided').isAlphanumeric().withMessage('Invalid CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid CIN provided'),
                validateCIN(body)
            ];
        case 'getTransactionByCIN':
            return [
                validateRole('Any'),
                param('cin').exists().withMessage('CIN not provided').isAlphanumeric().withMessage('Invalid CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid CIN provided'),
                validateCIN(param)
            ]; 
        case 'getTransactionByID':
            return [
                validateRole('Any'),
                param('id').exists().withMessage('ID not provided').custom((value) => {
                    if(!shortid.isValid(value)){
                        throw new Error('ID not valid');
                    } else {
                        return value;
                    }
                })
            ];            
        default:
            return [];
    }
}
