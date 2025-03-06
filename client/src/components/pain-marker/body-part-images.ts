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
  const key = `${part}-${side?.toLowerCase()}-${view.toLowerCase()}` as BodyPartImageKey;
  return bodyPartImages[key] || "";
}
