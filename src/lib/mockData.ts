import { Manual, Quiz, Question } from './types';

const safetyQuestions = [
  {
    question: "What is the correct procedure when entering a confined space?",
    options: [
      "Enter immediately and assess hazards",
      "Complete a confined space permit and atmospheric testing",
      "Ask a coworker to watch while you enter",
    ],
    correct_answer_index: 1,
    common_pitfall_index: 0,
  },
  {
    question: "When should you wear Personal Protective Equipment (PPE)?",
    options: [
      "Only when supervisor is present",
      "When hazards are identified that require PPE use",
      "Only during emergency situations",
    ],
    correct_answer_index: 1,
    common_pitfall_index: 0,
  },
  {
    question: "What is the first step in the Lockout/Tagout procedure?",
    options: [
      "Apply the lockout device",
      "Notify affected employees",
      "Turn off the equipment",
    ],
    correct_answer_index: 1,
    common_pitfall_index: 0,
  },
  {
    question: "How should you report a workplace hazard?",
    options: [
      "Wait until the next safety meeting",
      "Only report if someone gets injured",
      "Report immediately to your supervisor",
    ],
    correct_answer_index: 2,
    common_pitfall_index: 0,
  },
  {
    question: "What is the purpose of a Safety Data Sheet (SDS)?",
    options: [
      "To provide information about chemical hazards and safe handling",
      "To track inventory levels",
      "To record employee training",
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
  },
  {
    question: "What should you do before lifting a heavy object?",
    options: [
      "Lift quickly to minimize strain",
      "Assess the weight and plan your lift path",
      "Ask someone to help without assessing first",
    ],
    correct_answer_index: 1,
    common_pitfall_index: 0,
  },
  {
    question: "When is it appropriate to bypass a safety guard on machinery?",
    options: [
      "When working alone to speed up the process",
      "Never - guards must remain in place during operation",
      "When the guard is inconvenient",
    ],
    correct_answer_index: 1,
    common_pitfall_index: 0,
  },
  {
    question: "What is the correct response to a fire alarm?",
    options: [
      "Continue working until you see flames",
      "Evacuate using designated routes immediately",
      "Investigate the source of the alarm",
    ],
    correct_answer_index: 1,
    common_pitfall_index: 0,
  },
];

export const generateMockQuestion = (index: number, prefix: string): Question => {
  const questionData = safetyQuestions[index % safetyQuestions.length];
  const timestamp = Date.now();
  return {
    id: `q-${timestamp}-${index}`,
    question: questionData.question,
    options: questionData.options,
    correct_answer_index: questionData.correct_answer_index,
    common_pitfall_index: questionData.common_pitfall_index,
    video_assets: {
      failure_video: `https://example.com/videos/failure-${prefix}-${index}.mp4`,
      success_video: `https://example.com/videos/success-${prefix}-${index}.mp4`,
    },
  };
};

const generateMockQuestions = (count: number, quizIndex: number): Question[] => {
  return Array.from({ length: count }, (_, i) => {
    const questionData = safetyQuestions[(quizIndex * count + i) % safetyQuestions.length];
    return {
      id: `q-${quizIndex}-${i}`,
      question: questionData.question,
      options: questionData.options,
      correct_answer_index: questionData.correct_answer_index,
      common_pitfall_index: questionData.common_pitfall_index,
      video_assets: {
        failure_video: `https://example.com/videos/failure-${quizIndex}-${i}.mp4`,
        success_video: `https://example.com/videos/success-${quizIndex}-${i}.mp4`,
      },
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
