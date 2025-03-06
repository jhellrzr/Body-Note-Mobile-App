// Import body part images
import achillesModel from '../../assets/models/achilles.jpg';

export const bodyPartModels = {
  achilles: {
    default: achillesModel
  }
  // Note: Hand model temporarily disabled until asset is available
  // hand: {
  //   default: handModel
  // }
};

export type BodyPartModelKey = keyof typeof bodyPartModels;