import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { processAndSaveImage, ensureDirectoryExists } from '../utils/image-processor';

const BODY_PARTS = {
  hand: {
    name: "Hand",
    sides: ["Left", "Right"],
    views: ["Front", "Back", "Side", "Palm"],
    regions: {
      "Front": { left: 0, top: 0, width: 84, height: 150 },
      "Back": { left: 84, top: 0, width: 84, height: 150 },
      "Side": { left: 168, top: 0, width: 84, height: 150 },
      "Palm": { left: 252, top: 0, width: 84, height: 150 }
    }
  },
  wrist: {
    name: "Wrist",
    sides: ["Left", "Right"],
    views: ["Front", "Back", "Side-In", "Side-Out"],
    regions: {
      "Front": { left: 0, top: 0, width: 84, height: 150 },
      "Back": { left: 84, top: 0, width: 84, height: 150 },
      "Side-In": { left: 168, top: 0, width: 84, height: 150 },
      "Side-Out": { left: 252, top: 0, width: 84, height: 150 }
    }
  },
  ankle: {
    name: "Ankle",
    sides: ["Left", "Right"],
    views: ["Front", "Back", "Side-In", "Side-Out"],
    regions: {
      "Front": { left: 0, top: 0, width: 84, height: 150 },
      "Back": { left: 84, top: 0, width: 84, height: 150 },
      "Side-In": { left: 168, top: 0, width: 84, height: 150 },
      "Side-Out": { left: 252, top: 0, width: 84, height: 150 }
    }
  },
  knee: {
    name: "Knee",
    sides: ["Left", "Right"],
    views: ["Front", "Back", "Side-In", "Side-Out"],
    regions: {
      "Front": { left: 0, top: 0, width: 84, height: 150 },
      "Back": { left: 84, top: 0, width: 84, height: 150 },
      "Side-In": { left: 168, top: 0, width: 84, height: 150 },
      "Side-Out": { left: 252, top: 0, width: 84, height: 150 }
    }
  },
  back: {
    name: "Back",
    sides: null,
    views: ["Full", "Upper", "Middle", "Lower"],
    regions: {
      "Full": { left: 0, top: 0, width: 84, height: 150 },
      "Upper": { left: 84, top: 0, width: 84, height: 150 },
      "Middle": { left: 168, top: 0, width: 84, height: 150 },
      "Lower": { left: 252, top: 0, width: 84, height: 150 }
    }
  }
};

async function processReferenceImages() {
  const sourceImage = path.join(process.cwd(), '..', 'attached_assets', 'images.jpeg');
  const outputBaseDir = path.join(process.cwd(), '..', 'client/public/assets/body-parts');

  // Process for each body part
  for (const [part, data] of Object.entries(BODY_PARTS)) {
    const partDir = path.join(outputBaseDir, part);
    ensureDirectoryExists(partDir);

    if (data.sides) {
      for (const side of data.sides) {
        for (const view of data.views) {
          const outputPath = path.join(
            partDir,
            `${side.toLowerCase()}-${view.toLowerCase()}.jpg`
          );
          try {
            await processAndSaveImage(sourceImage, outputPath, data.regions[view]);
            console.log(`Processed: ${outputPath}`);
          } catch (error) {
            console.error(`Error processing ${outputPath}:`, error);
          }
        }
      }
    } else {
      for (const view of data.views) {
        const outputPath = path.join(partDir, `${view.toLowerCase()}.jpg`);
        try {
          await processAndSaveImage(sourceImage, outputPath, data.regions[view]);
          console.log(`Processed: ${outputPath}`);
        } catch (error) {
          console.error(`Error processing ${outputPath}:`, error);
        }
      }
    }
  }
}

// Run the processor
processReferenceImages().catch(console.error);