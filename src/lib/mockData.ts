import { Manual, Quiz, Question, Warning } from './types';

const defaultWarnings: Warning[] = [
  {
    severity: "DANGER",
    title: "Electrocution Hazard",
    description: "The machine is not insulated and does not provide electric shock protection.",
    consequences: "Death or serious injury from electric shock.",
    context: "When operating near power lines or electrical equipment."
  },
  {
    severity: "DANGER",
    title: "Fall Hazard",
    description: "Failure to use fall protection equipment can result in falls from height.",
    consequences: "Death or serious injury from falling off the platform.",
    context: "Anytime personnel are on the elevated platform."
  },
  {
    severity: "WARNING",
    title: "Crush Hazard",
    description: "Body parts can become trapped in moving parts or scissor arms.",
    consequences: "Serious injury, including amputation or crushing.",
    context: "During platform movement or lifting/lowering operations."
  }
];

const safetyQuestions: Omit<Question, 'id' | 'isNew' | 'isRegenerating'>[] = [
  {
    question: "While operating the machine near overhead power lines, what is the most critical action to prevent electrocution?",
    options: [
      "Maintain the minimum safe distance from all power lines as specified in the manual",
      "Wear rubber gloves while operating the controls",
      "Allow a spotter to touch the machine while moving near power lines",
      "Operate at a lower speed to reduce risk"
    ],
    correct_answer: 0,
    explanation: "Maintaining the minimum safe distance from power lines is essential because the machine is not insulated and does not protect against electric shock.",
    reference: "[DANGER] Electrocution Hazard"
  },
  {
    question: "What is the safest response if you need to operate the machine on a slope or uneven ground?",
    options: [
      "Do not operate the machine; only use it on level, stable surfaces as specified",
      "Operate slowly and use the outriggers for additional support",
      "Reduce the load on the platform to compensate",
      "Ask a coworker to stabilize the machine manually"
    ],
    correct_answer: 0,
    explanation: "Operating only on level, stable surfaces prevents tipping. Outriggers may not be available or effective.",
    reference: "[DANGER] Tipping and Overloading Hazard"
  },
  {
    question: "Which of the following is a critical mistake that could result in a fatal fall from the platform?",
    options: [
      "Climbing or standing on the guardrails to reach higher",
      "Using a harness and lanyard attached to the designated anchor point",
      "Entering and exiting the platform through the designated access gate",
      "Keeping both feet flat on the platform floor"
    ],
    correct_answer: 0,
    explanation: "Standing or climbing on guardrails is a leading cause of falls from height.",
    reference: "[DANGER] Fall Hazard"
  },
  {
    question: "What should you do before charging the machine's batteries?",
    options: [
      "Ensure the area is free from flammable gases and open flames",
      "Charge indoors regardless of ventilation",
      "Ignore the presence of flammable vapors if charging is urgent",
      "Use any available extension cord"
    ],
    correct_answer: 0,
    explanation: "Charging must be done in a well-ventilated area away from flammable gases or open flames to prevent explosion or fire.",
    reference: "[DANGER] Explosion and Fire Hazard"
  },
  {
    question: "How can you avoid crush and bodily injury hazards when working around moving parts?",
    options: [
      "Keep hands, feet, and clothing clear of moving parts and never reach into pinch points",
      "Wear loose clothing to stay comfortable",
      "Stand close to scissor arms for better visibility",
      "Rely on coworkers to warn you of moving parts"
    ],
    correct_answer: 0,
    explanation: "Keeping body parts and clothing away from moving parts and pinch points is essential.",
    reference: "[WARNING] Crush and Bodily Injury Hazard"
  },
  {
    question: "When is it appropriate to bypass a safety guard on machinery?",
    options: [
      "When working alone to speed up the process",
      "Never - guards must remain in place during operation",
      "When the guard is inconvenient",
      "During emergency situations only"
    ],
    correct_answer: 1,
    explanation: "Safety guards must always remain in place during operation to prevent injury.",
    reference: "[WARNING] Crush Hazard"
  },
  {
    question: "What is the correct response to a fire alarm?",
    options: [
      "Continue working until you see flames",
      "Evacuate using designated routes immediately",
      "Investigate the source of the alarm",
      "Wait for further instructions"
    ],
    correct_answer: 1,
    explanation: "Immediate evacuation using designated routes is the correct response to any fire alarm.",
    reference: "[DANGER] Fire Hazard"
  },
  {
    question: "What is the purpose of a Safety Data Sheet (SDS)?",
    options: [
      "To provide information about chemical hazards and safe handling",
      "To track inventory levels",
      "To record employee training",
      "To schedule maintenance"
    ],
    correct_answer: 0,
    explanation: "SDS provides critical information about chemical hazards, safe handling, storage, and emergency procedures.",
    reference: "[WARNING] Chemical Hazard"
  },
];

export const generateMockQuestion = (index: number, prefix: string): Question => {
  const questionData = safetyQuestions[index % safetyQuestions.length];
  return {
    id: `q-${Date.now()}-${index}`,
    ...questionData,
  };
};

const generateMockQuestions = (count: number, quizIndex: number): Question[] => {
  return Array.from({ length: count }, (_, i) => {
    const questionData = safetyQuestions[(quizIndex * count + i) % safetyQuestions.length];
    return {
      id: `q-${quizIndex}-${i}`,
      ...questionData,
    };
  });
};

