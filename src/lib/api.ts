import { Manual, Quiz, GenerateQuizConfig } from './types';
import { mockManuals, generateMockQuizzes } from './mockData';

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
};

// POST /api/quizzes/:id/publish
export const publishQuizzes = async (manualId: string): Promise<void> => {
  await delay(1000);
  // In a real app, this would trigger video attachment on the backend
  console.log(`Publishing quizzes for manual ${manualId}`);
};
