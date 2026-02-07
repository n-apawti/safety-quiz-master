import { Manual, Quiz, Question, GenerateQuizConfig, AddQuizConfig, VideoAssets } from './types';
import { API_BASE_URL } from './config';

// ============================================================================
// Backend API Types (matching FastAPI responses)
// ============================================================================

interface BackendDocument {
  id: string;
  file_name: string;
  public_url: string;
  created_at?: string;
}

interface BackendQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answer_index: number | null;
  common_pitfall_index?: number | null;
  explanation?: string | null;
  video_assets?: {
    success_video?: string;
    failure_video?: string;
    success_prompt?: string;
    failure_prompt?: string;
  } | null;
}

interface BackendQuiz {
  id: string;
  title: string;
  document_id?: string | null;
  summary?: string | null;
  questions: BackendQuestion[];
  created_at?: string;
}

// ============================================================================
// Data Transformation Helpers
// ============================================================================

function transformBackendQuestion(q: BackendQuestion): Question {
  console.log('[DEBUG] transformBackendQuestion input:', JSON.stringify(q, null, 2));
  console.log('[DEBUG] video_assets from backend:', q.video_assets);

  const result = {
    id: q.id,
    question: q.prompt,
    options: q.choices,
    correct_answer_index: q.answer_index ?? 0,
    common_pitfall_index: q.common_pitfall_index ?? 0,
    explanation: q.explanation ?? '',
    video_assets: {
      success_video: q.video_assets?.success_video ?? '',
      failure_video: q.video_assets?.failure_video ?? '',
      success_prompt: q.video_assets?.success_prompt ?? '',
      failure_prompt: q.video_assets?.failure_prompt ?? '',
    },
  };

  console.log('[DEBUG] transformBackendQuestion output video_assets:', result.video_assets);
  return result;
}

function transformBackendQuiz(quiz: BackendQuiz): Quiz {
  return {
    id: quiz.id,
    name: quiz.title,
    questions: quiz.questions.map(transformBackendQuestion),
  };
}

function transformQuestionToBackend(q: Question): Omit<BackendQuestion, 'id'> {
  return {
    prompt: q.question,
    choices: q.options,
    answer_index: q.correct_answer_index,
    common_pitfall_index: q.common_pitfall_index,
    explanation: q.explanation,
    video_assets: q.video_assets,
  };
}

// ============================================================================
// API Functions
// ============================================================================

// GET /documents - fetch all documents with their related quizzes
export const fetchManuals = async (): Promise<Manual[]> => {
  try {
    // Fetch all documents
    const docsRes = await fetch(`${API_BASE_URL}/documents`);
    if (!docsRes.ok) throw new Error('Failed to fetch documents');
    const docsData = await docsRes.json();
    const documents: BackendDocument[] = docsData.items || [];

    // Fetch all quizzes
    const quizzesRes = await fetch(`${API_BASE_URL}/quiz`);
    if (!quizzesRes.ok) throw new Error('Failed to fetch quizzes');
    const quizzes: BackendQuiz[] = await quizzesRes.json();

    // Group quizzes by document_id
    const quizzesByDoc = new Map<string, BackendQuiz[]>();
    const orphanQuizzes: BackendQuiz[] = [];

    for (const quiz of quizzes) {
      if (quiz.document_id) {
        const existing = quizzesByDoc.get(quiz.document_id) || [];
        existing.push(quiz);
        quizzesByDoc.set(quiz.document_id, existing);
      } else {
        orphanQuizzes.push(quiz);
      }
    }

    // Transform documents to manuals
    const manuals: Manual[] = documents.map((doc) => ({
      id: doc.id,
      name: doc.file_name.replace(/\.[^/.]+$/, ''), // Remove file extension for display
      filename: doc.file_name,
      uploadedAt: doc.created_at || new Date().toISOString(),
      quizzes: (quizzesByDoc.get(doc.id) || []).map(transformBackendQuiz),
    }));

    // If there are orphan quizzes (no document_id), create a virtual manual for them
    if (orphanQuizzes.length > 0) {
      manuals.unshift({
        id: 'orphan-quizzes',
        name: 'Standalone Quizzes',
        filename: '',
        uploadedAt: new Date().toISOString(),
        quizzes: orphanQuizzes.map(transformBackendQuiz),
      });
    }

    return manuals;
  } catch (error) {
    console.error('fetchManuals error:', error);
    return [];
  }
};

