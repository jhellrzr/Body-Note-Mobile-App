import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// This utility will help us process and optimize images
async function processAndSaveImage(inputPath: string, outputPath: string) {
  await sharp(inputPath)
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
