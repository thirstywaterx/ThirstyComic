import express from 'express';
const router = express.Router();
import { getSettings, updateSettings } from '../controller/settingsController.js';

router.get('/', getSettings);
router.post('/', updateSettings);

export default router;