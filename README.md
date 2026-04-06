# THIRSTYCOMIC

<p align="center">
<img src="https://img.shields.io/badge/build-passing-green">
<img src="https://img.shields.io/badge/NodeJS-v24.11.0-green">
<img src="https://img.shields.io/badge/Nuxt.js-v3.33.1-lightgreen">
<img src="https://img.shields.io/badge/MongoDB-v8.2.3-lightgreen">
</p>

<br>

<p align="center">
<img src="/THIRSTYLE.svg" alt="THIRSTLE" width="300">
</p>

<p align="center">
<img src="/ThirstyComic.svg" alt="ThirstyComic" width="200">
</p>

## 项目介绍

本地Web应用，通过单独控制每个分镜，继承上一个分镜的生成结果，插入带有单独描述的参考图，来精确控制漫画的生成效果。该项目还处于早期开发阶段，可能还存在功能不完善，BUG 多等问题

### 未来计划

* AI 自动排版
* 集成手动排版工具
* 分层生成背景，人物与气泡

<img src="/UIView.png">
<p align="center">
<img src="/ComicExample.png" width="500">
</p>

## 部署

### Docker Compose

   **`docker-compose.yml`**
   ```yaml
   services:
     autocomic:
       image: thirstywater/thirstycomic:latest
       container_name: thirstycomic
       ports:
         - "18080:3000"
       env_file:
         - .env.backend
       depends_on:
         - mongo
       restart: unless-stopped

     mongo:
       image: mongo:latest
       container_name: autocomic-mongo
       volumes:
         - mongo_data:/data/db
       restart: unless-stopped

   volumes:
     mongo_data:
   ```

   **`.env.backend` (环境变量)**
   ```ini
   NODE_ENV=production
   PORT=3000
   MONGO_URI=mongodb://mongo:27017/autocomic
   ```

   ```bash
   docker compose up -d
   ```

   启动成功后，在浏览器中访问：[http://localhost:18080](http://localhost:18080)

## 配置
进入应用后，可以在侧栏进入 Setting 设置 BaseURL，APIKey 模型ID 等信息，目前版本仅适配了 Gemini API。您可以前往 [https://aistudio.google.com/api-keys](https://aistudio.google.com/api-keys) 获取。

## 使用

创建项目后，提供了三栏式的一个工作区。可以管理分镜，在中间的资源区上传人物，背景等。资源可以在单独的选项卡上传，你可以给每个图片都添加一份单独的介绍，用于描述角色的名字与简要特征，这些都会提供给AI作为参考。一个分镜可以多次尝试生成多个结果，你可以选择其中一个作为既定结果，也可以将选中项作为上下文传递到下一个分镜的生成当中。