export const generateMockQuizzes = (numQuizzes: number, questionsPerQuiz: number, manualName: string): Quiz[] => {
  return Array.from({ length: numQuizzes }, (_, i) => ({
    id: `quiz-${Date.now()}-${i}`,
    name: `${manualName} - Quiz ${i + 1}`,
    manual_path: './manual.pdf',
    warnings: defaultWarnings,
    questions: generateMockQuestions(questionsPerQuiz, i),
  }));
};

export const mockManuals: Manual[] = [
  {
    id: 'manual-1',
    name: 'Scissor Lift Safety',
    filename: 'scissor_lift.pdf',
    uploadedAt: '2024-01-15T10:30:00Z',
    quizzes: [
      {
        id: 'quiz-1',
        name: 'Scissor Lift Safety Quiz',
        manual_path: './scissor_lift.pdf',
        warnings: [
          {
            severity: "DANGER",
            title: "Electrocution Hazard",
            description: "The machine is not insulated and does not provide electric shock protection. Operating near power lines or electrical equipment without maintaining a safe distance can result in contact with live wires.",
            consequences: "Death or serious injury from electric shock.",
            context: "When operating, moving, or positioning the machine near power lines or electrical equipment."
          },
          {
            severity: "DANGER",
            title: "Tipping and Overloading Hazard",
            description: "Exceeding the maximum platform load, using the machine on uneven or unstable surfaces, or modifying the machine can cause instability and tipping.",
            consequences: "Death, serious injury, or crushing from the machine tipping over.",
            context: "When loading the platform, operating on slopes, or using the platform in strong winds."
          },
          {
            severity: "DANGER",
            title: "Fall Hazard",
            description: "Failure to use fall protection equipment, improper entry/exit, or standing/climbing on guardrails can result in falls from height.",
            consequences: "Death or serious injury from falling off the platform.",
            context: "Anytime personnel are on the elevated platform."
          },
          {
            severity: "WARNING",
            title: "Crush and Bodily Injury Hazard",
            description: "Body parts or clothing can become trapped in moving parts, scissor arms, or between the platform and other objects.",
            consequences: "Serious or permanent injury, including amputation or crushing.",
            context: "During platform movement, lifting/lowering operations."
          }
        ],
        questions: [
          {
            id: 'q-1-0',
            question: "While operating the machine near overhead power lines, what is the most critical action to prevent electrocution?",
            options: [
              "Maintain the minimum safe distance from all power lines as specified in the manual",
              "Wear rubber gloves while operating the controls",
              "Allow a spotter to touch the machine while moving near power lines",
              "Operate at a lower speed to reduce risk"
            ],
            correct_answer: 0,
            explanation: "Maintaining the minimum safe distance from power lines is essential because the machine is not insulated and does not protect against electric shock.",
            reference: "[DANGER] Electrocution Hazard"
          },
          {
            id: 'q-1-1',
            question: "What is the safest response if you need to operate the machine on a slope or uneven ground?",
            options: [
              "Do not operate the machine; only use it on level, stable surfaces as specified",
              "Operate slowly and use the outriggers for additional support",
              "Reduce the load on the platform to compensate",
              "Ask a coworker to stabilize the machine manually"
            ],
            correct_answer: 0,
            explanation: "Operating only on level, stable surfaces prevents tipping.",
            reference: "[DANGER] Tipping and Overloading Hazard"
          },
          {
            id: 'q-1-2',
            question: "Which of the following is a critical mistake that could result in a fatal fall from the platform?",
            options: [
              "Climbing or standing on the guardrails to reach higher",
              "Using a harness and lanyard attached to the designated anchor point",
              "Entering and exiting the platform through the designated access gate",
              "Keeping both feet flat on the platform floor"
            ],
            correct_answer: 0,
            explanation: "Standing or climbing on guardrails is a leading cause of falls from height.",
            reference: "[DANGER] Fall Hazard"
          },
          {
            id: 'q-1-3',
            question: "What should you do before charging the machine's batteries?",
            options: [
              "Ensure the area is free from flammable gases and open flames",
              "Charge indoors regardless of ventilation",
              "Ignore the presence of flammable vapors if charging is urgent",
              "Use any available extension cord"
            ],
            correct_answer: 0,
            explanation: "Charging must be done in a well-ventilated area away from flammable gases or open flames.",
            reference: "[DANGER] Explosion and Fire Hazard"
          },
          {
            id: 'q-1-4',
            question: "How can you avoid crush and bodily injury hazards when working around moving parts and the platform?",
            options: [
              "Keep hands, feet, and clothing clear of moving parts and never reach into pinch points",
              "Wear loose clothing to stay comfortable",
              "Stand close to scissor arms for better visibility",
              "Rely on coworkers to warn you of moving parts"
            ],
            correct_answer: 0,
            explanation: "Keeping body parts and clothing away from moving parts and pinch points is essential.",
            reference: "[WARNING] Crush and Bodily Injury Hazard"
          }
        ],
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
        manual_path: './chemical_handling_v3.pdf',
        warnings: defaultWarnings,
        questions: generateMockQuestions(5, 2),
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
