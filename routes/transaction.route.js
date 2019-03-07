const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const {transactionMiddleware} = require('../middlewares/transaction.middleware');

router.get('/cin/:cin', transactionMiddleware('getTransactionByCIN'), transactionController.getTransactionByCIN);
router.get('/id/:id', transactionMiddleware('getTransactionByID'), transactionController.getTransactionByID);
router.post('/create', transactionMiddleware('create'), transactionController.create);
router.delete('/cancel/:id', transactionMiddleware('cancel'), transactionController.cancel);
router.put('/accept/:id/', transactionMiddleware('accept'), transactionController.accept);

module.exports = router;