// GET /documents/:id - fetch a single document with its quizzes
export const fetchManualById = async (id: string): Promise<Manual | null> => {
  try {
    // Special case for orphan quizzes
    if (id === 'orphan-quizzes') {
      const quizzesRes = await fetch(`${API_BASE_URL}/quiz`);
      if (!quizzesRes.ok) throw new Error('Failed to fetch quizzes');
      const quizzes: BackendQuiz[] = await quizzesRes.json();
      const orphanQuizzes = quizzes.filter((q) => !q.document_id);

      return {
        id: 'orphan-quizzes',
        name: 'Standalone Quizzes',
        filename: '',
        uploadedAt: new Date().toISOString(),
        quizzes: orphanQuizzes.map(transformBackendQuiz),
      };
    }

    // Fetch document
    const docRes = await fetch(`${API_BASE_URL}/documents/${id}`, {
      redirect: 'manual', // Document endpoint redirects, we just need to verify it exists
    });

    // The endpoint returns a redirect, so we need to get document info differently
    // Fetch all documents and find the one we need
    const docsRes = await fetch(`${API_BASE_URL}/documents`);
    if (!docsRes.ok) throw new Error('Failed to fetch documents');
    const docsData = await docsRes.json();
    const documents: BackendDocument[] = docsData.items || [];
    const doc = documents.find((d) => d.id === id);

    if (!doc) return null;

    // Fetch all quizzes for this document
    const quizzesRes = await fetch(`${API_BASE_URL}/quiz`);
    if (!quizzesRes.ok) throw new Error('Failed to fetch quizzes');
    const quizzes: BackendQuiz[] = await quizzesRes.json();
    const docQuizzes = quizzes.filter((q) => q.document_id === id);

    return {
      id: doc.id,
      name: doc.file_name.replace(/\.[^/.]+$/, ''),
      filename: doc.file_name,
      uploadedAt: doc.created_at || new Date().toISOString(),
      quizzes: docQuizzes.map(transformBackendQuiz),
    };
  } catch (error) {
    console.error('fetchManualById error:', error);
    return null;
  }
};

// GET /quiz/:id - fetch a single quiz
export const fetchQuizById = async (
  quizId: string
): Promise<{ quiz: Quiz; manualId: string } | null> => {
  try {
    console.log('[DEBUG] fetchQuizById called with quizId:', quizId);
    const res = await fetch(`${API_BASE_URL}/quiz/${quizId}`);
    if (!res.ok) return null;

    const backendQuiz: BackendQuiz = await res.json();
    console.log('[DEBUG] Backend response:', JSON.stringify(backendQuiz, null, 2));
    console.log('[DEBUG] Backend questions:', backendQuiz.questions);

    const transformedQuiz = transformBackendQuiz(backendQuiz);
    console.log('[DEBUG] Transformed quiz:', JSON.stringify(transformedQuiz, null, 2));

    return {
      quiz: transformedQuiz,
      manualId: backendQuiz.document_id || 'orphan-quizzes',
    };
  } catch (error) {
    console.error('fetchQuizById error:', error);
    return null;
  }
};

// POST /documents/upload + POST /documents/:id/generate-quiz
export const uploadManualAndGenerateQuizzes = async (
  config: GenerateQuizConfig
): Promise<{ manual: Manual; quizzes: Quiz[] }> => {
  if (!config.file) {
    throw new Error('No file provided');
  }

  // 1. Upload the document
  const formData = new FormData();
  formData.append('file', config.file);

  const uploadRes = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    const error = await uploadRes.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to upload document');
  }

  const uploadData = await uploadRes.json();
  const docId = uploadData.id;

  // 2. Generate quizzes (one quiz per numQuizzes)
  const generatedQuizzes: Quiz[] = [];

  for (let i = 0; i < config.numQuizzes; i++) {
    const quizTitle = `${config.manualName} - Quiz ${i + 1}`;
    const generateRes = await fetch(
      `${API_BASE_URL}/documents/${docId}/generate-quiz?num_questions=${config.questionsPerQuiz}&title=${encodeURIComponent(quizTitle)}`,
      { method: 'POST' }
    );

    if (!generateRes.ok) {
      console.error(`Failed to generate quiz ${i + 1}`);
      continue;
    }

    const backendQuiz: BackendQuiz = await generateRes.json();
    generatedQuizzes.push(transformBackendQuiz(backendQuiz));
  }

  const manual: Manual = {
    id: docId,
    name: config.manualName,
    filename: config.file.name,
    uploadedAt: new Date().toISOString(),
    quizzes: generatedQuizzes,
  };

  return { manual, quizzes: generatedQuizzes };
};

