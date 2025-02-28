import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

const BODY_PARTS = {
  hand: {
    name: "Hand",
    sides: ["Left", "Right"],
    views: ["Front", "Back", "Side", "Palm"]
  },
  wrist: {
    name: "Wrist",
    sides: ["Left", "Right"],
    views: ["Front", "Back", "Side-In", "Side-Out"]
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

async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return response.data[0].url;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

async function generateAllImages() {
  const baseDir = path.join(process.cwd(), "client/public/assets/body-parts");

  for (const [part, data] of Object.entries(BODY_PARTS)) {
    const partDir = path.join(baseDir, part);
    if (!fs.existsSync(partDir)) {
      fs.mkdirSync(partDir, { recursive: true });
    }

    if (data.sides) {
      for (const side of data.sides) {
        for (const view of data.views) {
          const prompt = `Professional medical photograph of a ${side.toLowerCase()} ${data.name.toLowerCase()} from the ${view.toLowerCase()} view. Clean medical background, clear lighting, anatomically accurate, high detail, professional medical reference style. No text or annotations.`;
          const imageUrl = await generateImage(prompt);
          
          // Download and save the image
          const response = await fetch(imageUrl);
          const buffer = await response.arrayBuffer();
          const fileName = `${side.toLowerCase()}-${view.toLowerCase()}.jpg`;
          fs.writeFileSync(path.join(partDir, fileName), Buffer.from(buffer));
          
          console.log(`Generated ${fileName}`);
          // Wait a bit to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } else {
      for (const view of data.views) {
        const prompt = `Professional medical photograph of a ${data.name.toLowerCase()} focusing on the ${view.toLowerCase()} section. Clean medical background, clear lighting, anatomically accurate, high detail, professional medical reference style. No text or annotations.`;
        const imageUrl = await generateImage(prompt);
        
        // Download and save the image
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        const fileName = `${view.toLowerCase()}.jpg`;
        fs.writeFileSync(path.join(partDir, fileName), Buffer.from(buffer));
        
        console.log(`Generated ${fileName}`);
        // Wait a bit to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}

// Run the generator
generateAllImages().catch(console.error);
