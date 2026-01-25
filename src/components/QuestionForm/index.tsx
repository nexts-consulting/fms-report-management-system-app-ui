"use client";

import React from "react";
import Image from "next/image";

import { Button } from "@/kits/components/button";
import { Modal } from "@/kits/components/modal";
import { useNotification } from "@/kits/components/notification";
import { StyleUtil } from "@/kits/utils";

import { questionBank } from "@/mock/mockQuestion";
import { IQuestion } from "@/types/model";

const constants = {
  INSTANCE_NAME: "QuestionForm",
  QUESTION_COUNT: 5,
  PASSING_SCORE: 4,
  NOTIFICATION_DURATION: 3000,
  COMPLETE_DELAY: 800,
} as const;

const styles = {
  logoContainer: StyleUtil.cn("flex items-center justify-center mb-4 mt-4"),
  container: StyleUtil.cn("p-4 space-y-6 max-h-[70vh] overflow-auto"),
  questionCard: StyleUtil.cn("border border-gray-300 rounded-md p-4"),
  questionText: StyleUtil.cn("font-semibold mb-2"),
  optionsContainer: StyleUtil.cn("space-y-2"),
  optionLabel: (isSelected: boolean, isSubmitted: boolean) =>
    StyleUtil.cn(
      "flex items-center space-x-2 p-2 rounded cursor-pointer border",
      {
        "border-blue-500": isSelected,
        "border-gray-200": !isSelected,
        "cursor-not-allowed opacity-70": isSubmitted,
      }
    ),
  optionInput: StyleUtil.cn("accent-blue-600"),
  actionsContainer: StyleUtil.cn("flex justify-end pt-4"),
} as const;

interface QuestionFormProps {
  /** Callback khi hoàn thành bài test */
  onComplete: () => void;
  /** Logo URL (optional, mặc định dùng Vinamilk logo) */
  logoUrl?: string;
  /** Số câu hỏi cần trả lời */
  questionCount?: number;
  /** Số câu đúng tối thiểu để pass */
  passingScore?: number;
}

export const QuestionForm = React.memo((props: QuestionFormProps) => {
  const {
    onComplete,
    logoUrl = "/images/Vinamilk_new_logo.webp",
    questionCount = constants.QUESTION_COUNT,
    passingScore = constants.PASSING_SCORE,
  } = props;

  const notification = useNotification();

  const [questions, setQuestions] = React.useState<IQuestion[]>([]);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [passed, setPassed] = React.useState<boolean | null>(null);

  const generateRandomQuestions = React.useCallback(() => {
    const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, questionCount));
    setAnswers({});
    setSubmitted(false);
    setPassed(null);
  }, [questionCount]);

  React.useEffect(() => {
    generateRandomQuestions();
  }, [generateRandomQuestions]);

  const handleSelect = React.useCallback(
    (questionId: string, optionIndex: number) => {
      if (!submitted) {
        setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
      }
    },
    [submitted]
  );

  const handleSubmit = React.useCallback(() => {
    if (Object.keys(answers).length < questionCount) {
      notification.error({
        title: "Bài kiểm tra kiến thức",
        description: "Vui lòng trả lời tất cả các câu hỏi.",
        options: {
          duration: constants.NOTIFICATION_DURATION,
        },
      });
      return;
    }

    const correctCount = questions.filter(
      (q) => answers[q.id] === q.correctIndex
    ).length;

    const isPassed = correctCount >= passingScore;
    setSubmitted(true);
    setPassed(isPassed);

    if (isPassed) {
      notification.success({
        title: "Bài kiểm tra kiến thức",
        description: `Bạn đã trả lời đúng ${correctCount}/${questionCount}. Đủ điều kiện.`,
        options: {
          duration: constants.NOTIFICATION_DURATION,
        },
      });
      setTimeout(onComplete, constants.COMPLETE_DELAY);
    } else {
      notification.error({
        title: "Bài kiểm tra kiến thức",
        description: `Bạn chỉ đúng ${correctCount}/${questionCount}. Vui lòng làm lại.`,
        options: {
          duration: constants.NOTIFICATION_DURATION,
        },
      });
    }
  }, [answers, questions, questionCount, passingScore, notification, onComplete]);

  return (
    <Modal isOpen title="Bài kiểm tra kiến thức" closeable={false}>
      {/* Logo */}
      <div className={styles.logoContainer}>
        <Image
          src={logoUrl}
          alt="Logo"
          className="h-[58px]"
          width={180}
          height={54}
        />
      </div>

      <div className={styles.container}>
        {questions.map((q, idx) => (
          <div key={q.id} className={styles.questionCard}>
            <p className={styles.questionText}>
              {idx + 1}. {q.question}
            </p>
            <div className={styles.optionsContainer}>
              {q.options.map((option: string, i: number) => (
                <label
                  key={i}
                  className={styles.optionLabel(answers[q.id] === i, submitted)}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={i}
                    disabled={submitted}
                    checked={answers[q.id] === i}
                    onChange={() => handleSelect(q.id, i)}
                    className={styles.optionInput}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className={styles.actionsContainer}>
          {!passed && submitted && (
            <Button variant="secondary" onClick={generateRandomQuestions}>
              Làm lại
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={submitted && passed === true}>
            Nộp bài
          </Button>
        </div>
      </div>
    </Modal>
  );
});

QuestionForm.displayName = constants.INSTANCE_NAME;
