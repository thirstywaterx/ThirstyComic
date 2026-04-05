import sharp from "sharp";
import integrateImages from "./intergrateImages.js";

function escapeXml(unsafe) {
    return (unsafe || "").replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

// Replaces Jimp logic. Uses Sharp to resize images to fixed width, add text banners.
export default async function textImage(images, texts) {
    const buffers = [];
    const TARGET_WIDTH = 1024;

    // Use a robust deduplication in case generateController passed duplicates
    const seen = new Set();

    for (let i = 0; i < images.length; i++) {
        if (seen.has(images[i])) continue;
        seen.add(images[i]);

        const rawText = texts[i] || "";
        const text = escapeXml(rawText);
        
        let imgBuffer;
        try {
            imgBuffer = await sharp(images[i])
                .resize({ width: TARGET_WIDTH })
                .toBuffer();
                
            const metadata = await sharp(imgBuffer).metadata();
            
            if (rawText.trim() !== '') {
                const bannerHeight = 80;
                const totalHeight = metadata.height + bannerHeight;

                const svgText = `
                <svg width="${TARGET_WIDTH}" height="${bannerHeight}">
                    <rect x="0" y="0" width="${TARGET_WIDTH}" height="${bannerHeight}" fill="#FFFFFF" />
                    <text x="10" y="50" font-family="Arial, sans-serif" font-size="32" fill="#000000">${text}</text>
                </svg>`;

                imgBuffer = await sharp({
                    create: {
                        width: TARGET_WIDTH,
                        height: totalHeight,
                        channels: 4,
                        background: { r: 255, g: 255, b: 255, alpha: 1 }
                    }
                })
                .composite([
                    { input: imgBuffer, gravity: 'north' },
                    { input: Buffer.from(svgText), gravity: 'south' }
                ])
                .png()
                .toBuffer();
            }
        } catch (err) {
            console.error('Sharp error on', images[i], err);
            continue; // Skip failed image rather than crashing entirely
        }
        
        buffers.push(imgBuffer);
    }
    
    if (buffers.length === 0) return null;
    return await integrateImages(buffers);
}
