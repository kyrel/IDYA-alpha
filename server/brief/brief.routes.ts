import { Router } from 'express';
import {authenticate} from "../middleware/auth.middleware";
import {
    createBrief, updateBrief,
    deleteBrief, getAllBriefs,
    getBrief
} from "./brief.controller";

const router = Router();

router.use(authenticate);

router.get('/', getAllBriefs);
router.get('/:id', getBrief);
router.put('/:id', updateBrief);
router.delete('/:id', deleteBrief);
router.post('/', createBrief);

export default router;
