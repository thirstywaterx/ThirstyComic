import {Projects} from '../../model/index.js';
import { body } from 'express-validator';
import { PROJECT_ERROR_CODES } from './errorCode.js';
import { errorBack } from './errorBack.js';

export default {
    uploadProject: [
        body('name').notEmpty().withMessage(PROJECT_ERROR_CODES.NAME_REQUIRED)
            .custom(async val => {
                const projectExists = await Projects.findOne({ name: val });
                if (projectExists) {
                    throw new Error(PROJECT_ERROR_CODES.NAME_EXISTS);
                }
            }).bail(),
        body('description').notEmpty().withMessage(PROJECT_ERROR_CODES.DESCRIPTION_REQUIRED),
        errorBack
    ],
    updateProject: [
        body('name').notEmpty().withMessage(PROJECT_ERROR_CODES.NAME_REQUIRED)
            .custom(async (val, { req }) => {
                const projectExists = await Projects.findOne({ name: val, _id: { $ne: req.params.id } });
                if (projectExists) {
                    throw new Error(PROJECT_ERROR_CODES.NAME_EXISTS);
                }
            }).bail(),
        body('description').notEmpty().withMessage(PROJECT_ERROR_CODES.DESCRIPTION_REQUIRED),
        errorBack
    ]
}