const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

function toProductResponse(product) {
  const cat = product.categoryId && product.categoryId._id ? product.categoryId : null;
  return {
    id: product._id,
    _id: product._id,
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    categoryId: cat
      ? { id: cat._id, _id: cat._id, name: cat.name }
      : product.categoryId
  };
}

const listProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.categoryId) {
      if (!mongoose.isValidObjectId(req.query.categoryId)) {
        return res.status(400).json({ success: false, message: 'Invalid category id' });
      }
      filter.categoryId = req.query.categoryId;
    }

    const products = await Product.find(filter)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: products.length, data: products.map(toProductResponse) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const product = await Product.findById(req.params.id).populate('categoryId', 'name');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: toProductResponse(product) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, price, quantity, categoryId } = req.body;

    if (!name || price === undefined || price === '' || isNaN(Number(price)) || !categoryId) {
      return res.status(400).json({ success: false, message: 'Name, price and category are required' });
    }
    if (!mongoose.isValidObjectId(categoryId)) {
      return res.status(400).json({ success: false, message: 'Invalid category id' });
    }

    const categoryExists = await Category.exists({ _id: categoryId });
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'Category does not exist' });
    }

    const product = await Product.create({
      name,
      price: Number(price),
      quantity: quantity === undefined || quantity === '' ? 0 : Number(quantity),
      categoryId
    });
    await product.populate('categoryId', 'name');

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: toProductResponse(product)
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { name, price, quantity, categoryId } = req.body;

    if (name) product.name = name;
    if (price !== undefined && price !== '') product.price = Number(price);
    if (quantity !== undefined && quantity !== '') product.quantity = Number(quantity);

    if (categoryId) {
      if (!mongoose.isValidObjectId(categoryId)) {
        return res.status(400).json({ success: false, message: 'Invalid category id' });
      }
      const categoryExists = await Category.exists({ _id: categoryId });
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: 'Category does not exist' });
      }
      product.categoryId = categoryId;
    }

    await product.save();
    await product.populate('categoryId', 'name');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: toProductResponse(product)
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: `Deleted product ID ${product._id}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };