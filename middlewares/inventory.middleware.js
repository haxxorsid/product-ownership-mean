const { body, param } = require('express-validator/check');
const { validateRole, validateCIN} = require('../middlewares/auth.middleware');

exports.inventoryMiddleware = function (method) {
    switch (method) {
        case 'produce':
            return [
                validateRole('Manufacturer'),
                body('cin').exists().withMessage('CIN not provided').trim().escape().isAlphanumeric().withMessage('Invalid CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid CIN provided'),
                validateCIN(body),
                param('item_ref').exists().withMessage('Item reference not provided').isNumeric().withMessage('Item reference must be numeric')
            ];
        case 'scrap':
            return [
                validateRole('Any'),
                param('sgtin').exists().withMessage('SGTIN not provided').custom((value) => {
                    let parts = value.split('-');
                    if(parts.length>3){
                        throw new Error('Invalid SGTIN format');
                    }else if(isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])){
                        throw new Error('Invalid SGTIN format');
                    }else if(parts[0].length+parts[1].length>13){
                        throw new Error('Invalid SGTIN format');
                    }else if( parts[0] == 0|| parts[1] == 0|| parts[2] == 0){
                        throw new Error('Invalid SGTIN format');
                    } else {
                        return value;
                    }
                }),
                body('cin').exists().withMessage('CIN not provided').trim().escape().isAlphanumeric().withMessage('Invalid CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid CIN provided'),
                validateCIN(body)
            ];
        case 'getInventoryByCIN':
            return [
                validateRole('Any'),
                param('cin').exists().withMessage('CIN not provided').trim().escape().isAlphanumeric().withMessage('Invalid CIN provided').isLength({ min: 21, max: 21 }).withMessage('Invalid CIN provided'),
                validateCIN(param)
            ]; 
        case 'getInventoryBySGTIN':
            return [
                validateRole('Any'),
                param('sgtin').exists().withMessage('SGTIN not provided').custom((value) => {
                    let parts = value.split('-');
                    if(parts.length>3){
                        throw new Error('Invalid SGTIN format');
                    }else if(isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])){
                        throw new Error('Invalid SGTIN format');
                    }else if(parts[0].length+parts[1].length>13){
                        throw new Error('Invalid SGTIN format');
                    }else if( parts[0] == 0|| parts[1] == 0|| parts[2] == 0){
                        throw new Error('Invalid SGTIN format');
                    } else {
                        return value;
                    }
                })
            ];
        default:
            return [];
    }
}