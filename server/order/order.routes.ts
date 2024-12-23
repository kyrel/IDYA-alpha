import { Router } from 'express';
import {authenticate} from "../middleware/auth.middleware";
import {checkRole} from "../middleware/role.middleware";
import {
    assignExecutantAndStartOrder, completeOrder,
    createOrder,
    deleteOrder, getAllCreatedOrders,
    getAllOrdersForUser, getPresentation,
    updateOrder, uploadPresentation
} from "./order.controller";
import upload from "../middleware/upload.middleware";

const router = Router();

router.use(authenticate);

router.get('/', getAllOrdersForUser);
router.get('/created', getAllCreatedOrders);

router.put('/assign-response', checkRole(['customer']), assignExecutantAndStartOrder);
router.put('/finish/:id', checkRole(['customer']), completeOrder);
router.put('/:id', checkRole(['customer']), updateOrder);

router.delete('/:id', checkRole(['customer']), deleteOrder);

router.post('/complete/:id/', checkRole(['customer']), upload.single('presentation'), uploadPresentation);
router.post('/', checkRole(['customer']), createOrder);

router.get('/:id/presentation', getPresentation);


export default router;
