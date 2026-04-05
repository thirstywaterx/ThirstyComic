import express from 'express';
import generateController from '../controller/generateController.js';

const router = express.Router();

// 生成分镜
router.post('/', generateController.generateShot);

export default router;