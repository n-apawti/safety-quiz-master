export interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number; // Index of the correct option
  explanation: string;
  reference: string;
  isNew?: boolean; // Flag for newly added questions that need asset generation
  isRegenerating?: boolean;
}

export interface Warning {
  severity: 'DANGER' | 'WARNING' | 'CAUTION';
  title: string;
  description: string;
  consequences: string;
  context: string;
}

export interface Quiz {
  id: string;
  name: string;
  manual_path: string;
  warnings: Warning[];
  questions: Question[];
}

export interface Manual {
  id: string;
  name: string;
  filename: string;
  uploadedAt: string;
  quizzes: Quiz[];
}

export interface GenerateQuizConfig {
  manualName: string;
  numQuizzes: number;
  questionsPerQuiz: number;
  file: File | null;
}

export interface AddQuizConfig {
  manualId: string;
  quizName: string;
  questionCount: number;
}
