import { Projects } from '../model/index.js';
import { Resources } from '../model/index.js';
import fs from 'fs-extra';

function addProject(req, res) {
    const { name, description } = req.body;
    const projectModel = new Projects({
        name,
        description,
        chapters: [{ name: 'Default' }]
    });
    projectModel.save()
        .then(project => {
            res.json({
                success: true,
                data: project
            });
        })
        .catch(err => {
            res.status(500).json({
                success: false,
                message: err.message
            });
        });
}

async function getProject(req, res) {
    const page = Number(req.query.page) || 1;
    const pageSize = 10;
    const searchWords = req.query.q || '';

    let query = {};
    if (searchWords) {
        query.name = { $regex: searchWords, $options: 'i' };
    }

    try {
        const [list, total] = await Promise.all([
            Projects.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize),

            Projects.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: list,
            total,
            page,
            pageSize
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

async function getProjectById(req, res) {
    const { id } = req.params;

    try {
        const project = await Projects.findById(id).select('-__v');
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        res.json({
            success: true,
            data: project
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

async function updateProject(req, res) {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const project = await Projects.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        res.json({
            success: true,
            data: project
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

async function deleteProject(req, res) {
    const { id } = req.params;

    try {
        const project = await Projects.findByIdAndDelete(id);
        const resource = await Resources.deleteMany({ projectId: id });

        const deletePath = `public/uploads/${id}`;
        try {
            await fs.remove(deletePath);
        } catch (err) {
            console.error('Error occurred while deleting upload directory:', err);
        }
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export default {
    addProject,
    getProject,
    getProjectById,
    updateProject,
    deleteProject
};