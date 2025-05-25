import { Router } from 'express';
import {createResponse, getResponsesForOrder} from './response.controller';
import { authenticate } from '../middleware/auth.middleware';
import {checkRole} from "../middleware/role.middleware";

const router = Router();
router.use(authenticate);

router.post('/', checkRole(['executant']), createResponse);

export default router;