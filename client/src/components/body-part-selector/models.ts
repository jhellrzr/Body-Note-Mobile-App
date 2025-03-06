// Import body part images
import achillesModel from '@/assets/models/achilles.jpg';

export const bodyPartModels = {
  achilles: {
    default: achillesModel
  }
};

export type BodyPartModelKey = keyof typeof bodyPartModels;