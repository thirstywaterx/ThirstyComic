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

## About the Project

A local web application that precisely controls the comic generation process by individually managing each panel, inheriting the generation results from the previous panel, and inserting reference images with independent descriptions. This project is currently in its early development stage, so there may still be incomplete features and bugs.

### Future Plans

* AI auto-layout (typesetting)
* Integration of manual layout tools
* Layered generation of backgrounds, characters, and speech bubbles

<img src="/UIView.png">
<p align="center">
<img src="/ComicExample.png" width="500">
</p>

## Deployment

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

   **`.env.backend` (Environment Variables)**
   ```ini
   NODE_ENV=production
   PORT=3000
   MONGO_URI=mongodb://mongo:27017/autocomic
   ```

   ```bash
   docker compose up -d
   ```

   After a successful startup, visit the application in your browser at: [http://localhost:18080](http://localhost:18080)

## Configuration
After entering the application, you can go to the Settings in the sidebar to configure the BaseURL, API Key, Model ID, and other information. The current version only supports the Gemini API. You can obtain your API key at [https://aistudio.google.com/api-keys](https://aistudio.google.com/api-keys).

## Usage

After creating a project, you are provided with a three-column workspace. You can manage the panels and upload characters, backgrounds, and other assets in the central resource area. Resources can be uploaded in separate tabs, and you can add an individual introduction to each image, describing the character's name and brief traits. All of this will be provided to the AI as reference material. You can attempt to generate multiple results for a single panel, choose one as your established result, and pass the selected item as context into the generation of the next panel.