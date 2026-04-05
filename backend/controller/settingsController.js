import { Settings } from '../model/index.js';

export const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ baseURL: '', apiKey: '', modelId: 'gemini-3.1-flash-image-preview' });
        }
        
        // 对返回给前端的数据进行脱敏处理
        const responseData = {
            baseURL: settings.baseURL,
            // 如果存在 API Key，则返回一个占位符，防止在网络面板抓包泄露
            apiKey: settings.apiKey ? '********' : '',
            modelId: settings.modelId || 'gemini-3.1-flash-image-preview'
        };
        
        res.status(200).json({ code: 200, data: responseData, msg: '获取成功' });
    } catch (error) {
        res.status(500).json({ code: 500, data: null, msg: '服务器错误', error: error.message });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const { baseURL, apiKey, modelId } = req.body;
        let settings = await Settings.findOne();
        
        if (!settings) {
            settings = new Settings({});
        }
        
        if (baseURL !== undefined) settings.baseURL = baseURL;
        if (modelId !== undefined) settings.modelId = modelId;
        // 只有当传入的 apiKey 不是我们下发的脱敏占位符，并且不为空时才更新
        if (apiKey !== undefined && apiKey !== '********') {
            settings.apiKey = apiKey;
        }
        
        await settings.save();
        res.status(200).json({ code: 200, msg: '保存成功' });
    } catch (error) {
        res.status(500).json({ code: 500, data: null, msg: '服务器错误', error: error.message });
    }
};