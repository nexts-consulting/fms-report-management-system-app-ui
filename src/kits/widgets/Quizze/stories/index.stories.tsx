import { Meta, StoryFn } from "@storybook/react";
import { Quizze, QuizzeProps, Question } from "..";
import { CommonUtil } from "@/kits/utils";
import { useState } from "react";

export default {
  title: "Widgets/Quizze",
  component: Quizze,
} as Meta;

const Template: StoryFn<QuizzeProps> = (args) => <Quizze {...args} />;

// Question vault
const questionVault: Question[] = [
  {
    id: "1",
    text: "Câu hỏi 1: Đâu là thủ đô của Việt Nam?",
    multipleChoice: false,
    answers: [
      { id: "1-1", text: "A. Hà Nội", isCorrect: true },
      { id: "1-2", text: "B. Hồ Chí Minh", isCorrect: false },
      { id: "1-3", text: "C. Đà Nẵng", isCorrect: false },
      { id: "1-4", text: "D. Cần Thơ", isCorrect: false },
    ],
  },
  {
    id: "2",
    text: "Câu hỏi 2: Đâu là sông dài nhất Việt Nam?",
    multipleChoice: false,
    answers: [
      { id: "2-1", text: "A. Sông Hồng", isCorrect: false },
      { id: "2-2", text: "B. Sông Mekong", isCorrect: true },
      { id: "2-3", text: "C. Sông Đồng Nai", isCorrect: false },
      { id: "2-4", text: "D. Sông Hương", isCorrect: false },
    ],
  },
  {
    id: "3",
    text: "Câu hỏi 3: Chọn các tỉnh/thành phố thuộc miền Trung:",
    multipleChoice: true,
    requiredAnswers: 3,
    answers: [
      { id: "3-1", text: "A. Đà Nẵng", isCorrect: true },
      { id: "3-2", text: "B. Huế", isCorrect: true },
      { id: "3-3", text: "C. Nha Trang", isCorrect: true },
      { id: "3-4", text: "D. Hải Phòng", isCorrect: false },
    ],
  },
  {
    id: "4",
    text: "Câu hỏi 4: Đâu là biểu tượng của Việt Nam?",
    multipleChoice: true,
    requiredAnswers: 2,
    answers: [
      { id: "4-1", text: "A. Hoa sen", isCorrect: true },
      { id: "4-2", text: "B. Rồng", isCorrect: true },
      { id: "4-3", text: "C. Hổ", isCorrect: false },
      { id: "4-4", text: "D. Đại bàng", isCorrect: false },
    ],
  },
  {
    id: "5",
    text: "Câu hỏi 5: Chọn các món ăn đặc sản Việt Nam:",
    multipleChoice: true,
    requiredAnswers: 3,
    answers: [
      { id: "5-1", text: "A. Phở", isCorrect: true },
      { id: "5-2", text: "B. Bún chả", isCorrect: true },
      { id: "5-3", text: "C. Bánh mì", isCorrect: true },
      { id: "5-4", text: "D. Hamburger", isCorrect: false },
    ],
  },
];

export const Default = Template.bind({});
Default.args = {};

export const MultipleChoiceQuestion = Template.bind({});
MultipleChoiceQuestion.args = {
  timeSeconds: 120,
  onBack: () => console.log("Back clicked"),
  questions: [
    {
      id: "1",
      text: "Chọn các ngôn ngữ lập trình phổ biến:",
      multipleChoice: true,
      requiredAnswers: 3,
      answers: [
        { id: "1-1", text: "JavaScript", isCorrect: true },
        { id: "1-2", text: "Python", isCorrect: true },
        { id: "1-3", text: "Java", isCorrect: true },
        { id: "1-4", text: "HTML", isCorrect: false },
      ],
    },
    {
      id: "2",
      text: "Chọn các framework JavaScript phổ biến:",
      multipleChoice: true,
      requiredAnswers: 3,
      answers: [
        { id: "2-1", text: "React", isCorrect: true },
        { id: "2-2", text: "Vue", isCorrect: true },
        { id: "2-3", text: "Angular", isCorrect: true },
        { id: "2-4", text: "jQuery", isCorrect: false },
      ],
    },
  ],
};

