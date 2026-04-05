import express from 'express';
import multer from 'multer';

import projectController from '../controller/projectController.js';
import chapterController from '../controller/chapterController.js';
import shotController from '../controller/shotController.js';
import resourceController from '../controller/resourceController.js';
import projectValidator from '../middleware/validator/projectValidator.js';

const router = express.Router();
const upload = multer({ dest: 'public/uploads' });

// --- 项目相关 (Projects) ---
router.route('/')
  .post(projectValidator.uploadProject, projectController.addProject)
  .get(projectController.getProject);

router.route('/:id')
  .get(projectController.getProjectById)
  .put(projectValidator.updateProject, projectController.updateProject)
  .delete(projectController.deleteProject);

// --- 章节相关 (Chapters) ---
router.post('/:id/chapters', chapterController.addChapter);
router.delete('/:id/chapters/:chapterId', chapterController.deleteChapter);

// --- 分镜相关 (Shots) ---
router.route('/:projectId/chapters/:chapterId/shots')
  .post(shotController.addShot)
  .get(shotController.getShots)
  .put(shotController.updateShotsOrder)
  .delete(shotController.deleteShots);

router.get('/:projectId/chapters/:chapterId/shots/:shotId', shotController.getShot);
router.put('/:projectId/chapters/:chapterId/shots/:shotId', shotController.updateShot);
router.delete('/:projectId/chapters/:chapterId/shots/:shotId', shotController.deleteShot);

// --- 资源相关 (Resources) ---
router.post('/:projectId/resources/', upload.array('images', 10), resourceController.uploadResource);
router.get('/:projectId/resources/:type', resourceController.getResourcesList);
router.put('/:projectId/resources/:type/:resourceId', resourceController.updateResource);
router.delete('/:projectId/resources/:type/:resourceId', resourceController.deleteResource);

// 嵌入资源
router.route('/:projectId/chapters/:chapterId/shots/:shotId/resources')
  .put(resourceController.embedResource)
  .get(resourceController.getembedResource);

export default router;