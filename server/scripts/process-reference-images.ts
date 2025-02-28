import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { ensureDirectoryExists } from '../utils/image-processor';

const BODY_PARTS = {
  hand: {
    name: "Hand/Wrist",
    sides: ["Left", "Right"],
    views: ["Palm", "Back"]
  },
  ankle: {
    name: "Ankle",
    sides: ["Left", "Right"],
    views: ["Front", "Back"]
  },
  knee: {
    name: "Knee",
    sides: ["Left", "Right"],
    views: ["Front", "Back"]
  },
  back: {
    name: "Back",
    sides: null,
    views: ["Full", "Upper", "Middle", "Lower"]
  }
};

async function stripMetadata(inputPath: string, outputPath: string) {
  try {
    // Use sharp to strip metadata while processing
    await sharp(inputPath)
      .rotate() // Auto-rotate based on orientation
      .resize(800, null, { // Resize width to 800px, maintain aspect ratio
        withoutEnlargement: true
      })
      .jpeg({ 
        quality: 85,
        chromaSubsampling: '4:4:4' // Preserve color quality
      })
      .withMetadata(false) // Remove all metadata
      .toFile(outputPath + '.tmp');

    // Replace the original file with the processed one
    fs.renameSync(outputPath + '.tmp', outputPath);
    console.log(`Successfully processed and stripped metadata: ${outputPath}`);
  } catch (error) {
    console.error(`Error processing ${outputPath}:`, error);
    // Create a placeholder if processing fails
    await createPlaceholderImage(outputPath);
  }
}

async function createPlaceholderImage(outputPath: string) {
  // Create a simple gray placeholder image with no metadata
  await sharp({
    create: {
      width: 800,
      height: 1200,
      channels: 3,
      background: { r: 200, g: 200, b: 200 }
    }
  })
  .jpeg({ quality: 85 })
  .withMetadata(false)
  .toFile(outputPath);

  console.log(`Created placeholder for: ${outputPath}`);
}

async function processImageDirectory() {
  const outputBaseDir = path.join(process.cwd(), 'client/public/assets/body-parts');
  ensureDirectoryExists(outputBaseDir);

  // Process each body part
  for (const [part, data] of Object.entries(BODY_PARTS)) {
    const partDir = path.join(outputBaseDir, part);
    ensureDirectoryExists(partDir);

    if (data.sides) {
      for (const side of data.sides) {
        for (const view of data.views) {
          const fileName = `${side.toLowerCase()}-${view.toLowerCase()}.jpg`;
          const outputPath = path.join(partDir, fileName);

          // If the file exists, strip its metadata
          if (fs.existsSync(outputPath)) {
            await stripMetadata(outputPath, outputPath);
          } else {
            // If it doesn't exist, create a placeholder
            await createPlaceholderImage(outputPath);
          }
        }
      }
    } else {
      for (const view of data.views) {
        const fileName = `${view.toLowerCase()}.jpg`;
        const outputPath = path.join(partDir, fileName);

        // If the file exists, strip its metadata
        if (fs.existsSync(outputPath)) {
          await stripMetadata(outputPath, outputPath);
        } else {
          // If it doesn't exist, create a placeholder
          await createPlaceholderImage(outputPath);
        }
      }
    }
  }
}

// Run the processor
processImageDirectory().catch(console.error);