export const SimilacQuestions = Template.bind({});
SimilacQuestions.args = {
  onBack: () => console.log("Back clicked"),
  timeSeconds: 120,
  allowRetake: true,
  passCondition: (totalCorrectAnswers) => {
    return totalCorrectAnswers === 3;
  },
  title: "Similac Quizz",
  description: (
    <ul className="mb-4 ml-6 list-disc">
      <li className="text-sm text-gray-80">Bạn có 2 phút để trả lời các câu hỏi.</li>
      <li className="text-sm text-gray-80">
        Trả lời đúng <span className="font-medium text-primary-60">3/4</span> câu hỏi để tiếp tục
      </li>
    </ul>
  ),
  questions: [
    {
      id: "1",
      text: "Similac Total Protection 2+ phù hợp cho nhóm trẻ nào?",
      multipleChoice: false,
      answers: [
        { id: "1-1", text: "A. Trẻ bị dị ứng đạm sữa bò", isCorrect: false },
        {
          id: "1-2",
          text: "B. Trẻ sinh thường, cần hệ miễn dịch - tiêu hóa khỏe",
          isCorrect: false,
        },
        { id: "1-3", text: "C. Trẻ sinh thường, cần phát triển trí não từ nhỏ", isCorrect: false },
        { id: "1-4", text: "D. Trẻ sinh mổ có hệ miễn dịch yếu và trẻ hay bệnh", isCorrect: true },
      ],
    },
    {
      id: "2",
      text: "Similac có các dòng sản phẩm sữa cho trẻ ở độ tuổi nào?",
      multipleChoice: false,
      answers: [
        {
          id: "2-1",
          text: "A. Similac có các dòng sản phẩm cho trẻ từ 1-6 tuổi",
          isCorrect: false,
        },
        {
          id: "2-2",
          text: "B. Mỗi sản phẩm của nhãn hiệu Similac phù hợp với trẻ từ 2-4 tuổi",
          isCorrect: false,
        },
        {
          id: "2-3",
          text: "C. Mỗi sản phẩm của nhãn hiệu Similac có những lợi điểm riêng phù hợp với từng nhu cầu và giai đoạn phát triển của trẻ từ 0-6 tuổi",
          isCorrect: true,
        },
        {
          id: "2-4",
          text: "D. Mỗi sản phẩm của nhãn hiệu Similac có những lợi điểm riêng phù hợp với từng nhu cầu và giai đoạn phát triển của trẻ từ 0-2 tuổi",
          isCorrect: false,
        },
      ],
    },
    {
      id: "3",
      text: "03 câu hỏi vàng giúp khám phá nhu cầu khách hàng là gì?",
      multipleChoice: true,
      requiredAnswers: 3,
      answers: [
        { id: "3-1", text: "A. Độ tuổi & cân nặng của bé", isCorrect: true },
        { id: "3-2", text: "B. Bé sinh mổ hay sinh thường", isCorrect: true },
        { id: "3-3", text: "C. Tài chính của mẹ được bao nhiêu", isCorrect: false },
        { id: "3-4", text: "D. Bé đang dùng sữa gì, mẹ có hài lòng không", isCorrect: true },
      ],
    },
  ],
};

export const NoRetake = Template.bind({});
NoRetake.args = {
  timeSeconds: 120,
  onBack: () => console.log("Back clicked"),
  allowRetake: false,
  questions: [
    {
      id: "1",
      text: "Câu hỏi 1",
      multipleChoice: false,
      answers: [
        { id: "1-1", text: "Đáp án A", isCorrect: true },
        { id: "1-2", text: "Đáp án B", isCorrect: false },
        { id: "1-3", text: "Đáp án C", isCorrect: false },
        { id: "1-4", text: "Đáp án D", isCorrect: false },
      ],
    },
    {
      id: "2",
      text: "Câu hỏi 2",
      multipleChoice: false,
      answers: [
        { id: "2-1", text: "Đáp án A", isCorrect: false },
        { id: "2-2", text: "Đáp án B", isCorrect: true },
        { id: "2-3", text: "Đáp án C", isCorrect: false },
        { id: "2-4", text: "Đáp án D", isCorrect: false },
      ],
    },
  ],
};

export const WithPassCondition = Template.bind({});
WithPassCondition.args = {
  timeSeconds: 120,
  onBack: () => console.log("Back clicked"),
  allowRetake: true,
  passCondition: (totalCorrectAnswers, totalQuestions) => {
    // Yêu cầu đúng ít nhất 80% số câu hỏi
    return totalCorrectAnswers / totalQuestions >= 0.8;
  },
  questions: [
    {
      id: "1",
      text: "Câu hỏi 1",
      multipleChoice: false,
      answers: [
        { id: "1-1", text: "Đáp án A", isCorrect: true },
        { id: "1-2", text: "Đáp án B", isCorrect: false },
        { id: "1-3", text: "Đáp án C", isCorrect: false },
        { id: "1-4", text: "Đáp án D", isCorrect: false },
      ],
    },
    {
      id: "2",
      text: "Câu hỏi 2",
      multipleChoice: false,
      answers: [
        { id: "2-1", text: "Đáp án A", isCorrect: false },
        { id: "2-2", text: "Đáp án B", isCorrect: true },
        { id: "2-3", text: "Đáp án C", isCorrect: false },
        { id: "2-4", text: "Đáp án D", isCorrect: false },
      ],
    },
    {
      id: "3",
      text: "Câu hỏi 3",
      multipleChoice: false,
      answers: [
        { id: "3-1", text: "Đáp án A", isCorrect: false },
        { id: "3-2", text: "Đáp án B", isCorrect: false },
        { id: "3-3", text: "Đáp án C", isCorrect: true },
        { id: "3-4", text: "Đáp án D", isCorrect: false },
      ],
    },
    {
      id: "4",
      text: "Câu hỏi 4",
      multipleChoice: false,
      answers: [
        { id: "4-1", text: "Đáp án A", isCorrect: false },
        { id: "4-2", text: "Đáp án B", isCorrect: false },
        { id: "4-3", text: "Đáp án C", isCorrect: false },
        { id: "4-4", text: "Đáp án D", isCorrect: true },
      ],
    },
    {
      id: "5",
      text: "Câu hỏi 5",
      multipleChoice: false,
      answers: [
        { id: "5-1", text: "Đáp án A", isCorrect: true },
        { id: "5-2", text: "Đáp án B", isCorrect: false },
        { id: "5-3", text: "Đáp án C", isCorrect: false },
        { id: "5-4", text: "Đáp án D", isCorrect: false },
      ],
    },
  ],
};

