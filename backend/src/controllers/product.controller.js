const Product = require("../models/Product");

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('categoryId');
        res.status(200).json(products);
    } catch (error) {
        logger.error("Get all products error:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving products",
            error: error.message,
        });
    }
};

const getProductBySellerId = async (req, res) => {
    try {
        const sellerId = req.params.sellerId;
        const products = await Product.find({ sellerId }).populate('categoryId');
        res.status(200).json(products);
    } catch (error) {
        logger.error("Get products by seller ID error:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving products by seller ID",
            error: error.message,
        });
    }
};

const createProduct = async (req, res) => {
    try {
        const { title, description, price, categoryId, quantity } = req.body;
        const sellerId = req.user.id;
        const image = req.file ? req.file.path : null;
        if (!title || !description || !price || !categoryId || !image || !quantity) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        const product = await Product.create({
            title,
            description,
            price,
            categoryId,
            sellerId,
            image,
            quantity,
        });
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating product", error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, categoryId, quantity } = req.body;
        const updateFields = {};
        if (title) updateFields.title = title;
        if (description) updateFields.description = description;
        if (price) updateFields.price = price;
        if (categoryId) updateFields.categoryId = categoryId;
        if (quantity) updateFields.quantity = quantity;
        if (req.file) updateFields.image = req.file.path;
        const product = await Product.findByIdAndUpdate(id, updateFields, { new: true });
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating product", error: error.message });
    }
};

module.exports = {
    getAllProducts,
    getProductBySellerId,
    createProduct,
    updateProduct,
};