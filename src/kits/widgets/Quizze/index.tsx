import { Button } from "@/kits/components/Button";
import { Heading } from "@/kits/components/Heading";
import { IconButton } from "@/kits/components/IconButton";
import { Icons } from "@/kits/components/Icons";
import { LoadingBar } from "@/kits/components/LoadingBar";
import { StringUtil, StyleUtil } from "@/kits/utils";
import React, { useEffect, useState } from "react";

const constants = {
  INSTANCE_NAME: "Quizze",
  DEFAULT_TIME: 60,
};

export interface Answer {
  id: string;
  text: string | React.ReactNode;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string | React.ReactNode;
  answers: Answer[];
  multipleChoice: boolean;
  requiredAnswers?: number;
}

export interface QuizzeProps {
  timeSeconds?: number;
  onBack?: () => void;
  onEnd?: () => void;
  onContinue?: (answers: string[][]) => void;
  onRetake?: () => void;
  questions?: Question[];
  passCondition?: (totalCorrectAnswers: number, totalQuestions: number) => boolean;
  allowRetake?: boolean;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  skipStarter?: boolean;
}

export const Quizze = (props: QuizzeProps) => {
  const {
    timeSeconds,
    onBack,
    questions = [],
    allowRetake = true,
    passCondition,
    onEnd,
    onContinue,
    onRetake,
    title,
    description,
    skipStarter = false,
  } = props;
  const [timeLeft, setTimeLeft] = useState(Math.max(0, timeSeconds || constants.DEFAULT_TIME));
  const [isStarted, setIsStarted] = useState(skipStarter);
  const [isFinished, setIsFinished] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[][]>([]);

  const [fakeLoading, setFakeLoading] = useState(false);

  const ids = React.useRef({
    container: StringUtil.createElementId(constants.INSTANCE_NAME, "container"),
  });

  const handleRetake = () => {
    onRetake?.();
    setFakeLoading(true);
    setSelectedAnswers([]);
    setTimeout(() => {
      setTimeLeft(Math.max(0, timeSeconds || constants.DEFAULT_TIME));
      setIsStarted(true);
      setIsFinished(false);
      setCurrentQuestionIndex(0);
      setSelectedAnswers([]);
      setFakeLoading(false);
    }, 500);
  };

  const handleContinue = () => {
    onContinue?.(selectedAnswers);
  };

  const handleFinish = () => {
    onEnd?.();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && timeLeft > 0 && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isStarted, timeLeft, isFinished]);

  useEffect(() => {
    if (timeLeft === 0) {
      setIsFinished(true);
    }
  }, [timeLeft]);

  const handleStart = () => {
    setFakeLoading(true);
    setTimeout(() => {
      setIsStarted(true);
      setFakeLoading(false);
    }, 500);
  };

  const handleAnswerSelect = (answerId: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setSelectedAnswers((prev) => {
      const newAnswers = [...prev];
      if (!newAnswers[currentQuestionIndex]) {
        newAnswers[currentQuestionIndex] = [];
      }

      if (currentQuestion.multipleChoice) {
        if (newAnswers[currentQuestionIndex].includes(answerId)) {
          newAnswers[currentQuestionIndex] = newAnswers[currentQuestionIndex].filter(
            (id) => id !== answerId,
          );
        } else {
          newAnswers[currentQuestionIndex] = [...newAnswers[currentQuestionIndex], answerId];
        }
      } else {
        newAnswers[currentQuestionIndex] = [answerId];
      }
      return newAnswers;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div id={ids.current.container} className="min-h-dvh bg-gray-10">
      {/* Header */}
      <Header
        title={title}
        onBack={onBack}
        timeLeft={timeLeft}
        loading={fakeLoading}
        isStarted={isStarted}
        isFinished={isFinished}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
      />

      {/* Body */}
      <div className="p-4">
        {!isStarted && (
          <Starter description={description} onStart={handleStart} loading={fakeLoading} />
        )}
        {isStarted && !isFinished && questions.length > 0 && (
          <Question
            question={questions[currentQuestionIndex]}
            selectedAnswers={selectedAnswers[currentQuestionIndex] || []}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNextQuestion}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
          />
        )}
        {isFinished && (
          <Finished
            questions={questions}
            selectedAnswers={selectedAnswers}
            passCondition={passCondition}
            allowRetake={allowRetake}
            onRetake={handleRetake}
            onContinue={handleContinue}
            onEnd={handleFinish}
          />
        )}
      </div>
    </div>
  );
};

interface HeaderProps {
  onBack?: () => void;
  title?: string | React.ReactNode;
  timeLeft: number;
  loading?: boolean;
  isStarted?: boolean;
  isFinished?: boolean;
  currentQuestionIndex?: number;
  totalQuestions?: number;
}