export const StrictPassCondition = Template.bind({});
StrictPassCondition.args = {
  timeSeconds: 120,
  onBack: () => console.log("Back clicked"),
  allowRetake: true,
  passCondition: (totalCorrectAnswers, totalQuestions) => {
    // Yêu cầu đúng tất cả câu hỏi
    return totalCorrectAnswers === totalQuestions;
  },
  questions: [
    {
      id: "1",
      text: "Câu hỏi 1",
      multipleChoice: false,
      answers: [
        { id: "1-1", text: "Đáp án A", isCorrect: true },
        { id: "1-2", text: "Đáp án B", isCorrect: false },
        { id: "1-3", text: "Đáp án C", isCorrect: false },
        { id: "1-4", text: "Đáp án D", isCorrect: false },
      ],
    },
    {
      id: "2",
      text: "Câu hỏi 2",
      multipleChoice: false,
      answers: [
        { id: "2-1", text: "Đáp án A", isCorrect: false },
        { id: "2-2", text: "Đáp án B", isCorrect: true },
        { id: "2-3", text: "Đáp án C", isCorrect: false },
        { id: "2-4", text: "Đáp án D", isCorrect: false },
      ],
    },
  ],
};

const RandomQuestionsTemplate: StoryFn<QuizzeProps> = (args) => {
  const [questions, setQuestions] = useState(() => CommonUtil.getRandomItems(questionVault, 3));

  const handleRetake = () => {
    setQuestions(CommonUtil.getRandomItems(questionVault, 3));
  };

  return <Quizze {...args} questions={questions} onRetake={handleRetake} />;
};

export const RandomQuestions = RandomQuestionsTemplate.bind({});
RandomQuestions.args = {
  timeSeconds: 120,
  onBack: () => console.log("Back clicked"),
  allowRetake: true,
  passCondition: (totalCorrectAnswers, totalQuestions) => {
    return totalCorrectAnswers >= Math.ceil(totalQuestions * 0.7); // Yêu cầu đúng 70%
  },
  onEnd: () => console.log("Quiz ended"),
  onContinue: () => console.log("Quiz continued"),
};

