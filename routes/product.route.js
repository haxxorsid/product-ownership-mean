const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const {productMiddleware} = require('../middlewares/product.middleware');

router.get('/ref/:item_ref', productMiddleware('getProductByItemRef'), productController.getProductByItemRef);
router.get('/cin/:cin', productMiddleware('getProductsByCIN'), productController.getProductsByCIN);
router.post('/add', productMiddleware('addProduct'), productController.addProduct);
router.put('/update/:item_ref', productMiddleware('updateProduct'), productController.updateProduct);
router.put('/restore/:item_ref', productMiddleware('restoreProduct'), productController.restoreProduct);
router.delete('/delete/:item_ref', productMiddleware('deleteProduct'), productController.deleteProduct);

module.exports = router;