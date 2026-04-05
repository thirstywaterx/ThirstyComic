import { Projects } from '../model/index.js';
import { CHAPTER_ERROR_CODES } from '../middleware/validator/errorCode.js';

async function addChapter(req, res) {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: CHAPTER_ERROR_CODES.NAME_REQUIRED });
    }

    try {
        const project = await Projects.findById(id);

        if (!project) {
            return res.status(404).json({ error: CHAPTER_ERROR_CODES.PROJECT_NOT_FOUND });
        }

        // Check if chapter name already exists
        if (project.chapters.some(c => c.name === name)) {
            return res.status(400).json({ error: CHAPTER_ERROR_CODES.NAME_EXISTS });
        }

        project.chapters.push({ name });

        await project.save();

        res.json({
            success: true,
            data: project.chapters.map(c => c.name)
        });

    } catch (err) {
        res.status(500).json({ error: CHAPTER_ERROR_CODES.SERVER_ERROR });
    }
}

async function deleteChapter(req, res) {
    const { id, chapterId } = req.params;

    try {
        const project = await Projects.findById(id);

        if (!project) {
            return res.status(404).json({ error: CHAPTER_ERROR_CODES.PROJECT_NOT_FOUND });
        }

        const chapterName = decodeURIComponent(chapterId); // chapterId represents name now
        
        // Find and remove the chapter
        const chapterIdxInArray = project.chapters.findIndex(c => c.name === chapterName);
        if (chapterIdxInArray === -1) {
            return res.status(404).json({ error: CHAPTER_ERROR_CODES.CHAPTER_NOT_FOUND });
        }

        project.chapters.splice(chapterIdxInArray, 1);

        await project.save();

        res.json({
            success: true,
            data: project.chapters.map(c => c.name)
        });

    } catch (err) {
        res.status(500).json({ error: CHAPTER_ERROR_CODES.SERVER_ERROR });
    }
}

export default {
    addChapter,
    deleteChapter
};