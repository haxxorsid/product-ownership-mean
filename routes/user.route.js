const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const {userMiddleware} = require('../middlewares/user.middleware');

router.get('/', userMiddleware('getUsers'), userController.getUsers);
router.get('/cin/:cin', userMiddleware('getUserByCIN'), userController.getUserByCIN);
router.post('/login', userMiddleware('login'), userController.login);
router.post('/create', userMiddleware('createUser'), userController.createUser);
router.put('/resetpassword/:cin', userMiddleware('resetpassword'), userController.resetpassword);
router.put('/resetemail/:cin', userMiddleware('resetemail'), userController.resetemail);
router.put('/info/:cin', userMiddleware('info'), userController.info);
router.put('/prefix/:cin', userMiddleware('prefix'), userController.prefix);
router.delete('/delete/:cin', userMiddleware('deleteUser'), userController.deleteUser);

module.exports = router;