import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// This utility will help us process and optimize images
async function processAndSaveImage(inputPath: string, outputPath: string, options: {
  left?: number,
  top?: number,
  width?: number,
  height?: number
} = {}) {
  // Create a sharp instance
  let image = sharp(inputPath);

  // If crop options are provided, extract that region
  if (options.width && options.height) {
    image = image.extract({
      left: options.left || 0,
      top: options.top || 0,
      width: options.width,
      height: options.height
    });
  }

  // Resize, maintain aspect ratio, and save
  await image
    .resize(800, 800, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .jpeg({ quality: 90 })
    .toFile(outputPath);
}

// Function to ensure directory exists
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export { processAndSaveImage, ensureDirectoryExists };