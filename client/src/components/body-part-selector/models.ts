// Import body part images
import achillesImage from '../../assets/models/achilles.jpg';

export const bodyPartModels = {
  achilles: {
    default: achillesImage
  }
};

export type BodyPartModelKey = keyof typeof bodyPartModels;