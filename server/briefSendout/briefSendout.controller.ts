import {Brief, BriefQuestion} from '../brief/brief.model';
import {RequestHandler} from "express";
import { BriefSendout, BriefSendoutQuestion } from './briefSendout.model';
import Order from '../order/order.model';

export const sendBriefById: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id, briefId } = req.params;
        const order = await Order.findByPk(id);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        if (order.executantId != userId) {
            res.status(403).json({ message: 'You have to be selected as executant to send brief for order' });
            return;
        }

        const brief = await Brief.findByPk(briefId, {
            include: [{ model: BriefQuestion, as: 'briefQuestions' }],
        });

        if (!brief || brief.ownerId != userId) {
            res.status(404).json({ message: 'Brief not found' });
            return;
        }
        const questions = brief.briefQuestions.map(({ questionText }) => ({ questionText }));
        
        const briefSendout = await createBriefSendout({ orderId: order.id, questions });
        
        res.status(200).json({
            message: 'Brief sent successfully',
            briefSendout: { id: briefSendout.id, questions }
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send brief', error });
    }
};

export const sendBriefWithQuestions: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { questions } = req.body;
        const order = await Order.findByPk(id);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        if (order.executantId != userId) {
            res.status(403).json({ message: 'You have to be selected as executant to send brief for order' });
            return;
        }

        const briefSendout = await createBriefSendout({ orderId: order.id, questions });

        res.status(200).json({
            message: 'Brief sent successfully',
            briefSendout: { id: briefSendout.id, questions }
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send brief', error });
    }
};

export const sendBriefResponse: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { answers } = req.body;
        const order = await Order.findByPk(id, {
            include: [{ model: BriefSendout, include: [{ model: BriefSendoutQuestion, as: 'briefSendoutQuestions' }] }],
        });
        if (!order || order.customerId != userId) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        const briefSendout = order.dataValues.BriefSendouts[0];
        if (!briefSendout) {
            res.status(400).json({ message: 'Brief sendout for order not found' });
            return;
        }
        for(const question of briefSendout.briefSendoutQuestions) {
            const answer = answers.find(a=>a.questionId == question.id);
            if (!answer) { 
                continue;
            }
            await BriefSendoutQuestion.update(
                { answerText: answer.answerText },
                { where: { id: answer.questionId } }
            );
        }
        await BriefSendout.update(
            { isReplied: true },
            { where: { id: briefSendout.id } }
        );
        res.status(200).json({
            message: 'Brief response sent successfully'
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send brief', error });
    }
}

async function createBriefSendout({ orderId, questions }: {
    orderId: number,
    questions: Array<{questionText: string}>
}) {
    const briefSendout = await BriefSendout.create({ orderId });
    await createBriefSendoutQuestions({ briefSendoutId: briefSendout.id, questions });
    return briefSendout;
}

async function createBriefSendoutQuestions({ briefSendoutId, questions }: {
    briefSendoutId: number,
    questions: Array<{questionText: string}>
}) {
    for (const { questionText } of questions) {
        await BriefSendoutQuestion.create({ briefSendoutId, questionText });
    }
}