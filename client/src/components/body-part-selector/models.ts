// Import body part images
import achillesModel from '../../assets/models/achilles.jpg';
// Create a placeholder hand model path
// This uses a simple placeholder until a real hand image is available
const handModelPath = new URL('../../assets/models/hand_placeholder.jpg', import.meta.url).href;

export const bodyPartModels = {
  achilles: {
    default: achillesModel
  },
  hand: {
    default: handModelPath
  }
};

export type BodyPartModelKey = keyof typeof bodyPartModels;