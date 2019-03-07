const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const {inventoryMiddleware} = require('../middlewares/inventory.middleware');

router.get('/cin/:cin', inventoryMiddleware('getInventoryByCIN'), inventoryController.getInventoryByCIN);
router.get('/sgtin/:sgtin', inventoryMiddleware('getInventoryBySGTIN'), inventoryController.getInventoryBySGTIN);
router.post('/produce/:item_ref', inventoryMiddleware('produce'), inventoryController.produce);
router.delete('/scrap/:sgtin', inventoryMiddleware('scrap'), inventoryController.scrap);

module.exports = router;