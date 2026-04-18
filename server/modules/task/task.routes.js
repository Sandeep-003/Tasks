import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { createTask, deleteTask, getTaskStats, getTasks, updateTask } from './task.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.post('/', createTask);
router.patch('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

export default router;
