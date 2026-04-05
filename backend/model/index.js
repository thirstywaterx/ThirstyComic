import mongoose from 'mongoose';
import projectSchema from './projects.js';
import resourcesSchema from './resources.js';
import settingsSchema from './settings.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
}

main().catch(err => console.log(err));

export const Projects = mongoose.model('Projects', projectSchema);
export const Resources = mongoose.model('Resources', resourcesSchema);
export const Settings = mongoose.model('Settings', settingsSchema);