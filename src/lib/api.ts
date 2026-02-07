import { Manual, Quiz, Question, GenerateQuizConfig, AddQuizConfig } from './types';
import { mockManuals, generateMockQuizzes, generateMockQuestion } from './mockData';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory store (will be replaced by FastAPI calls)
let manuals: Manual[] = [...mockManuals];

// GET /api/manuals
export const fetchManuals = async (): Promise<Manual[]> => {
  await delay(500);
  return manuals;
};

// GET /api/manuals/:id
export const fetchManualById = async (id: string): Promise<Manual | null> => {
  await delay(300);
  return manuals.find(m => m.id === id) || null;
};

// GET /api/quizzes/:id
export const fetchQuizById = async (quizId: string): Promise<{ quiz: Quiz; manualId: string } | null> => {
  await delay(300);
  for (const manual of manuals) {
    const quiz = manual.quizzes.find(q => q.id === quizId);
    if (quiz) {
      return { quiz, manualId: manual.id };
    }
  }
  return null;
};

// POST /api/manuals/upload
export const uploadManualAndGenerateQuizzes = async (
  config: GenerateQuizConfig
): Promise<{ manual: Manual; quizzes: Quiz[] }> => {
  await delay(2000); // Simulate processing time
  
  const newQuizzes = generateMockQuizzes(config.numQuizzes, config.questionsPerQuiz, config.manualName);
  
  const newManual: Manual = {
    id: `manual-${Date.now()}`,
    name: config.manualName,
    filename: config.file?.name || 'unknown.pdf',
    uploadedAt: new Date().toISOString(),
    quizzes: newQuizzes,
  };
  
  manuals = [...manuals, newManual];
  
  return { manual: newManual, quizzes: newQuizzes };
};

// POST /api/manuals/:id/quizzes - Add a new quiz to an existing manual
export const addQuizToManual = async (config: AddQuizConfig): Promise<Quiz> => {
  await delay(1500); // Simulate generation time
  
  const questions: Question[] = [];
  for (let i = 0; i < config.questionCount; i++) {
    questions.push(generateMockQuestion(i, config.quizName));
  }
  
  const newQuiz: Quiz = {
    id: `quiz-${Date.now()}`,
    name: config.quizName,
    questions,
  };
  
  manuals = manuals.map(manual => {
    if (manual.id === config.manualId) {
      return {
        ...manual,
        quizzes: [...manual.quizzes, newQuiz],
      };
    }
    return manual;
  });
  
  return newQuiz;
};

// PUT /api/quizzes/:id
export const updateQuiz = async (manualId: string, quiz: Quiz): Promise<Quiz> => {
  await delay(300);
  
  manuals = manuals.map(manual => {
    if (manual.id === manualId) {
      return {
        ...manual,
        quizzes: manual.quizzes.map(q => q.id === quiz.id ? quiz : q),
      };
    }
    return manual;
  });
  
  return quiz;
};

// PUT /api/questions/:id - Update a single question (triggers video regeneration)
export const updateQuestion = async (
  manualId: string, 
  quizId: string, 
  question: Question
): Promise<Question> => {
  // Simulate video regeneration delay (longer than normal save)
  await delay(2000);
  
  // Generate new video URLs to simulate regeneration
  const updatedQuestion: Question = {
    ...question,
    failureVideoUrl: `https://example.com/videos/failure-${Date.now()}.mp4`,
    successVideoUrl: `https://example.com/videos/success-${Date.now()}.mp4`,
  };
  
  manuals = manuals.map(manual => {
    if (manual.id === manualId) {
      return {
        ...manual,
        quizzes: manual.quizzes.map(quiz => {
          if (quiz.id === quizId) {
            return {
              ...quiz,
              questions: quiz.questions.map(q => 
                q.id === question.id ? updatedQuestion : q
              ),
            };
          }
          return quiz;
        }),
      };
    }
    return manual;
  });
  
  console.log(`[API] Question ${question.id} updated. Video regeneration triggered.`);
  
  return updatedQuestion;
};

// DELETE /api/quizzes/:id
export const deleteQuiz = async (manualId: string, quizId: string): Promise<void> => {
  await delay(300);
  
  manuals = manuals.map(manual => {
    if (manual.id === manualId) {
      return {
        ...manual,
        quizzes: manual.quizzes.filter(q => q.id !== quizId),
      };
    }
    return manual;
  });
  
  console.log(`[API] Quiz ${quizId} deleted from manual ${manualId}`);
};

// POST /api/quizzes/:id/publish
export const publishQuizzes = async (manualId: string): Promise<void> => {
  await delay(1000);
  // In a real app, this would trigger video attachment on the backend
  console.log(`Publishing quizzes for manual ${manualId}`);
};