export const StressTest = Template.bind({});
StressTest.args = {
  timeSeconds: 300, // 5 phút cho nhiều câu hỏi
  onBack: () => console.log("Back clicked"),
  allowRetake: true,
  passCondition: (totalCorrectAnswers, totalQuestions) => {
    return totalCorrectAnswers >= Math.ceil(totalQuestions * 0.6); // Yêu cầu đúng 60%
  },
  questions: [
    // Câu hỏi với text dài
    {
      id: "1",
      text: "Đây là một câu hỏi có text rất dài để test khả năng hiển thị của component. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      multipleChoice: false,
      answers: [
        {
          id: "1-1",
          text: "A. Đây là đáp án A với text dài để test khả năng hiển thị của component (true)",
          isCorrect: true,
        },
        {
          id: "1-2",
          text: "B. Đây là đáp án B với text dài để test khả năng hiển thị của component",
          isCorrect: false,
        },
        {
          id: "1-3",
          text: "C. Đây là đáp án C với text dài để test khả năng hiển thị của component",
          isCorrect: false,
        },
        {
          id: "1-4",
          text: "D. Đây là đáp án D với text dài để test khả năng hiển thị của component",
          isCorrect: false,
        },
      ],
    },
    // Câu hỏi multiple choice với nhiều đáp án đúng
    {
      id: "2",
      text: "Chọn các ngôn ngữ lập trình phổ biến:",
      multipleChoice: true,
      requiredAnswers: 4,
      answers: [
        { id: "2-1", text: "A. JavaScript", isCorrect: true },
        { id: "2-2", text: "B. Python", isCorrect: true },
        { id: "2-3", text: "C. Java", isCorrect: true },
        { id: "2-4", text: "D. C++", isCorrect: true },
        { id: "2-5", text: "E. PHP", isCorrect: false },
        { id: "2-6", text: "F. Ruby", isCorrect: false },
      ],
    },
    // Câu hỏi với nhiều đáp án
    {
      id: "3",
      text: "Chọn các framework JavaScript phổ biến:",
      multipleChoice: true,
      requiredAnswers: 3,
      answers: [
        { id: "3-1", text: "A. React", isCorrect: true },
        { id: "3-2", text: "B. Vue", isCorrect: true },
        { id: "3-3", text: "C. Angular", isCorrect: true },
        { id: "3-4", text: "D. Svelte", isCorrect: false },
        { id: "3-5", text: "E. Next.js", isCorrect: false },
        { id: "3-6", text: "F. Nuxt.js", isCorrect: false },
        { id: "3-7", text: "G. Gatsby", isCorrect: false },
        { id: "3-8", text: "H. Remix", isCorrect: false },
      ],
    },
    // Câu hỏi với text ngắn
    {
      id: "4",
      text: "1 + 1 = ?",
      multipleChoice: false,
      answers: [
        { id: "4-1", text: "A. 1", isCorrect: false },
        { id: "4-2", text: "B. 2", isCorrect: true },
        { id: "4-3", text: "C. 3", isCorrect: false },
        { id: "4-4", text: "D. 4", isCorrect: false },
      ],
    },
    // Câu hỏi với text đặc biệt
    {
      id: "5",
      text: "Chọn các ký tự đặc biệt: @#$%^&*()",
      multipleChoice: true,
      requiredAnswers: 2,
      answers: [
        { id: "5-1", text: "A. @#$", isCorrect: true },
        { id: "5-2", text: "B. %^&", isCorrect: true },
        { id: "5-3", text: "C. *()", isCorrect: false },
        { id: "5-4", text: "D. !~`", isCorrect: false },
      ],
    },
    // Câu hỏi với emoji
    {
      id: "6",
      text: "Chọn các emoji phổ biến: 😀 🎉 🚀 💻",
      multipleChoice: true,
      requiredAnswers: 3,
      answers: [
        { id: "6-1", text: "A. 😀", isCorrect: true },
        { id: "6-2", text: "B. 🎉", isCorrect: true },
        { id: "6-3", text: "C. 🚀", isCorrect: true },
        { id: "6-4", text: "D. 💻", isCorrect: false },
      ],
    },
    // Câu hỏi với HTML
    {
      id: "7",
      text: "Chọn các thẻ HTML phổ biến:",
      multipleChoice: true,
      requiredAnswers: 3,
      answers: [
        { id: "7-1", text: "A. <div>", isCorrect: true },
        { id: "7-2", text: "B. <span>", isCorrect: true },
        { id: "7-3", text: "C. <p>", isCorrect: true },
        { id: "7-4", text: "D. <table>", isCorrect: false },
      ],
    },
    // Câu hỏi với code
    {
      id: "8",
      text: "Chọn các đoạn code JavaScript hợp lệ:",
      multipleChoice: true,
      requiredAnswers: 2,
      answers: [
        { id: "8-1", text: "A. const x = 1;", isCorrect: true },
        { id: "8-2", text: "B. let y = 2;", isCorrect: true },
        { id: "8-3", text: "C. var z = 3;", isCorrect: false },
        { id: "8-4", text: "D. int w = 4;", isCorrect: false },
      ],
    },
    // Câu hỏi với số
    {
      id: "9",
      text: "Chọn các số nguyên tố:",
      multipleChoice: true,
      requiredAnswers: 3,
      answers: [
        { id: "9-1", text: "A. 2", isCorrect: true },
        { id: "9-2", text: "B. 3", isCorrect: true },
        { id: "9-3", text: "C. 5", isCorrect: true },
        { id: "9-4", text: "D. 4", isCorrect: false },
      ],
    },
    // Câu hỏi với text tiếng Việt
    {
      id: "10",
      text: "Chọn các từ tiếng Việt có dấu:",
      multipleChoice: true,
      requiredAnswers: 3,
      answers: [
        { id: "10-1", text: "A. Việt Nam", isCorrect: true },
        { id: "10-2", text: "B. Hà Nội", isCorrect: true },
        { id: "10-3", text: "C. Sài Gòn", isCorrect: true },
        { id: "10-4", text: "D. Da Nang", isCorrect: false },
      ],
    },
  ],
  onEnd: () => console.log("Quiz ended"),
  onContinue: (answers) => console.log("Quiz continued with answers:", answers),
  onRetake: () => console.log("Quiz retake"),
};
