import {Brief, BriefQuestion} from './brief.model';
import {RequestHandler} from "express";

export const getAllBriefs: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        
        let briefs = await Brief.findAll({
            where: {ownerId: userId},
            order: [['id', 'DESC']]            
        })        
        console.log(briefs);
        res.status(200).json({ briefs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch briefs', error });
    }
};

export const getBrief: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const dbBrief = await Brief.findByPk(id, {
            include: [{ model: BriefQuestion, as: 'briefQuestions' }],
        });

        if (!dbBrief || dbBrief.ownerId != userId) {
            res.status(404).json({ message: 'Brief not found' });
            return;
        }
        console.log(dbBrief);
        const { briefQuestions: dbBriefQuestions, title } = dbBrief;
        const questions = dbBriefQuestions.map(({ questionText }) => ( {questionText} ));
        res.status(200).json({ brief: { title, questions } });
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch brief', error });
    }
};

export const createBrief: RequestHandler = async(req, res) => {
    try {
        console.log(req.body);
        const { title, questions } = req.body;
        
        const validationError = validateBrief({ title, questions});        
        if (validationError) {
            res.status(400).json({ message: validationError });
            return;
        }

        const brief = await Brief.create({
            title,
            ownerId: req.user?.id        
        });

        await createBriefQuestions({ briefId: brief.id, questions });

        res.status(201).json({ message: 'Brief created successfully', brief });
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create brief', error });
    }
};

export const updateBrief: RequestHandler = async(req, res) => {
    try {
        console.log(req.body);
        const { id } = req.params;
        const { title, questions } = req.body; 
        
        const validationError = validateBrief({ title, questions});        
        if (validationError) {
            res.status(400).json({ message: validationError });
            return;
        }       
        
        const brief = await Brief.findByPk(id);

        if (!brief || brief.ownerId != req.user?.id) {
            res.status(404).json({ message: 'Brief not found' });
            return;
        }        

        await brief.update({ title });

        await BriefQuestion.destroy({ where: { briefId: id } });
        await createBriefQuestions({ briefId: brief.id, questions });

        res.status(200).json({ message: 'Brief updated successfully' });
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create brief', error });
    }
};

export const deleteBrief: RequestHandler = async(req, res) => {
    try {
        console.log(req.body);
        const { id } = req.params;

        const brief = await Brief.findByPk(id);

        if (!brief || brief.ownerId != req.user?.id) {
            res.status(404).json({ message: 'Brief not found' });
            return;
        }        

        await brief.destroy();
        res.status(200).json({ message: 'Brief deleted successfully' });
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create brief', error });
    }
};

function validateBrief({title, questions}: {title: any, questions: any}): string | undefined {
    if (!title) {
        return 'Title is required' ;
    }
    if (questions && !Array.isArray(questions)) {
        return 'Questions should be an array';        
    }
    for (const { questionText } of questions) {
        if (!questionText) {
            return 'All questions should have titles';
        }        
    } 
}

async function createBriefQuestions({ briefId, questions }: {
    briefId: number,
    questions: Array<{questionText: string}>
}) {
    for (const { questionText } of questions) {
        await BriefQuestion.create({ briefId, questionText });
    }  
}