// POST /documents/:id/generate-quiz - Add a new quiz to an existing document
export const addQuizToManual = async (config: AddQuizConfig): Promise<Quiz> => {
  const generateRes = await fetch(
    `${API_BASE_URL}/documents/${config.manualId}/generate-quiz?num_questions=${config.questionCount}&title=${encodeURIComponent(config.quizName)}`,
    { method: 'POST' }
  );

  if (!generateRes.ok) {
    const error = await generateRes.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to generate quiz');
  }

  const backendQuiz: BackendQuiz = await generateRes.json();
  return transformBackendQuiz(backendQuiz);
};

// PATCH /quiz/:id - Update quiz title
export const updateQuiz = async (manualId: string, quiz: Quiz): Promise<Quiz> => {
  const res = await fetch(`${API_BASE_URL}/quiz/${quiz.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: quiz.name }),
  });

  if (!res.ok) {
    throw new Error('Failed to update quiz');
  }

  // The backend returns the updated quiz, but we need to refetch to get full data
  const updatedQuiz = await res.json();
  return transformBackendQuiz(updatedQuiz);
};

// PATCH /quiz/:quizId/questions/:questionId - Update question text only
export const updateQuestionText = async (
  manualId: string,
  quizId: string,
  question: Question
): Promise<Question> => {
  const res = await fetch(`${API_BASE_URL}/quiz/${quizId}/questions/${question.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: question.question,
      choices: question.options,
      answer_index: question.correct_answer_index,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to update question');
  }

  const updated: BackendQuestion = await res.json();
  return transformBackendQuestion(updated);
};

// POST /quiz/:quizId/questions - Generate video assets for new questions (stub)
export const generateQuestionAssets = async (
  manualId: string,
  quizId: string,
  question: Question
): Promise<Question> => {
  // For now, just return the question with mock video assets
  // In a real implementation, this would call a video generation endpoint
  console.log(`[API] Generating assets for question ${question.id}`);

  return {
    ...question,
    video_assets: {
      failure_video: `https://example.com/videos/failure-${Date.now()}.mp4`,
      success_video: `https://example.com/videos/success-${Date.now()}.mp4`,
    },
    isNew: false,
  };
};

// PATCH /quiz/:quizId/questions/:questionId - Update question (legacy, with video regen)
export const updateQuestion = async (
  manualId: string,
  quizId: string,
  question: Question
): Promise<Question> => {
  const res = await fetch(`${API_BASE_URL}/quiz/${quizId}/questions/${question.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: question.question,
      choices: question.options,
      answer_index: question.correct_answer_index,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to update question');
  }

  const updated: BackendQuestion = await res.json();
  return transformBackendQuestion(updated);
};

// DELETE /quiz/:quizId/questions/:questionId
export const deleteQuestion = async (
  manualId: string,
  quizId: string,
  questionId: string
): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/quiz/${quizId}/questions/${questionId}`, {
    method: 'DELETE',
  });

  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete question');
  }

  console.log(`[API] Question ${questionId} deleted from quiz ${quizId}`);
};

// POST /quiz/:quizId/questions - Add a new question
export const addQuestion = async (
  manualId: string,
  quizId: string,
  question: Omit<Question, 'id'>
): Promise<Question> => {
  const res = await fetch(`${API_BASE_URL}/quiz/${quizId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: question.question,
      choices: question.options,
      answer_index: question.correct_answer_index,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to add question');
  }

  const created: BackendQuestion = await res.json();
  return transformBackendQuestion(created);
};

// DELETE /quiz/:id
export const deleteQuiz = async (manualId: string, quizId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/quiz/${quizId}`, {
    method: 'DELETE',
  });

  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete quiz');
  }

  console.log(`[API] Quiz ${quizId} deleted`);
};

// POST /quiz/:id/generate-videos - Trigger video generation for a quiz
export const generateVideosForQuiz = async (quizId: string): Promise<Quiz> => {
  const res = await fetch(`${API_BASE_URL}/quiz/${quizId}/generate-videos`, {
    method: 'POST',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to generate videos');
  }

  const backendQuiz: BackendQuiz = await res.json();
  return transformBackendQuiz(backendQuiz);
};

// POST /quiz/:id/publish - Generate videos for all quizzes in a manual
export const publishQuizzes = async (
  manualId: string,
  quizIds: string[],
  onProgress?: (quizId: string, status: 'pending' | 'generating' | 'done' | 'error') => void
): Promise<void> => {
  console.log(`[API] Publishing quizzes for manual ${manualId}`);

  for (const quizId of quizIds) {
    try {
      onProgress?.(quizId, 'generating');
      await generateVideosForQuiz(quizId);
      onProgress?.(quizId, 'done');
    } catch (error) {
      console.error(`Failed to generate videos for quiz ${quizId}:`, error);
      onProgress?.(quizId, 'error');
      throw error;
    }
  }
};
