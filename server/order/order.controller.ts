import Order from './order.model';
import User from '../user/user.model';
import Response from '../response/response.model';
import {RequestHandler} from "express";
import path from 'path';
import fs from 'fs';

// Создание заказа
export const createOrder: RequestHandler = async (req,res) => {
    try {
        const { title, description, priceFrom, priceTo } = req.body;

        console.log(req.body);
        // Проверка на наличие всех полей
        if (!title || !description || !priceFrom || !priceTo) {
            res.status(400).json({ message: 'Title, description, priceFrom and priceTo are required' });
            return;
        }

        const newOrder = await Order.create({
            title,
            description,
            priceFrom,
            priceTo,
            status: 'created',
            customerId: req.user?.id
        });

        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create order', error });
    }
};

// Получение всех заказов пользователя
export const getAllOrdersForUser: RequestHandler = async (req,res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;

        let orders: Order[];

        if (userRole === 'customer') {
            orders = await Order.findAll({
                raw: true,
                where: { customerId: userId },
                order: [['id', 'DESC']],
                include: [{ model: User, as: 'executant', attributes: ['nickname', 'email'] }]
            });
        } else if (userRole === 'executant') {
            orders = await Order.findAll({
                where: { executantId: userId },
                order: [['id', 'DESC']],
                include: [{ model: User, as: 'customer', attributes: ['nickname', 'email'] }]
            });
        } else {
            orders = [];
        }

        res.status(200).json({ orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch orders', error });
    }
};

export const getOrder: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const { id } = req.params;
        const dbOrder = await Order.findByPk(id, {
            include: [
                { model: Response, include: [{ model: User, attributes: ['nickname', 'email'] }] },
                { model: User, as: 'customer', attributes: ['id', 'nickname', 'email'] },
                { model: User, as: 'executant', attributes: ['id', 'nickname', 'email'] }
            ],
        });

        if (!dbOrder) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        const { Responses: orderResponses, executant, customer, ...order } = dbOrder.dataValues;
        const responseCount = orderResponses.length;

        if (userRole === 'customer') {
            const responseData = orderResponses.map(function(r) {
                const { User: executant, ...response } = r.dataValues;
                return {
                    ...response,
                    executant
                };
            });
            const orderData = {
                ...order,
                responseCount,
                responses: responseData,
                executant: executant?.dataValues
            }
            res.status(200).json({ order: orderData });
        } else if (userRole === 'executant') {
            console.log(orderResponses);
            const userHasResponded = orderResponses.some(r => r.dataValues.userId == userId);
            const userIsChosenAsExecutant = executant?.dataValues?.id == userId;
            const orderData = {
                ...order,
                responseCount,
                userHasResponded,
                userIsChosenAsExecutant,
                customer: customer.dataValues
            }
            res.status(200).json({ order: orderData });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch order', error });
    }
}

// Обновление заказа
export const updateOrder: RequestHandler = async (req,res) => {
    try {
        const { id } = req.params;
        const { title, description, priceFrom, priceTo, status, presentation } = req.body;

        const order = await Order.findByPk(id);

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        // Проверка принадлежности заказа пользователю
        if (order.customerId !== req.user?.id) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        await order.update({ title, description, priceFrom, priceTo, status, presentation });

        res.status(200).json({ message: 'Order updated successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update order', error });
    }
};

// Удаление заказа
export const deleteOrder: RequestHandler = async (req,res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id);

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        if (order.customerId !== req.user?.id) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        await order.destroy();

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete order', error });
    }
};

// Изменение статуса заказа на "завершен"
export const completeOrder: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id);

        console.log(id, order)

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        if (order.customerId !== req.user?.id) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        // Проверка, что заказ уже в работе
        if (order.status !== 'completed') {
            res.status(400).json({ message: 'Order must be completed to finish' });
            return;
        }

        order.status = 'finished';
        await order.save();

        res.status(200).json({ message: 'Order completed successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to complete order', error });
    }
};

// Установка исполнителя и перевод заказа в статус "в работе"
export const assignExecutantAndStartOrder: RequestHandler = async (req, res) => {
    try {
        const { id, responseId } = req.params;

        const order = await Order.findByPk(id);

        console.log(id, responseId, order)

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        if (order.customerId !== req.user?.id) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        if (order.status !== 'created') {
            res.status(400).json({ message: 'Order is already in progress or completed' });
            return;
        }

        const response = await Response.findByPk(responseId, {
            include: [User]
        });

        if (!response) {
            res.status(404).json({ message: 'Response not found' });
            return;
        }

        order.executantId = response.userId;
        order.deadline = response.proposedDeadline;
        order.status = 'in_work';
        await order.save();

        res.status(200).json({
            message: 'Executant assigned and order started successfully',
            order,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to assign executant', error });
    }
};

export const getAllCreatedOrders: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const dbOrders = await Order.findAll({
            where: { status: 'created' },
            order: [['id', 'DESC']],
            include: [
                { model: User, as: 'customer', attributes: ['nickname', 'email'] },
                { model: Response },
            ]
        });
        const orders = dbOrders.map(dbOrder=>{
            const { Responses: orderResponses, ...order } = dbOrder.dataValues;
            const responseCount = orderResponses.length;
            const userHasResponded = orderResponses.some(r => r.dataValues.userId == userId);
            return {
                ...order,
                responseCount,
                userHasResponded                
            };
        })
        res.status(200).json({ orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch orders', error });
    }
};

export const getAllOrdersRespondedByUser: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        // Sequelise isn't great with WHERE EXISTS, so query responses first
        const responses = await Response.findAll({
            where: { userId: userId },
            attributes: ['orderId']
        });
        const orderIds = responses.map(r=>r.orderId);

        const dbOrders = await Order.findAll({
            where: { id: orderIds },
            order: [['id', 'DESC']],
            include: [
                { model: User, as: 'customer', attributes: ['nickname', 'email'] },
                { model: Response },
            ]
        });
        const orders = dbOrders.map(dbOrder=>{
            const { Responses: orderResponses, ...order } = dbOrder.dataValues;
            const responseCount = orderResponses.length;
            return {
                ...order,
                responseCount
            };
        })
        res.status(200).json({ orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch orders', error });
    }
};


// Загрузка презентации
export const uploadPresentation: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const order = await Order.findByPk(id);

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        if (order.executantId !== userId) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        order.presentation = req.file.filename;
        await order.save();

        res.status(200).json({ message: 'Presentation uploaded successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to upload presentation', error });
    }
};

// Получение презентации
export const getPresentation: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const order = await Order.findByPk(id);

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        if (order.customerId !== userId && order.executantId !== userId) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        if (!order.presentation) {
            res.status(404).json({ message: 'Presentation not found' });
            return;
        }

        const filePath = path.join(__dirname, '../../uploads', order.presentation);

        if (!fs.existsSync(filePath)) {
            res.status(404).json({ message: 'File not found' });
            return;
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch presentation', error });
    }
};