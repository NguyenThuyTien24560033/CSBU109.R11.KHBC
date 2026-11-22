const express = require('express');
const router = express.Router();
const { listCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

router.get('/', verifyToken, listCategories);
router.post('/', verifyToken, requireAdmin, createCategory);
router.put('/:id', verifyToken, requireAdmin, updateCategory);
router.delete('/:id', verifyToken, requireAdmin, deleteCategory);

module.exports = router;