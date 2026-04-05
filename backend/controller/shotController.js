import { Projects } from '../model/index.js';

function findChapter(project, chapterId) {
    const decodedChapterId = decodeURIComponent(chapterId);

    let chapter;
    try {
        chapter = project.chapters.id(decodedChapterId);
    } catch (e) {
        // Ignore cast errors if chapterId is not a valid ObjectId
    }

    if (!chapter) {
        chapter = project.chapters.find(c => c.name === decodedChapterId || c._id.toString() === decodedChapterId);
    }

    return chapter;
}

async function addShot(req, res) {
    const { projectId, chapterId } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Shot name is required' });
    }

    try {
        const project = await Projects.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const chapter = findChapter(project, chapterId);

        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }

        const newShot = {
            name,
            imageUrl: '',
            createdAt: new Date()
        };

        chapter.shots.push(newShot);
        await project.save();

        res.status(201).json({
            message: 'Shot added successfully',
            shots: chapter.shots
        });
    } catch (error) {
        console.error('Error adding shot:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getShots(req, res) {
    const { projectId, chapterId } = req.params;

    try {
        const project = await Projects.findById(projectId, { 'chapters.shots.imageUrl': 0 });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const chapter = findChapter(project, chapterId);

        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }

        res.json({ shots: chapter.shots });
    } catch (error) {
        console.error('Error fetching shots:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function deleteShot(req, res) {
    const { projectId, chapterId, shotId } = req.params;

    try {
        const project = await Projects.findById(projectId);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const chapter = findChapter(project, chapterId);

        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }

        const beforeLength = chapter.shots.length;
        chapter.shots.pull(shotId);

        if (beforeLength === chapter.shots.length) {
            return res.status(404).json({ error: 'Shot not found' });
        }

        await project.save();
        res.json({ shots: chapter.shots });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }

}

async function updateShotsOrder(req, res) {
    const { projectId, chapterId } = req.params;
    const { shotIds, shots } = req.body;

    try {
        const project = await Projects.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const chapter = findChapter(project, chapterId);
        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }

        const incomingIds = Array.isArray(shotIds)
            ? shotIds
            : Array.isArray(shots)
                ? shots.map(item => typeof item === 'string' ? item : item?._id)
                : [];

        const normalizedIncomingIds = incomingIds
            .filter(Boolean)
            .map(id => id.toString());

        if (!normalizedIncomingIds.length) {
            return res.status(400).json({ error: 'shotIds is required' });
        }

        const chapterIds = chapter.shots.map(item => item._id.toString());
        if (normalizedIncomingIds.length !== chapterIds.length) {
            return res.status(400).json({ error: 'Invalid shots order payload' });
        }

        const hasSameMembers = normalizedIncomingIds.every(id => chapterIds.includes(id));
        if (!hasSameMembers) {
            return res.status(400).json({ error: 'Invalid shots order payload' });
        }

        const shotMap = new Map(chapter.shots.map(item => [item._id.toString(), item]));
        chapter.shots = normalizedIncomingIds.map(id => shotMap.get(id));

        project.markModified('chapters');
        await project.save();

        return res.json({ shots: chapter.shots });
    } catch (error) {
        console.error('Error updating shots order:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function deleteShots(req, res) {
    const { projectId, chapterId } = req.params;
    const { shotIds } = req.body;

    try {
        if (!Array.isArray(shotIds) || shotIds.length === 0) {
            return res.status(400).json({ error: 'shotIds is required' });
        }

        const project = await Projects.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const chapter = findChapter(project, chapterId);
        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }

        const deleteSet = new Set(shotIds.map(id => id.toString()));
        chapter.shots = chapter.shots.filter(item => !deleteSet.has(item._id.toString()));

        project.markModified('chapters');
        await project.save();

        return res.json({ shots: chapter.shots });
    } catch (error) {
        console.error('Error deleting shots:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


async function getShot(req, res) {
    const { projectId, chapterId, shotId } = req.params;
    try {
        const project = await Projects.findById(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        const chapter = findChapter(project, chapterId);
        if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
        const shot = chapter.shots.id(shotId);
        if (!shot) return res.status(404).json({ error: 'Shot not found' });
        res.json({ shot });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateShot(req, res) {
    const { projectId, chapterId, shotId } = req.params;
    const { name, prompt, temperature, aspectRatio, imageSize, outputPath } = req.body;
    try {
        const project = await Projects.findById(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        const chapter = findChapter(project, chapterId);
        if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
        const shot = chapter.shots.id(shotId);
        if (!shot) return res.status(404).json({ error: 'Shot not found' });
        
        if (name !== undefined) {
            const normalizedName = String(name).trim();
            if (!normalizedName) {
                return res.status(400).json({ error: 'Shot name is required' });
            }
            shot.name = normalizedName;
        }
        if (prompt !== undefined) shot.prompt = prompt;
        if (temperature !== undefined) shot.temperature = temperature;
        if (aspectRatio !== undefined) shot.aspectRatio = aspectRatio;
        if (imageSize !== undefined) shot.imageSize = imageSize;
        if (outputPath !== undefined) shot.outputPath = outputPath;
        if (req.body.selectedImagePath !== undefined) shot.selectedImagePath = req.body.selectedImagePath;

        project.markModified('chapters');
        await project.save();
        res.json({ shot });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

export default {
    addShot,
    getShots,
    deleteShot,
    deleteShots,
    updateShotsOrder,
    getShot,
    updateShot
};