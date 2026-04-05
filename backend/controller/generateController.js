import { GoogleGenAI } from "@google/genai"
import fs from "fs/promises";
import { createHash } from "crypto";
import mongoose from "mongoose";
import { Projects, Settings } from "../model/index.js";
import textImage from "../utils/textImage.js";
import { v4 as uuidv4 } from 'uuid';

async function generateShot(req, res) {
    console.log('processing');
    const tempPath = [];
    let targetShotId = null;
    let targetShotObjectId = null;

    async function updateShotState({ set = {}, addOutputPaths = [] } = {}) {
        if (!targetShotId || !targetShotObjectId) {
            return;
        }

        const setPayload = {};
        for (const [key, value] of Object.entries(set)) {
            setPayload[`chapters.$[].shots.$[shot].${key}`] = value;
        }

        const updatePayload = {};
        if (Object.keys(setPayload).length > 0) {
            updatePayload.$set = setPayload;
        }

        if (addOutputPaths.length > 0) {
            updatePayload.$addToSet = {
                'chapters.$[].shots.$[shot].outputPath': { $each: addOutputPaths }
            };
        }

        if (Object.keys(updatePayload).length === 0) {
            return;
        }

        await Projects.updateOne(
            { 'chapters.shots._id': targetShotObjectId },
            updatePayload,
            { arrayFilters: [{ 'shot._id': targetShotObjectId }] }
        );
    }

    async function markFailedAndSave(message) {
        await updateShotState({
            set: {
                generationStatus: 'failed',
                generationError: message || 'Unknown error',
                generationFinishedAt: new Date()
            }
        });
    }

    try {
        const { shotId, shotID, prompt, temperature, aspectRatio, imageSize } = req.body;
        targetShotId = shotId || shotID;

        const settings = await Settings.findOne() || {};
        const apiKey = settings.apiKey;
        const baseUrl = settings.baseURL;
        const modelId = settings.modelId || 'gemini-3.1-flash-image-preview';

        if (!apiKey || !baseUrl) {
            return res.status(400).json({ error: "Please configure Base URL and API Key in settings first" });
        }

        const ai = new GoogleGenAI({
            apiKey: apiKey,
            httpOptions: {
                baseUrl: baseUrl
            }
        });

        if (!targetShotId) {
            return res.status(400).json({ error: "shotId is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(targetShotId)) {
            return res.status(400).json({ error: "Invalid shotId" });
        }

        targetShotObjectId = new mongoose.Types.ObjectId(targetShotId);

        const project = await Projects.findOne({ "chapters.shots._id": targetShotObjectId });

        let shot = null;
        if (project) {
            for (const chapter of project.chapters) {
                shot = chapter.shots.id(targetShotObjectId);
                if (shot) break;
            }
        }

        if (!shot) {
            return res.status(404).json({ error: "Shot not found" });
        }

        await updateShotState({
            set: {
                generationStatus: 'generating',
                generationError: '',
                generationStartedAt: new Date(),
                generationFinishedAt: null,
                ...(prompt !== undefined ? { prompt } : {}),
                ...(temperature !== undefined ? { temperature } : {}),
                ...(aspectRatio !== undefined ? { aspectRatio } : {}),
                ...(imageSize !== undefined ? { imageSize } : {})
            }
        });

        const assets = shot.imageUrl
        const types = ['character', 'background', 'object', 'others']

        const imagePathsForPrompt = [];
        const descriptionsForPrompt = [];

        const typeMap = {
            'character': '【角色】',
            'background': '【背景】',
            'object': '【物品】',
            'others': '【其他】'
        };

        for (const type of types) {
            const typePrefix = typeMap[type] || `【${type}】`;
            const typeAssets = assets[type] || [];
            // Traverse from newest to oldest embedded resource to prioritize later modifications
            for (let k = typeAssets.length - 1; k >= 0; k--) {
                const asset = typeAssets[k];
                const images = Array.isArray(asset.images) ? asset.images : [];

                if (images.length > 0) {
                    for (const img of images) {
                        if (!img?.url) continue;
                        imagePathsForPrompt.push(`public/${img.url}`);
                        descriptionsForPrompt.push(`${typePrefix} ${img.description || asset.resourceDescription || asset.name || ''}`);
                    }
                    continue;
                }

                const imageUrls = Array.isArray(asset.url) ? asset.url.filter(Boolean) : (asset.url ? [asset.url] : []);
                const descriptions = Array.isArray(asset.description) ? asset.description : [asset.description || ''];

                for (let index = 0; index < imageUrls.length; index++) {
                    imagePathsForPrompt.push(`public/${imageUrls[index]}`);
                    descriptionsForPrompt.push(`${typePrefix} ${descriptions[index] || asset.resourceDescription || asset.name || ''}`);
                }
            }
        }

        // Deduplicate arrays
        const uniqueImagePaths = [];
        const uniqueDescriptions = [];
        const seen = new Set();
        
        const { prevImage } = req.body;
        if (prevImage) {
            const prevImagePath = `public/${prevImage}`;
            seen.add(prevImagePath);
            uniqueImagePaths.push(prevImagePath);
            uniqueDescriptions.push("【前序画面参考】");
        }

        for (let i = 0; i < imagePathsForPrompt.length; i++) {
            const path = imagePathsForPrompt[i];
            if (!seen.has(path)) {
                seen.add(path);
                uniqueImagePaths.push(path);
                uniqueDescriptions.push(descriptionsForPrompt[i]);
            }
        }

        if (uniqueImagePaths.length > 0) {
            const merged = await textImage(uniqueImagePaths, uniqueDescriptions);
            if (merged?.tempFilePath) {
                tempPath.push(merged.tempFilePath);
            }
        }

        const mimeType = 'image/png';
        const imageParts = await Promise.all(
            tempPath.map(async (filePath) => {
                const fileBuffer = await fs.readFile(filePath);
                return {
                    inlineData: {
                        mimeType,
                        data: fileBuffer.toString('base64')
                    }
                };
            })
        );

        const response = await ai.models.generateContent({
            model: modelId,
            contents: [{
                role: "user",
                parts: [
                    ...(prompt ? [{ text: 
                        `你是一个专业的漫画分镜创作助手，无需生成对话框和文字，画面即可。请严格按照提示词中的要求去生成图片。
                        用户传入了(非必须)分为不同组的一些参考图片(角色，背景，物品，其他)，每组图片都合为了一张大图片，每张大图下每张小图的下方空白位置带有图片的对应的描述信息。请根据这些参考图片和描述来生成新的分镜画面，要求画面内容与描述相符，风格可以参考图片但不必完全一致，可以进行合理的创意发挥。
                        用户还可能传入上一个分镜所生成的图片，如果有的话请务必参考这个图片的内容来进行创作，确保新生成的分镜与上一个分镜在内容和风格上有一定的连续性。
                        用户对于当前分镜的提示词：${prompt}
                        `
                     }] : []),
                    ...imageParts
                ]
            }],
            config: {
                temperature: temperature || 1,
                imageConfig: {
                    aspectRatio: aspectRatio || "1:1",
                    imageSize: imageSize || "2K",
                },
            }
        });

        const parts = response?.candidates?.[0]?.content?.parts || [];
        const texts = [];
        const imageUrls = [];

        console.log(parts)

        for (const part of parts) {
            if (part?.text) {
                texts.push(part.text);
                continue;
            }

            if (part?.inlineData?.data) {
                const imageData = part.inlineData.data;

                const buffer = Buffer.from(imageData, "base64");
                const fileName = 'public/outputs/' + uuidv4() + '.png';
                await fs.writeFile(fileName, buffer);
                imageUrls.push(fileName.replace('public/', ''));

                break
            }
        }

        if (!texts.length && !imageUrls.length) {
            await markFailedAndSave('No valid content returned by model');
            return res.status(502).json({ error: "No valid content returned by model" });
        }

        await updateShotState({
            set: {
                generationStatus: 'completed',
                generationError: '',
                generationFinishedAt: new Date()
            },
            addOutputPaths: imageUrls
        });

        return res.status(200).json({
            message: "Generated",
            text: texts.join('\n').trim(),
            imageUrls: imageUrls,
            imageUrl: imageUrls[0] || null
        });
    } catch (error) {
        console.error("generateShot error:", error);

        try {
            await markFailedAndSave(error?.message || 'Unknown error');
        } catch (saveError) {
            console.error('failed to persist generation failure state:', saveError);
        }

        if (res.headersSent) {
            return;
        }
        return res.status(500).json({
            error: "Failed to generate shot",
            detail: error?.message || "Unknown error"
        });
    } finally {
        await Promise.all(
            tempPath.map(async (filePath) => {
                try {
                    await fs.unlink(filePath);
                } catch (_) {
                }
            })
        );
    }
}

export default {
    generateShot
};