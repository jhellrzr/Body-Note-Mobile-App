import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { ensureDirectoryExists } from '../utils/image-processor';

const execAsync = promisify(exec);

const BODY_PARTS = {
  hand: {
    name: "Hand/Wrist",
    sides: ["Left", "Right"],
    views: ["Palm", "Back", "Side-In", "Side-Out"]
  },
  ankle: {
    name: "Ankle",
    sides: ["Left", "Right"],
    views: ["Front", "Back", "Side-In", "Side-Out"]
  },
  knee: {
    name: "Knee",
    sides: ["Left", "Right"],
    views: ["Front", "Back", "Side-In", "Side-Out"]
  },
  back: {
    name: "Back",
    sides: null,
    views: ["Full", "Upper", "Middle", "Lower"]
  }
};

async function processHeicImage(inputPath: string, outputPath: string) {
  try {
    // Use imagemagick's convert command
    await execAsync(`convert "${inputPath}" -resize 800x -auto-orient "${outputPath}"`);
    console.log(`Successfully processed: ${outputPath}`);
  } catch (error) {
    console.error(`Error processing ${outputPath}:`, error);
    // Create a placeholder if processing fails
    await createPlaceholderImage(outputPath);
  }
}

async function createPlaceholderImage(outputPath: string) {
  // Create a simple gray placeholder image
  await sharp({
    create: {
      width: 800,
      height: 1200,
      channels: 3,
      background: { r: 200, g: 200, b: 200 }
    }
  })
  .jpeg()
  .toFile(outputPath);

  console.log(`Created placeholder for: ${outputPath}`);
}

async function processReferenceImages() {
  const heicFiles = [
    'IMG_8732.HEIC', // Palm view
    'IMG_8730.HEIC', // Back view
    'IMG_8729.HEIC', // Side-In view
    'IMG_8728.HEIC'  // Side-Out view
  ];

  // Create output directories
  const outputBaseDir = path.join(process.cwd(), '..', 'client/public/assets/body-parts');
  ensureDirectoryExists(outputBaseDir);

  // Process hand images first
  const handDir = path.join(outputBaseDir, 'hand');
  ensureDirectoryExists(handDir);

  // Create mapping of HEIC files to views
  const viewMap: Record<string, string> = {
    'IMG_8732.HEIC': 'palm',
    'IMG_8730.HEIC': 'back',
    'IMG_8729.HEIC': 'side-in',
    'IMG_8728.HEIC': 'side-out'
  };

  // Process each HEIC file for both left and right sides
  for (const fileName of heicFiles) {
    const inputPath = path.join(process.cwd(), '..', 'attached_assets', fileName);
    const view = viewMap[fileName];

    if (!view) continue;

    for (const side of ['left', 'right']) {
      const outputPath = path.join(handDir, `${side}-${view}.jpg`);
      await processHeicImage(inputPath, outputPath);
    }
  }

  // For other body parts, create placeholder images for now
  for (const [part, data] of Object.entries(BODY_PARTS)) {
    if (part === 'hand') continue; // Already processed

    const partDir = path.join(outputBaseDir, part);
    ensureDirectoryExists(partDir);

    if (data.sides) {
      for (const side of data.sides) {
        for (const view of data.views) {
          const outputPath = path.join(
            partDir,
            `${side.toLowerCase()}-${view.toLowerCase()}.jpg`
          );
          await createPlaceholderImage(outputPath);
        }
      }
    } else {
      for (const view of data.views) {
        const outputPath = path.join(partDir, `${view.toLowerCase()}.jpg`);
        await createPlaceholderImage(outputPath);
      }
    }
  }
}

// Run the processor
processReferenceImages().catch(console.error);