import { Manual, Quiz, Question } from './types';

const safetyQuestions = [
  {
    text: "What is the correct procedure when entering a confined space?",
    options: [
      { text: "Enter immediately and assess hazards", isCorrect: false },
      { text: "Complete a confined space permit and atmospheric testing", isCorrect: true },
      { text: "Ask a coworker to watch while you enter", isCorrect: false },
    ],
  },
  {
    text: "When should you wear Personal Protective Equipment (PPE)?",
    options: [
      { text: "Only when supervisor is present", isCorrect: false },
      { text: "When hazards are identified that require PPE use", isCorrect: true },
      { text: "Only during emergency situations", isCorrect: false },
    ],
  },
  {
    text: "What is the first step in the Lockout/Tagout procedure?",
    options: [
      { text: "Apply the lockout device", isCorrect: false },
      { text: "Notify affected employees", isCorrect: true },
      { text: "Turn off the equipment", isCorrect: false },
    ],
  },
  {
    text: "How should you report a workplace hazard?",
    options: [
      { text: "Wait until the next safety meeting", isCorrect: false },
      { text: "Only report if someone gets injured", isCorrect: false },
      { text: "Report immediately to your supervisor", isCorrect: true },
    ],
  },
  {
    text: "What is the purpose of a Safety Data Sheet (SDS)?",
    options: [
      { text: "To provide information about chemical hazards and safe handling", isCorrect: true },
      { text: "To track inventory levels", isCorrect: false },
      { text: "To record employee training", isCorrect: false },
    ],
  },
  {
    text: "What should you do before lifting a heavy object?",
    options: [
      { text: "Lift quickly to minimize strain", isCorrect: false },
      { text: "Assess the weight and plan your lift path", isCorrect: true },
      { text: "Ask someone to help without assessing first", isCorrect: false },
    ],
  },
  {
    text: "When is it appropriate to bypass a safety guard on machinery?",
    options: [
      { text: "When working alone to speed up the process", isCorrect: false },
      { text: "Never - guards must remain in place during operation", isCorrect: true },
      { text: "When the guard is inconvenient", isCorrect: false },
    ],
  },
  {
    text: "What is the correct response to a fire alarm?",
    options: [
      { text: "Continue working until you see flames", isCorrect: false },
      { text: "Evacuate using designated routes immediately", isCorrect: true },
      { text: "Investigate the source of the alarm", isCorrect: false },
    ],
  },
];

export const generateMockQuestion = (index: number, prefix: string): Question => {
  const questionData = safetyQuestions[index % safetyQuestions.length];
  const timestamp = Date.now();
  return {
    id: `q-${timestamp}-${index}`,
    text: questionData.text,
    options: questionData.options.map((opt, optIndex) => ({
      id: `opt-${timestamp}-${index}-${optIndex}`,
      text: opt.text,
      isCorrect: opt.isCorrect,
    })),
    failureVideoUrl: `https://example.com/videos/failure-${prefix}-${index}.mp4`,
    successVideoUrl: `https://example.com/videos/success-${prefix}-${index}.mp4`,
  };
};

const generateMockQuestions = (count: number, quizIndex: number): Question[] => {
  return Array.from({ length: count }, (_, i) => {
    const questionData = safetyQuestions[(quizIndex * count + i) % safetyQuestions.length];
    return {
      id: `q-${quizIndex}-${i}`,
      text: questionData.text,
      options: questionData.options.map((opt, optIndex) => ({
        id: `opt-${quizIndex}-${i}-${optIndex}`,
        text: opt.text,
        isCorrect: opt.isCorrect,
      })),
      failureVideoUrl: `https://example.com/videos/failure-${quizIndex}-${i}.mp4`,
      successVideoUrl: `https://example.com/videos/success-${quizIndex}-${i}.mp4`,
    };
  });
};

export const generateMockQuizzes = (numQuizzes: number, questionsPerQuiz: number, manualName: string): Quiz[] => {
  return Array.from({ length: numQuizzes }, (_, i) => ({
    id: `quiz-${Date.now()}-${i}`,
    name: `${manualName} - Quiz ${i + 1}`,
    questions: generateMockQuestions(questionsPerQuiz, i),
  }));
};

export const mockManuals: Manual[] = [
  {
    id: 'manual-1',
    name: 'Workplace Safety Guidelines',
    filename: 'workplace_safety_2024.pdf',
    uploadedAt: '2024-01-15T10:30:00Z',
    quizzes: [
      {
        id: 'quiz-1',
        name: 'Basic Safety Awareness',
        questions: generateMockQuestions(5, 0),
      },
      {
        id: 'quiz-2',
        name: 'Emergency Procedures',
        questions: generateMockQuestions(5, 1),
      },
    ],
  },
  {
    id: 'manual-2',
    name: 'Chemical Handling Procedures',
    filename: 'chemical_handling_v3.pdf',
    uploadedAt: '2024-02-20T14:45:00Z',
    quizzes: [
      {
        id: 'quiz-3',
        name: 'Chemical Safety Basics',
        questions: generateMockQuestions(8, 2),
      },
    ],
  },
  {
    id: 'manual-3',
    name: 'Equipment Operation Manual',
    filename: 'equipment_ops_guide.pdf',
    uploadedAt: '2024-03-10T09:15:00Z',
    quizzes: [],
  },
];
