export interface VideoAssets {
  success_video: string;
  failure_video: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer_index: number;
  common_pitfall_index: number;
  video_assets: VideoAssets;
  isRegenerating?: boolean;
  isNew?: boolean; // Flag for newly added questions that need asset generation
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
