import { Router } from 'express';
import {authenticate} from "../middleware/auth.middleware";
import {checkRole} from "../middleware/role.middleware";
import {
    assignExecutantAndStartOrder, completeOrder,
    createOrder,
    deleteOrder, getAllCreatedOrders,
    getAllOrdersForUser, getAllOrdersRespondedByUser,
    getOrder, getPresentation,
    updateOrder, uploadPresentation
} from "./order.controller";
import { getResponsesForOrder } from '../response/response.controller';
import upload from "../middleware/upload.middleware";

const router = Router();

router.use(authenticate);

router.get('/', getAllOrdersForUser);
router.get('/created', getAllCreatedOrders);
router.get('/responded', checkRole(['executant']), getAllOrdersRespondedByUser);
router.get('/:id', getOrder);


router.get('/:id/responses', authenticate, getResponsesForOrder);
router.put('/:id/accept-response/:responseId', checkRole(['customer']), assignExecutantAndStartOrder);
router.put('/finish/:id', checkRole(['customer']), completeOrder);
router.put('/:id', checkRole(['customer']), updateOrder);

router.delete('/:id', checkRole(['customer']), deleteOrder);

router.post('/complete/:id/', checkRole(['customer']), upload.single('presentation'), uploadPresentation);
router.post('/', checkRole(['customer']), createOrder);

router.get('/:id/presentation', getPresentation);


export default router;
