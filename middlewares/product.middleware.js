const { body, param } = require('express-validator/check');
const {validateRole, validateCIN} = require('../middlewares/auth.middleware');

exports.productMiddleware = function (method) {
    switch (method) {
        case 'addProduct':
            return [
                validateRole('Manufacturer'),
                body('cin').exists().withMessage('CIN not provided').trim().escape().isAlphanumeric().withMessage('Invalid CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid CIN provided'),
                validateCIN(body),
                body('title').exists().withMessage('Text not provided').trim().escape().isLength({ min: 6, max: 64 }).withMessage('Item reference must be 6-64 chars long')
            ];
        case 'updateProduct':
            return [
                validateRole('Manufacturer'),
                body('cin').exists().withMessage('CIN not provided').trim().escape().isAlphanumeric().withMessage('Invalid CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid CIN provided'),
                validateCIN(body),
                body('title').exists().withMessage('Text not provided').trim().escape().isLength({ min: 6, max: 64 }).withMessage('Item reference must be 6-64 chars long'),
                param('item_ref').exists().withMessage('Item reference not provided').isNumeric().withMessage('Item reference must be numeric')
            ];
        case 'deleteProduct':
            return [
                validateRole('Manufacturer'),
                body('cin').exists().withMessage('CIN not provided').trim().escape().isAlphanumeric().withMessage('Invalid CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid CIN provided'),
                validateCIN(body),
                param('item_ref').exists().withMessage('Item reference not provided').isNumeric().withMessage('Item reference must be numeric')
            ];  
        case 'restoreProduct':
            return [
                validateRole('Manufacturer'),
                body('cin').exists().withMessage('CIN not provided').trim().escape().isAlphanumeric().withMessage('Invalid CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid CIN provided'),
                validateCIN(body),
                param('item_ref').exists().withMessage('Item reference not provided').isNumeric().withMessage('Item reference must be numeric')
            ];       
        case 'getProductsByCIN':
            return [
                validateRole('Manufacturer'),
                param('cin').exists().withMessage('CIN not provided').trim().escape().isAlphanumeric().withMessage('Invalid CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid CIN provided'),
                validateCIN(param)
            ];    
        case 'getProductByItemRef':
            return [
                validateRole('Manufacturer'),
                param('item_ref').exists().withMessage('Item reference not provided').isNumeric().withMessage('Item reference must be numeric')
            ];
        default:
            return [];
    }
}