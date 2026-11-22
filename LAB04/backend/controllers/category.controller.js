const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

function toCategoryResponse(category) {
  return {
    id: category._id,
    _id: category._id,
    name: category.name
  };
}

const listCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: categories.map(toCategoryResponse) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const name = req.body.name && String(req.body.name).trim();
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const category = await Category.create({ name });

    res.status(201).json({
      success: true,
      message: 'Category created',
      data: toCategoryResponse(category)
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category name already exists' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid category id' });
    }

    const name = req.body.name && String(req.body.name).trim();
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      message: 'Category updated',
      data: toCategoryResponse(category)
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category name already exists' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid category id' });
    }

    const inUse = await Product.exists({ categoryId: req.params.id });
    if (inUse) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a category that still has products'
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: `Category ${category.name} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };