import express from 'express';
const router = express.Router();
import projectsRouter from './projects.js';
import generateRouter from './generate.js';
import settingsRouter from './settings.js';

router.use('/projects', projectsRouter);
router.use('/generation', generateRouter);
router.use('/settings', settingsRouter);

export default router;
