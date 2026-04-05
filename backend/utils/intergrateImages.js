import sharp from "sharp";
import { v4 as uuidv4 } from 'uuid';

export default async function integrateImages(inputs) {
    if (!inputs || inputs.length === 0) return null;

    const images = [];
    let totalHeight = 0;
    let maxWidth = 0;

    for (const input of inputs) {
        const metadata = await sharp(input).metadata();
        images.push({
            input,
            width: metadata.width,
            height: metadata.height
        });
        totalHeight += metadata.height;
        maxWidth = Math.max(maxWidth, metadata.width);
    }

    const composites = [];
    let currentHeight = 0;

    for (const img of images) {
        composites.push({
            input: img.input,
            top: currentHeight,
            left: 0
        });
        currentHeight += img.height;
    }

    const tempFilePath = 'temp/images/' + uuidv4() + '.png';

    await sharp({
        create: {
            width: maxWidth,
            height: totalHeight,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
        }
    })
        .composite(composites)
        .png()
        .toFile(tempFilePath);

    return {
        tempFilePath
    };
}
