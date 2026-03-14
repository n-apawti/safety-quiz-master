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
      failure_prompt: '',
      success_prompt: '',
    },
    explanation: "Follow proper safety procedures to prevent workplace accidents.",
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
        failure_prompt: '',
        success_prompt: '',
      },
      explanation: "Follow proper safety procedures to prevent workplace accidents.",
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
    question: "Before raising the platform, what must you always check about the ground conditions?",
    options: [
      "Ensure the machine is on solid, level ground free of holes and debris.",
      "Assume the ground is strong enough if it looks dry and hard.",
      "Only check for water puddles, not for slopes or holes."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator inspects the ground, finds a soft spot, moves the machine to a flat, solid area before raising the platform.",
      failure_video: "Visual: Worker glances at the ground, assumes it's safe, raises the platform; the machine suddenly tips and collapses into a hidden hole.",
      success_prompt: '',
      failure_prompt: '',
    },
    explanation: "Failing to check for level, solid ground can cause the machine to tip or collapse."
  },
  {
    id: 'sl-q-2',
    question: "What is the correct action if the tilt alarm sounds while the platform is elevated?",
    options: [
      "Carefully lower the platform and move the machine to level ground.",
      "Ignore the alarm and continue working since the platform feels stable.",
      "Try to reset the alarm by switching the machine off and on."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator hears the alarm, slowly lowers the platform, and moves the machine to a safe, level area.",
      failure_video: "Visual: Worker hears the alarm, shrugs, continues working; the machine tilts further and tips over with the worker on the platform.",
      success_prompt: '',
      failure_prompt: '',
    },
    explanation: "Ignoring the tilt alarm and continuing work can lead to a tip-over accident."
  },
  {
    id: 'sl-q-3',
    question: "When should you use the emergency stop button?",
    options: [
      "Any time there is a malfunction or unsafe situation.",
      "Only if someone tells you to.",
      "Never, as it could damage the machine."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator notices a malfunction, immediately hits the emergency stop, halting all functions safely.",
      failure_video: "Visual: Worker hesitates, waits for instructions; the malfunction worsens, resulting in a near-miss or accident.",
      success_prompt: '',
      failure_prompt: '',
    },
    explanation: "Delaying use of the emergency stop in a dangerous situation can result in injury or damage."
  },
  {
    id: 'sl-q-4',
    question: "What is the most dangerous way to load tools onto the platform?",
    options: [
      "Securely place tools within the platform's guardrails, ensuring nothing overhangs.",
      "Hang tools and materials on the outside of the guardrails to save space.",
      "Leave tools on the ground and retrieve them one by one while elevated."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator places all tools inside the platform, checks that nothing is overhanging.",
      failure_video: "Visual: Worker hangs a heavy tool bag over the guardrail; the platform becomes unstable and tips, or a tool falls and nearly hits someone below.",
      success_prompt: '',
      failure_prompt: '',
    },
    explanation: "Hanging tools outside the guardrails increases the risk of tipping and falling objects."
  },
  {
    id: 'sl-q-5',
    question: "How should you respond if you notice hydraulic oil leaking from the machine during inspection?",
    options: [
      "Stop operation and report the issue for immediate repair.",
      "Wipe away the oil and continue using the machine if the leak seems small.",
      "Try to tighten random bolts to stop the leak yourself."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator notices a leak, tags the machine out of service, and calls maintenance.",
      failure_video: "Visual: Worker wipes away the oil, keeps working; later, the hydraulic system fails and the platform collapses unexpectedly.",
      success_prompt: '',
      failure_prompt: '',
    },
    explanation: "Ignoring or patching up leaks without proper repair can lead to sudden machine failure or fire hazards."
  },
  {
    id: 'sl-q-6',
    question: "What is the correct procedure before operating the machine each shift?",
    options: [
      "Perform a full pre-operation inspection and function test as described in the manual.",
      "Ask the previous operator if the machine was working fine and skip the inspection.",
      "Only check the battery level if you're in a rush."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator goes through the checklist, finds a loose guardrail, fixes it before use.",
      failure_video: "Visual: Worker asks a coworker if it's fine, starts the machine; a missed defect causes a safety incident.",
      success_prompt: '',
      failure_prompt: '',
    },
    explanation: "Skipping the required inspection can result in using a damaged or unsafe machine."
  },
  {
    id: 'sl-q-7',
    question: "What is the safest way to enter and exit the platform?",
    options: [
      "Only enter or exit when the platform is fully lowered and the entry gate is closed after entry.",
      "Climb over the guardrails if the platform is not perfectly aligned with the ground.",
      "Jump down from the platform if you are in a hurry."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Worker waits until the platform is fully lowered, opens the gate, and steps safely onto the ground.",
      failure_video: "Visual: Worker climbs over the guardrail, slips, and falls from the platform.",
      success_prompt: '',
      failure_prompt: '',
    },
    explanation: "Climbing over guardrails or jumping can result in falls and serious injuries."
  },
  {
    id: 'sl-q-8',
    question: "What is the correct response if the overload alarm sounds and the platform stops moving?",
    options: [
      "Remove excess weight from the platform until the alarm stops.",
      "Ignore the alarm and try to move the platform again.",
      "Have a coworker climb up and help push the controls."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator removes a heavy toolbox from the platform, alarm stops, platform resumes normal operation.",
      failure_video: "Visual: Worker ignores the alarm, repeatedly tries to move the platform; the platform suddenly drops or fails.",
      success_prompt: '',
      failure_prompt: '',
    },
    explanation: "Ignoring the overload alarm risks equipment failure or collapse."
  },
  {
    id: 'sl-q-9',
    question: "When is it safe to drive the machine with the platform raised?",
    options: [
      "Only at low speed (max 0.8 km/h) on level, stable ground with no obstacles.",
      "At any speed if you are careful and watch for obstacles.",
      "On rough or sloped ground to save time moving between tasks."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator drives slowly on a level warehouse floor with the platform raised.",
      failure_video: "Visual: Worker drives quickly with the platform up, hits a bump, and the machine tips over.",
      success_prompt: '',
      failure_prompt: '',
    },
    explanation: "Driving fast or on uneven ground with the platform raised is a leading cause of tip-overs."
  },
  {
    id: 'sl-q-10',
    question: "What is the correct way to handle battery charging at the end of your shift?",
    options: [
      "Charge the battery in a well-ventilated area, away from open flames, using the correct charger.",
      "Charge the battery anywhere convenient, even if it's near welding or grinding work.",
      "Use any available charger, even if it's not the one supplied by the manufacturer."
    ],
    correct_answer_index: 0,
    common_pitfall_index: 1,
    video_assets: {
      success_video: "Visual: Operator plugs in the charger in a ventilated area, checks for sparks, and keeps flammables away.",
      failure_video: "Visual: Worker charges the battery next to welding sparks; a fire or explosion occurs.",
      success_prompt: '',
      failure_prompt: '',
    },
    explanation: "Charging batteries in unsafe areas or with the wrong charger can cause explosions or fires."
  },
];

export const mockManuals: Manual[] = [
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
