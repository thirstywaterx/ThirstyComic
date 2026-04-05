import multipart from 'multer';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Resources } from '../model/index.js';
import { Projects } from '../model/index.js';

async function uploadResource(req, res) {
    const { projectId } = req.params;
    const { imageDescriptions, name, description, type } = req.body;
    const files = req.files;
    let resources = await Resources.findOne({ projectId });

    if (!resources) {
        resources = new Resources({ projectId });
    }

    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    const resourceType = type.toLowerCase();
    if (!resources[resourceType]) {
        resources[resourceType] = [];
    }

    const newResource = {
        name,
        description,
        images: []
    };

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const safeName = `${uuidv4()}${file.originalname}`;
        const targetPath = path.join('public', 'uploads', projectId, safeName);
        const storePath = path.join('uploads', projectId, safeName);
        await fs.ensureDir(path.dirname(targetPath));
        await fs.move(file.path, targetPath);

        const currentImageDesc = Array.isArray(imageDescriptions) ? imageDescriptions[i] : imageDescriptions;
        
        newResource.images.push({
            url: storePath,
            description: currentImageDesc
        });
    }

    resources[resourceType].push(newResource);

    await resources.save();

    res.status(200).json({ message: 'Resource uploaded successfully' });
}

async function getResourcesList(req, res) {
    const { projectId, type } = req.params;
    const resources = await Resources.findOne({ projectId });
    if (!resources) {
        return res.status(200).json({ resources: [] });
    }
    const resourceList = resources[type.toLowerCase()];
    res.status(200).json({ resources: resourceList });
}

async function updateResource(req, res) {
    const { projectId, type, resourceId } = req.params;
    const { name, description, targetType, imageDescriptions } = req.body;

    try {
        const resources = await Resources.findOne({ projectId });
        if (!resources) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        const sourceType = String(type || '').toLowerCase();
        if (!resources[sourceType]) {
            return res.status(404).json({ error: 'Resource type not found' });
        }

        const sourceList = resources[sourceType];
        const sourceIndex = sourceList.findIndex(item => item._id.toString() === resourceId);
        if (sourceIndex === -1) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        const resourceItem = sourceList[sourceIndex];
        if (name !== undefined) {
            const normalizedName = String(name).trim();
            if (!normalizedName) {
                return res.status(400).json({ error: 'Resource name is required' });
            }
            resourceItem.name = normalizedName;
        }
        if (description !== undefined) {
            resourceItem.description = String(description || '');
        }

        if (imageDescriptions !== undefined && Array.isArray(resourceItem.images)) {
            const normalizedImageDescriptions = Array.isArray(imageDescriptions)
                ? imageDescriptions
                : [imageDescriptions];

            resourceItem.images.forEach((imageItem, index) => {
                if (normalizedImageDescriptions[index] !== undefined) {
                    imageItem.description = String(normalizedImageDescriptions[index] || '');
                }
            });
        }

        const normalizedTargetType = String(targetType || sourceType).toLowerCase();
        if (normalizedTargetType !== sourceType) {
            if (!resources[normalizedTargetType]) {
                return res.status(400).json({ error: 'Invalid resource type' });
            }

            sourceList.splice(sourceIndex, 1);
            resources[normalizedTargetType].push(resourceItem);
        }

        await resources.save();

        return res.status(200).json({
            message: 'Resource updated successfully',
            resource: resourceItem,
            type: normalizedTargetType
        });
    } catch (error) {
        console.error('Error updating resource:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function deleteResource(req, res) {
    const { projectId, type, resourceId } = req.params;

    try {
        const resources = await Resources.findOne({ projectId });
        if (!resources) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        const resourceType = String(type || '').toLowerCase();
        if (!resources[resourceType]) {
            return res.status(404).json({ error: 'Resource type not found' });
        }

        const list = resources[resourceType];
        const targetIndex = list.findIndex(item => item._id.toString() === resourceId);

        if (targetIndex === -1) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        list.splice(targetIndex, 1);
        await resources.save();

        return res.status(200).json({ message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Error deleting resource:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function embedResource(req, res) {
    const { projectId, chapterId, shotId } = req.params;
    const { resources } = req.body;

    try {
        const project = await Projects.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'project not found' });
        }

        const chapter = project.chapters.find(c => c.name === chapterId);
        if (!chapter) {
            return res.status(404).json({ error: 'chapter not found' });
        }

        const shot = chapter.shots.id(shotId);
        if (!shot) {
            return res.status(404).json({ error: 'shot not found' });
        }

        const type = ['character', 'background', 'object', 'others'];
        if (!shot.imageUrl) {
            shot.imageUrl = {
                character: [],
                background: [],
                object: [],
                others: []
            };
        }

        // 把选中的资源嵌入到对应分类的imageUrl字段中
        for (const t of type) {
            if (!resources || resources[t] === undefined) {
                continue;
            }

            const incomingResources = resources[t];
            if (!Array.isArray(incomingResources) || incomingResources.length === 0) {
                continue;
            }

            shot.imageUrl[t] = [];
            const newItems = incomingResources.map((r) => {
                const images = Array.isArray(r.images)
                    ? r.images
                        .filter((img) => img && img.url)
                        .map((img) => ({
                            url: img.url,
                            description: img.description || ''
                        }))
                    : [];

                const fallbackUrls = Array.isArray(r.url) ? r.url : (r.url ? [r.url] : []);
                const fallbackDescriptions = Array.isArray(r.description) ? r.description : [r.description || ''];

                const normalizedImages = images.length > 0
                    ? images
                    : fallbackUrls.map((url, index) => ({
                        url,
                        description: fallbackDescriptions[index] || ''
                    }));

                return {
                    name: r.name || '',
                    resourceDescription: Array.isArray(r.description)
                        ? (r.description[0] || '')
                        : (r.description || ''),
                    images: normalizedImages,
                    description: normalizedImages.map((img) => img.description || ''),
                    url: normalizedImages.map((img) => img.url).filter(Boolean)
                };
            });
            shot.imageUrl[t].push(...newItems);
        }

        await project.save();
        res.status(200).json({ message: 'Resource embedded successfully', shot });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'server error' });
    }
}

async function getembedResource(req, res) {
    const { projectId, chapterId, shotId } = req.params;
    const project = await Projects.findById(projectId);
    if (!project) {
        return res.status(404).json({ error: 'project not found' });
    }

    const chapter = project.chapters.find(c => c.name === chapterId);
    if (!chapter) {
        return res.status(404).json({ error: 'chapter not found' });
    }

    const shot = chapter.shots.id(shotId);
    if (!shot) {
        return res.status(404).json({ error: 'shot not found' });
    }

     res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
        message: 'Embedded resources fetched successfully',
        imageUrl: shot.imageUrl
    })
}


export default {
    uploadResource,
    getResourcesList,
    updateResource,
    deleteResource,
    embedResource,
    getembedResource
}