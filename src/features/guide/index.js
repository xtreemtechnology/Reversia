// src/features/guide/index.js
//
// The Reversia Guide — the AI companion screen, brought back from the
// scrapped AIGuideModal as a full screen.

export { default as GuideScreen } from "./screens/GuideScreen";
export {
  askGuide,
  answerLocally,
  findFoodsInQuestion,
  GUIDE_CHIPS,
  GUIDE_SAFETY_LINE,
} from "./services/guideService";
