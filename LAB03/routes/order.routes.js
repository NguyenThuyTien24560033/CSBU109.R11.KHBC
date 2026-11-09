import express from 'express';
import { 
    createOrder, 
    getOrders, 
    getOrderById, 
    updateOrderStatus,
    deleteOrder,
    getSalesSummary
} from '../controllers/order.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order management endpoints
 * 
 * components:
 *   parameters:
 *     orderId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: Order ID
 *   schemas:
 *     OrderItemInput:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: integer
 *           example: 1
 *         quantity:
 *           type: integer
 *           example: 2
 *     CreateOrderRequest:
 *       type: object
 *       required:
 *         - customerId
 *         - items
 *       properties:
 *         customerId:
 *           type: integer
 *           example: 1
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItemInput'
 *     UpdateStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *           example: cancelled
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Customer or Product not found
 *   get:
 *     summary: Get all orders with filtering and pagination
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *         description: Filter by customer ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Current page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.post('/', createOrder);
router.get('/', getOrders);

/**
 * @swagger
 * /orders/analytics/sales-summary:
 *   get:
 *     summary: Get sales revenue analytics
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Sales revenue analytics retrieved successfully
 */
router.get('/analytics/sales-summary', getSalesSummary);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     parameters:
 *       - $ref: '#/components/parameters/orderId'
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *       400:
 *         description: Invalid order ID
 *       404:
 *         description: Order not found
 *   delete:
 *     summary: Delete an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - $ref: '#/components/parameters/orderId'
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       400:
 *         description: Invalid order ID
 *       404:
 *         description: Order not found
 */
router.get('/:id', getOrderById);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status and restore stock if cancelled
 *     tags: [Orders]
 *     parameters:
 *       - $ref: '#/components/parameters/orderId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStatusRequest'
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Order not found
 */
router.patch('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);

export default router;