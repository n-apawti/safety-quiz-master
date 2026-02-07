export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  failureVideoUrl: string;
  successVideoUrl: string;
  isRegenerating?: boolean;
}

export interface Quiz {
  id: string;
  name: string;
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
