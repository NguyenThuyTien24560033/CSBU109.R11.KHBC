import { 
    placeOrder, 
    getOrdersService, 
    getOrderByIdService, 
    updateOrderStatusService,
    deleteOrderService,
    getSalesSummaryService,
    getCustomerOrderHistoryService
} from '../services/order.service.js';

export const createOrder = async (req, res, next) => {
    try {
        const { customerId, items } = req.body || {};

        if (!Number.isInteger(customerId) || customerId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'customerId must be a positive integer'
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'items must be a non-empty array'
            });
        }

        for (const item of items) {
            if (
                (!Number.isInteger(item.productId) || item.productId <= 0) ||
                (!Number.isInteger(item.quantity) || item.quantity <= 0)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Each item needs a positive integer productId and quantity'
                });
            }
        }

        const order = await placeOrder(customerId, items);
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

export const getOrders = async (req, res, next) => {
    try {
        const { status, customerId } = req.query;

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 5, 1);
        const offset = (page - 1) * limit;

        const { orders, totalOrders } = await getOrdersService(status, customerId, limit, offset);

        res.status(200).json({
            success: true,
            count: orders.length,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalOrders / limit) || 1,
                totalOrders
            },
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

export const getOrderById = async (req, res, next) => {
    try {
        const orderId = Number(req.params.id);
        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID'
            });
        }

        const order = await getOrderByIdService(orderId);
        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const orderId = Number(req.params.id);
        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID'
            });
        }

        const { status } = req.body || {};
        const allowedStatus = ['pending', 'completed', 'cancelled'];
        if (!status || !allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be pending, completed, or cancelled'
            });
        }

        const updatedOrder = await updateOrderStatusService(orderId, status);
        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        next(error);
    }
};

export const deleteOrder = async (req, res, next) => {
    try {
        const orderId = Number(req.params.id);
        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID'
            });
        }

        const result = await deleteOrderService(orderId);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

export const getSalesSummary = async (req, res, next) => {
    try {
        const data = await getSalesSummaryService();
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

export const getCustomerOrderHistory = async (req, res, next) => {
    try {
        const customerId = Number(req.params.id);
        if (!Number.isInteger(customerId) || customerId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid customer ID'
            });
        }

        const data = await getCustomerOrderHistoryService(customerId);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};