import { createStore } from "zustand";
import { persist, devtools } from "zustand/middleware";
import {
  getCurrentFlowConfig,
  requiresOTPStep,
  requiresCameraStep,
} from "@/config/survey-flow.config";

export type SurveyMode = "pg" | "qr";

export type SurveyStep =
  | "gift-check-phone"
  | "gift-games"
  | "gift-lucky-wheel"
  | "info"
  | "otp"
  | "camera"
  | "games"
  | "flow-choice"
  | "questions"
  | "lucky-wheel"
  | "complete";

export type SurveyFlow = "quick" | "full" | "no-games"; // quick: bỏ qua khảo sát, full: làm đầy đủ, no-games: chưa tham gia game nào

export type SurveyProgressStore = {
  // Trạng thái hoàn thành của từng bước
  surveyMode: SurveyMode;
  completedSteps: Set<SurveyStep>;
  currentStep: SurveyStep;
  surveyFlow: SurveyFlow | null; // Luồng được chọn
  spinCount: number; // Số lần được quay (1 cho quick, 2 cho full)

  // Actions
  setSurveyMode: (mode: SurveyMode) => void;
  markStepComplete: (step: SurveyStep) => void;
  setCurrentStep: (step: SurveyStep) => void;
  setSurveyFlow: (flow: SurveyFlow) => void;
  canAccessStep: (step: SurveyStep) => boolean;
  resetProgress: () => void;
  getNextStep: (currentStep: SurveyStep) => SurveyStep | null;
  getPreviousStep: (currentStep: SurveyStep) => SurveyStep | null;
  getSpinCount: () => number;
};

// Định nghĩa thứ tự các bước - sẽ được tính toán dynamic dựa trên flow config
function getStepOrder(): SurveyStep[] {
  const config = getCurrentFlowConfig();
  const baseSteps: SurveyStep[] = ["info"];

  // Thêm các steps theo config
  baseSteps.push("info");

  if (config.requiresOtp) {
    baseSteps.push("otp");
  }

  if (config.requiresCamera) {
    baseSteps.push("camera");
  }

  baseSteps.push("games", "flow-choice", "questions", "lucky-wheel", "complete");

  return baseSteps;
}

// Function để tính toán dependencies dựa trên flow config và survey flow
function getDependencies(step: SurveyStep, surveyFlow: SurveyFlow | null): SurveyStep[] {
  const config = getCurrentFlowConfig();

  // Base dependencies
  const baseDeps: Record<SurveyStep, SurveyStep[]> = {
    "gift-check-phone": [],
    "gift-games": [],
    "gift-lucky-wheel": [],
    info: [],
    otp: ["info"],
    camera: ["info"],
    games: [],
    "flow-choice": [],
    questions: [],
    "lucky-wheel": [],
    complete: [],
  };

  // Tính toán dependencies cho games
  if (config.requiresOtp && config.requiresCamera) {
    baseDeps.games = ["info", "otp", "camera"];
    baseDeps["flow-choice"] = ["info", "otp", "camera", "games"];
  } else if (config.requiresOtp) {
    baseDeps.games = ["info", "otp"];
    baseDeps["flow-choice"] = ["info", "otp", "games"];
  } else if (config.requiresCamera) {
    baseDeps.games = ["info", "camera"];
    baseDeps["flow-choice"] = ["info", "camera", "games"];
  } else {
    baseDeps.games = ["info"];
    baseDeps["flow-choice"] = ["info", "games"];
  }

  // Dependencies cho questions, lucky-wheel, complete dựa trên survey flow
  if (surveyFlow === "no-games") {
    // No-games flow: bắt buộc questions, không có lucky-wheel
    baseDeps.questions = [...baseDeps["flow-choice"]];
    baseDeps["lucky-wheel"] = []; // Không thể truy cập lucky-wheel
    baseDeps.complete = [...baseDeps["flow-choice"], "questions"];
  } else if (surveyFlow === "quick") {
    // Quick flow: bỏ qua questions
    baseDeps.questions = []; // Không cần
    baseDeps["lucky-wheel"] = [...baseDeps["flow-choice"]];
    baseDeps.complete = [...baseDeps["flow-choice"], "lucky-wheel"];
  } else if (surveyFlow === "full") {
    // Full flow: làm đầy đủ
    baseDeps.questions = [...baseDeps["flow-choice"]];
    baseDeps["lucky-wheel"] = [...baseDeps["flow-choice"], "questions"];
    baseDeps.complete = [...baseDeps["flow-choice"], "questions", "lucky-wheel"];
  }

  return baseDeps[step] || [];
}

export const createSurveyProgressStore = (props: {
  defaultStep: SurveyStep;
  storeName: string;
}) => {
  const { defaultStep, storeName } = props;

  return createStore<SurveyProgressStore>()(
    devtools(
      persist(
        (set, get) => ({
          surveyMode: "pg",
          completedSteps: new Set<SurveyStep>(),
          currentStep: defaultStep,
          surveyFlow: null,
          spinCount: 0,

          setSurveyMode: (mode: SurveyMode) => {
            set({ surveyMode: mode });
          },

          markStepComplete: (step: SurveyStep) => {
            set((state) => {
              const newCompletedSteps = new Set(state.completedSteps);
              newCompletedSteps.add(step);
              return {
                completedSteps: newCompletedSteps,
              };
            });
          },

          setCurrentStep: (step: SurveyStep) => {
            set({ currentStep: step });
          },

          setSurveyFlow: (flow: SurveyFlow) => {
            set((state) => ({
              surveyFlow: flow,
              spinCount: flow === "quick" ? 1 : flow === "full" ? 1 : 0,
            }));
          },

          canAccessStep: (step: SurveyStep) => {
            const { completedSteps, surveyFlow } = get();

            // Lấy dependencies dựa trên flow config và survey flow
            const dependencies = getDependencies(step, surveyFlow);

            // Kiểm tra xem tất cả dependencies có được hoàn thành chưa
            return dependencies.every((dep) => completedSteps.has(dep));
          },

          resetProgress: () => {
            set({
              completedSteps: new Set<SurveyStep>(),
              currentStep: defaultStep,
              surveyFlow: null,
              spinCount: 0,
            });
          },

          getSpinCount: () => {
            return get().spinCount;
          },

          getNextStep: (currentStep: SurveyStep) => {
            const stepOrder = getStepOrder();
            const currentIndex = stepOrder.indexOf(currentStep);
            if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
              return null;
            }
            return stepOrder[currentIndex + 1];
          },

          getPreviousStep: (currentStep: SurveyStep) => {
            const stepOrder = getStepOrder();
            const currentIndex = stepOrder.indexOf(currentStep);
            if (currentIndex <= 0) {
              return null;
            }
            return stepOrder[currentIndex - 1];
          },
        }),
        {
          name: storeName,
          partialize: (state) => ({
            completedSteps: Array.from(state.completedSteps), // Convert Set to Array for JSON serialization
            currentStep: state.currentStep,
            surveyFlow: state.surveyFlow,
            spinCount: state.spinCount,
          }),
          onRehydrateStorage: () => (state) => {
            if (state && Array.isArray(state.completedSteps)) {
              // Convert Array back to Set
              state.completedSteps = new Set(state.completedSteps as SurveyStep[]);
            }
          },
        },
      ),
      { name: storeName },
    ),
  );
};
