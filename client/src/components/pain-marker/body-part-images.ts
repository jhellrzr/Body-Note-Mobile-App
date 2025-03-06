// Map of body parts to their corresponding image paths
export const bodyPartImages = {
  "hand-left-palm": "/images/hand-left-palm.png",
  "hand-left-back": "/images/hand-left-back.png",
  "hand-right-palm": "/images/hand-right-palm.png",
  "hand-right-back": "/images/hand-right-back.png",
  "achilles-left-side": "/images/achilles-tendon.jpg",
  "achilles-right-side": "/images/achilles-tendon.jpg"
} as const;

export type BodyPartImageKey = keyof typeof bodyPartImages;

export function getBodyPartImage(part: string, side: string | null, view: string): string {
  if (!part || !side || !view) {
    console.error('Missing parameters:', { part, side, view });
    return "";
  }

  const key = `${part}-${side.toLowerCase()}-${view.toLowerCase()}` as BodyPartImageKey;
  console.log('Attempting to load image with key:', key); // Debug log
  console.log('Available image paths:', bodyPartImages); // Debug log

  const imagePath = bodyPartImages[key];
  if (!imagePath) {
    console.error(`No image found for key: ${key}`);
    return "";
  }

  console.log('Found image path:', imagePath); // Debug log
  return imagePath;
}