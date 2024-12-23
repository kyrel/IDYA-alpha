import { RequestHandler } from 'express';
import Response from './response.model';
import Order from '../order/order.model';

export const createResponse: RequestHandler = async (req, res) => {
    try {
        const { orderId, message, proposedDeadline } = req.body;
        const userId = req.user?.id;

        // Проверка на наличие всех полей
        if (!orderId || !message || !proposedDeadline) {
            res.status(400).json({ message: 'Order ID, message and proposed deadline are required' });
            return;
        }

        // Проверка на существование заказа
        const order = await Order.findByPk(orderId);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        console.log(proposedDeadline)

        // Создание отклика
        const response = await Response.create({
            orderId,
            userId,
            message,
            proposedDeadline: new Date(proposedDeadline),
        });

        res.status(201).json({
            message: 'Response created successfully',
            response,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create response', error });
    }
};

export const getResponsesForOrder: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const order = await Order.findByPk(id);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        if (order.customerId !== userId) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        // Получение всех откликов для заказа
        const responses = await Response.findAll({
            where: { orderId: id },
        });

        res.status(200).json({ responses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch responses', error });
    }
};