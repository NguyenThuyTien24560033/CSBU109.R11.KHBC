const express = require('express');
const router = express.Router();
const { listProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

router.get('/', verifyToken, listProducts);
router.get('/:id', verifyToken, getProduct);
router.post('/', verifyToken, requireAdmin, createProduct);
router.put('/:id', verifyToken, requireAdmin, updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

module.exports = router;