const Header = (props: HeaderProps) => {
  const {
    onBack,
    title,
    timeLeft,
    loading,
    isStarted,
    isFinished,
    currentQuestionIndex = 0,
    totalQuestions = 0,
  } = props;

  const formatTime = (seconds: number) => {
    if (!seconds || seconds < 0 || isNaN(seconds)) {
      return "0:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={StyleUtil.cn("sticky top-0 z-10 mb-4")}>
      <div className="relative h-[58px] border-b border-b-gray-20 bg-white p-4">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-1/2">
          <IconButton
            icon={Icons.ArrowLeft}
            variant="white"
            size="large"
            onClick={onBack}
            tooltip="Trở lại"
            tooltipPlacement="right"
          />
        </div>
        <Heading as="h1" level="h5" className="line-clamp-1 text-center font-medium">
          {title || "Quizz"}
        </Heading>

        {!isFinished && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="flex items-center gap-1">
              <Icons.Alarm className="text-gray-80" />
              <p className="text-sm font-medium text-gray-80">{formatTime(timeLeft)}</p>
            </div>
          </div>
        )}
      </div>
      {isStarted && !isFinished && totalQuestions > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-[2] translate-y-full">
          <div className="flex h-1 w-full items-center bg-gray-10">
            {Array.from({ length: totalQuestions }).map((_, index) => (
              <div
                key={index}
                className={StyleUtil.cn(
                  "h-full flex-1 transition-all duration-300",
                  index < currentQuestionIndex
                    ? "bg-primary-60"
                    : index === currentQuestionIndex
                      ? "bg-primary-60"
                      : "bg-gray-20",
                )}
              />
            ))}
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 z-[2] translate-y-full">
        <LoadingBar size="medium" active={loading} />
      </div>
    </div>
  );
};

interface StarterProps {
  onStart: () => void;
  loading?: boolean;
  description?: string | React.ReactNode;
}

const Starter = (props: StarterProps) => {
  const { onStart, loading, description } = props;

  return (
    <div className="bg-white p-4">
      {description && <div className="mb-4">{description}</div>}

      <Button
        className="w-full"
        variant="primary"
        size="medium"
        centered
        onClick={onStart}
        disabled={loading}
        loading={loading}
      >
        Bắt đầu
      </Button>
    </div>
  );
};

interface FinishedProps {
  questions: Question[];
  selectedAnswers: string[][];
  passCondition?: (totalCorrectAnswers: number, totalQuestions: number) => boolean;
  allowRetake?: boolean;
  onRetake?: () => void;
  onContinue?: () => void;
  onEnd?: () => void;
}

const Finished = (props: FinishedProps) => {
  const { questions, selectedAnswers, passCondition, allowRetake, onRetake, onContinue, onEnd } =
    props;

  const calculateStats = () => {
    let correctAnswers = 0;
    let totalQuestions = questions.length;

    questions.forEach((question, index) => {
      const userAnswers = selectedAnswers[index] || [];
      const correctAnswerIds = question.answers
        .filter((answer) => answer.isCorrect)
        .map((answer) => answer.id);

      if (question.multipleChoice) {
        const isCorrect =
          correctAnswerIds.length === userAnswers.length &&
          correctAnswerIds.every((id) => userAnswers.includes(id));
        if (isCorrect) correctAnswers++;
      } else {
        if (userAnswers[0] && correctAnswerIds.includes(userAnswers[0])) {
          correctAnswers++;
        }
      }
    });

    const isPassed = passCondition ? passCondition(correctAnswers, totalQuestions) : false;

    return {
      correctAnswers,
      totalQuestions,
      percentage: Math.round((correctAnswers / totalQuestions) * 100),
      isPassed,
    };
  };

  const stats = calculateStats();

  return (
    <div className="bg-white p-4">
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-xl font-medium">Kết quả của bạn</h2>
        <div className="text-4xl font-bold text-primary-60">{stats.percentage}%</div>
        {stats.isPassed ? (
          <p className="mt-2 text-sm text-green-50">Chúc mừng! Bạn đã hoàn thành bài kiểm tra.</p>
        ) : (
          <p className="mt-2 text-sm text-red-50">Rất tiếc! Bạn chưa đạt yêu cầu.</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-gray-10 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-80">Số câu trả lời đúng</span>
            <span className="text-sm font-medium text-primary-60">
              {stats.correctAnswers}/{stats.totalQuestions}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden bg-gray-20">
            <div
              className="h-full bg-primary-60 transition-all duration-500"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>

        <div className="border border-gray-20 p-4">
          <ul className="space-y-2">
            <li className="flex items-center justify-between text-sm">
              <span className="text-gray-80">Tổng số câu hỏi</span>
              <span className="font-medium">{stats.totalQuestions}</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="text-gray-80">Số câu trả lời đúng</span>
              <span className="font-medium text-green-50">{stats.correctAnswers}</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="text-gray-80">Số câu trả lời sai</span>
              <span className="font-medium text-red-50">
                {stats.totalQuestions - stats.correctAnswers}
              </span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          {stats.isPassed ? (
            <Button
              className="w-full"
              variant="primary"
              size="medium"
              centered
              onClick={onContinue}
            >
              Tiếp tục
            </Button>
          ) : (
            <>
              {allowRetake && (
                <Button
                  className="w-full"
                  variant="primary"
                  size="medium"
                  centered
                  onClick={onRetake}
                >
                  Thử lại
                </Button>
              )}
              <Button className="w-full" variant="secondary" size="medium" centered onClick={onEnd}>
                Kết thúc
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface QuestionProps {
  question: Question;
  selectedAnswers: string[];
  onAnswerSelect: (answerId: string) => void;
  onNext: () => void;
  currentQuestionIndex: number;
  totalQuestions: number;
}

const Question = (props: QuestionProps) => {
  const {
    question,
    selectedAnswers,
    onAnswerSelect,
    onNext,
    currentQuestionIndex,
    totalQuestions,
  } = props;
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Reset hasAnswered when question changes
  useEffect(() => {
    setHasAnswered(false);
  }, [question.id]);

  const handleAnswerClick = (answerId: string) => {
    if (hasAnswered) return;

    // Kiểm tra nếu đã chọn đủ số câu trả lời yêu cầu và câu trả lời chưa được chọn
    if (
      question.multipleChoice &&
      question.requiredAnswers &&
      selectedAnswers.length >= question.requiredAnswers &&
      !selectedAnswers.includes(answerId)
    ) {
      return;
    }

    onAnswerSelect(answerId);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswers.length === 0) return;

    // Kiểm tra nếu là câu hỏi multiple choice và chưa chọn đủ số câu trả lời yêu cầu
    if (
      question.multipleChoice &&
      question.requiredAnswers &&
      selectedAnswers.length !== question.requiredAnswers
    ) {
      return;
    }

    setIsChecking(true);
    setTimeout(() => {
      setHasAnswered(true);
      setIsChecking(false);
    }, 200);
  };

  const getAnswerStyle = (answer: Answer) => {
    if (!hasAnswered) {
      if (selectedAnswers.includes(answer.id)) {
        return "border-primary-50 bg-primary-50/10";
      }
      // Nếu đã chọn đủ số câu trả lời yêu cầu, disable các câu trả lời chưa chọn
      if (
        question.multipleChoice &&
        question.requiredAnswers &&
        selectedAnswers.length >= question.requiredAnswers
      ) {
        return "border-gray-30 opacity-50 cursor-not-allowed";
      }
      return "border-gray-30 hover:border-primary-60";
    }

    if (selectedAnswers.includes(answer.id)) {
      return answer.isCorrect
        ? "border-green-50 bg-green-50/10 animate-fade-in"
        : "border-red-50 bg-red-50/10 animate-fade-in";
    }
    return "border-gray-30";
  };

  const getAnswerIcon = (answer: Answer) => {
    if (!hasAnswered) {
      return selectedAnswers.includes(answer.id) ? (
        <Icons.CheckboxCheckedFilled className="h-5 w-5 shrink-0 text-primary-60" />
      ) : (
        <Icons.Checkbox className="h-5 w-5 shrink-0 text-gray-30" />
      );
    }

    if (selectedAnswers.includes(answer.id)) {
      return answer.isCorrect ? (
        <Icons.CheckboxCheckedFilled className="h-5 w-5 shrink-0 text-green-50" />
      ) : (
        <Icons.CheckboxIndeterminate className="h-5 w-5 shrink-0 text-red-50" />
      );
    }
    return <Icons.Checkbox className="h-5 w-5 shrink-0 text-gray-30" />;
  };

  return (
    <div className="bg-white p-4">
      <div className="mb-2 text-sm font-medium text-primary-50">
        Câu hỏi {currentQuestionIndex + 1}/{totalQuestions}
      </div>
      <h2 className="mb-4 text-base font-medium">
        {question.text}{" "}
        <span className="text-sm font-normal text-gray-50">
          ({question.multipleChoice ? `Chọn ${question.requiredAnswers || "nhiều"}` : "Chọn 1"})
        </span>
      </h2>
      <div className="space-y-2">
        {question.answers.map((answer) => (
          <div
            key={answer.id}
            className={StyleUtil.cn(
              "cursor-pointer border p-3 transition-all duration-300",
              getAnswerStyle(answer),
            )}
            onClick={() => handleAnswerClick(answer.id)}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm">{answer.text}</p>
              {getAnswerIcon(answer)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {!hasAnswered ? (
          <>
            <Button
              className="w-full"
              variant="primary"
              size="medium"
              centered
              onClick={handleCheckAnswer}
              disabled={Boolean(
                selectedAnswers.length === 0 ||
                  (question.multipleChoice &&
                    question.requiredAnswers &&
                    selectedAnswers.length !== question.requiredAnswers),
              )}
              loading={isChecking}
            >
              Xác nhận{" "}
              {question.multipleChoice &&
                question.requiredAnswers &&
                `(${selectedAnswers.length}/${question.requiredAnswers})`}
            </Button>
          </>
        ) : (
          <Button
            className="animate-fade-in w-full"
            variant="secondary"
            size="medium"
            centered
            onClick={onNext}
          >
            Tiếp tục
          </Button>
        )}
      </div>
    </div>
  );
};
