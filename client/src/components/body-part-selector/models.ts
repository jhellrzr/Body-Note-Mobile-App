// Import body part images
import handModel from '@/assets/models/hand.png';
import achillesModel from '@/assets/models/achilles.jpg';

export const bodyPartModels = {
  hand: {
    default: handModel
  },
  achilles: {
    default: achillesModel
  }
};

export type BodyPartModelKey = keyof typeof bodyPartModels;