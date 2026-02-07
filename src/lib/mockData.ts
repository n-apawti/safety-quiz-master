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

// Scissor Lift Quiz questions from backend
const scissorLiftQuestions: Question[] = [
  {
    id: 'sl-q-1',
    question: "You are about to operate the machine indoors. The manual says the maximum allowable wind speed indoors is 0 m/s. What should you do if you feel a strong draft or air movement?",
    options: [
      "Stop operation and ensure there are no open doors, fans, or sources of wind before continuing.",
      "Ignore it and continue working since you are inside and wind can't be that dangerous.",
      "Open more doors or windows to improve ventilation while operating the lift."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator stops the machine, checks all doors/windows, and only resumes when wind sources are controlled.",
      failure_video: "Visual: Operator ignores strong indoor draft, continues working, and the platform shakes dangerously or tips due to unexpected wind."
    }
  },
  {
    id: 'sl-q-2',
    question: "During a pre-operation inspection, you notice a missing safety decal on the platform. What is the correct action?",
    options: [
      "Stop using the machine and replace the missing safety decal before operation.",
      "Continue working since you already know the safety rules.",
      "Cover the area with tape to hide the missing label."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator halts operation, installs a new decal, and verifies all labels are visible before use.",
      failure_video: "Visual: Operator shrugs off the missing decal, continues working, and another worker is later injured due to missing safety information."
    }
  },
  {
    id: 'sl-q-3',
    question: "You need to lift the platform to work near a ceiling. What is the safest way to position the machine?",
    options: [
      "Ensure the machine is on solid, level ground and all stabilizers are engaged before lifting.",
      "Lift the platform while the machine is on a slight incline to get closer to your work.",
      "Raise the platform on an uneven surface if you move slowly and carefully."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator checks ground, confirms level, engages stabilizers, and lifts the platform safely.",
      failure_video: "Visual: Operator lifts the platform on an incline; the lift wobbles and tips, causing a near-miss or injury."
    }
  },
  {
    id: 'sl-q-4',
    question: "While operating the platform, the tilt alarm sounds. What should you do immediately?",
    options: [
      "Carefully lower the platform and move the machine to solid, level ground.",
      "Ignore the alarm if you are almost done with your task.",
      "Use the tilt alarm as a guide to keep working until it stops."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator hears alarm, lowers platform, and relocates to a flat area before resuming work.",
      failure_video: "Visual: Operator ignores the alarm, continues working, and the platform tips dangerously."
    }
  },
  {
    id: 'sl-q-5',
    question: "You need to move the machine with the platform raised. What is the correct procedure?",
    options: [
      "Only drive at a maximum speed of 0.8 km/h (0.5 mph) on flat, stable ground with the platform raised.",
      "Drive at regular speed because the lift is designed for movement when raised.",
      "Move quickly to save time, as long as you watch for obstacles."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator moves the machine slowly and carefully with the platform up, staying on flat ground.",
      failure_video: "Visual: Operator drives at normal speed with the platform up, causing the lift to sway and nearly tip."
    }
  },
  {
    id: 'sl-q-6',
    question: "You are about to perform maintenance and need to access the hydraulic system. What is the first step?",
    options: [
      "Turn off the ground controller, remove the key, and disconnect all power before starting maintenance.",
      "Just open the panel and begin work since you are careful.",
      "Only turn off the emergency stop button on the platform controller."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Technician powers down, removes key, and locks out power before touching hydraulic components.",
      failure_video: "Visual: Technician opens the panel with power still connected, causing accidental machine movement or hydraulic spray."
    }
  },
  {
    id: 'sl-q-7',
    question: "You need to charge the battery after your shift. What is the correct charging procedure?",
    options: [
      "Charge the battery using the manufacturer-supplied charger in a well-ventilated area, away from flames or sparks.",
      "Charge the battery anywhere, even near welding or grinding operations.",
      "Use any available charger, as long as it fits the battery terminals."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator connects the correct charger in a ventilated area, posts a warning sign, and keeps away ignition sources.",
      failure_video: "Visual: Operator charges the battery near welding sparks; battery gases ignite, causing a flash fire."
    }
  },
  {
    id: 'sl-q-8',
    question: "While working, you want to bring extra tools onto the platform. What should you do?",
    options: [
      "Only bring tools that do not exceed the platform's rated load and never attach extra toolboxes to the guardrail.",
      "Hang a heavy toolbox on the guardrail for convenience.",
      "Pile tools in the corner of the platform floor, ignoring the weight limit."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator checks the load, keeps tools on the floor, and avoids overloading or attaching boxes to rails.",
      failure_video: "Visual: Operator hangs a toolbox on the guardrail; the added weight causes the platform to tilt or overload the guardrail, risking collapse."
    }
  },
  {
    id: 'sl-q-9',
    question: "You notice an oil leak under the machine during your pre-operation inspection. What is the proper response?",
    options: [
      "Stop operation and report the leak for repair before using the machine.",
      "Wipe up the oil and continue working if the leak seems small.",
      "Ignore the leak; it is probably not important."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator finds leak, tags the machine out of service, and calls for maintenance.",
      failure_video: "Visual: Operator wipes up the leak and continues working; later, the hydraulic system fails, causing loss of control."
    }
  },
  {
    id: 'sl-q-10',
    question: "You are working near overhead power lines. What is the minimum safe distance you must maintain for lines up to 50kV?",
    options: [
      "At least 3.05 meters (10 feet) away from the power lines at all times.",
      "Get as close as needed as long as you do not touch the lines.",
      "Move the platform slowly under the lines to save time."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator measures and marks a 3-meter boundary, keeps platform well away from power lines.",
      failure_video: "Visual: Operator moves close to the lines, thinking it's safe if they don't touch; an arc flash jumps to the platform, causing an electrocution incident."
    }
  },
];

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
  {
    id: 'manual-4',
    name: 'Scissor Lift Operation Manual',
    filename: 'scissor_lift_manual.pdf',
    uploadedAt: '2024-03-15T11:00:00Z',
    quizzes: [
      {
        id: 'quiz-4',
        name: 'Scissor Lift Safety Quiz',
        questions: scissorLiftQuestions,
      },
    ],
  },
];
