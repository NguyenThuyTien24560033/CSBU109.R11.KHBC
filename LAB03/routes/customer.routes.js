import express from 'express';
import { getCustomerOrderHistory } from '../controllers/order.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Customers
 *     description: Customer management endpoints
 * 
 * /customers/{id}/order-history:
 *   get:
 *     summary: Get customer order history
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer order history retrieved successfully
 *       400:
 *         description: Invalid customer ID
 *       404:
 *         description: Customer not found
 */
router.get('/:id/order-history', getCustomerOrderHistory);

export default router;