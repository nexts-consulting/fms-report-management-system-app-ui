'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/kits/components/modal';
import { Button } from '@/kits/components/button';
import { questionBank } from '@/mock/mockQuestion';
import { IQuestion } from '@/types/model';
import { useNotification } from '@/kits/components/notification';
import Image from 'next/image';
interface QuestionFormProps {
  onComplete: () => void;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({ onComplete }) => {
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [passed, setPassed] = useState<boolean | null>(null);
  const notification = useNotification();

  useEffect(() => {
    generateRandomQuestions();
  }, []);

  const generateRandomQuestions = () => {
    const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 5));
    setAnswers({});
    setSubmitted(false);
    setPassed(null);
  };

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (!submitted) {
      setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < 5) {
      notification.error({
        title: "Bài kiểm tra kiến thức",
        description: "Vui lòng trả lời tất cả các câu hỏi.",
        options: {
          duration: 3000,
        },
      });
      return;
    }

    const correctCount = questions.filter(
      (q) => answers[q.id] === q.correctIndex
    ).length;

    const isPassed = correctCount >= 4;
    setSubmitted(true);
    setPassed(isPassed);

    if (isPassed) {
      notification.success({
        title: "Bài kiểm tra kiến thức",
        description: `Bạn đã trả lời đúng ${correctCount}/5. Đủ điều kiện.`,
        options: {
          duration: 3000,
        },
      });
      setTimeout(onComplete, 800);
    } else {
      notification.error({
        title: "Bài kiểm tra kiến thức",
        description: `Bạn chỉ đúng ${correctCount}/5. Vui lòng làm lại.`,
        options: {
          duration: 3000,
        },
      });
    }
  };

  return (
    <Modal isOpen title="Bài kiểm tra kiến thức" closeable={false}>
      {/* Logo */}
      <div className={"flex items-center justify-center mb-4 mt-4"}>
        <Image
          src="/images/Vinamilk_new_logo.webp"
          alt="Vinamilk Logo"
          className="h-[58px] "
          width={180}
          height={54}
        />
      </div>
      <div className="p-4 space-y-6 max-h-[70vh] overflow-auto">
        {questions.map((q, idx) => (
          <div key={q.id} className="border border-gray-300 rounded-md p-4">
            <p className="font-semibold mb-2">
              {idx + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((option: string, i: number) => (
                <label
                  key={i}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer border ${answers[q.id] === i ? 'border-blue-500' : 'border-gray-200'
                    } ${submitted ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={i}
                    disabled={submitted}
                    checked={answers[q.id] === i}
                    onChange={() => handleSelect(q.id, i)}
                    className="accent-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-4">
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
};
