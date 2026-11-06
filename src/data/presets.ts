import { BadgeDefinition } from '../types';
import scienceJungleBg from '../assets/images/jungle_learning_map_bg_1793938971041.jpg';
import mathMountainBg from '../assets/images/math_mountain_theme_1793940296062.jpg';
import csCyberBg from '../assets/images/cs_cyber_theme_1793940297717.jpg';
import historyAncientBg from '../assets/images/history_ancient_theme_1793940298434.jpg';
import literatureVillageBg from '../assets/images/literature_village_theme_1793940294349.jpg';
import economicsHarborBg from '../assets/images/economics_harbor_theme_1793940298959.jpg';

export interface SubjectThemeConfig {
  subject: string;
  themeName: string;
  subtitle: string;
  emoji: string;
  image: string;
  accentHex: string;
  ringShadow: string;
  badgeBg: string;
  checkpointCoords: Array<{ x: number; y: number }>;
  svgPath: string;
}

export const SUBJECT_THEMES: Record<string, SubjectThemeConfig> = {
  Science: {
    subject: 'Science',
    themeName: 'Tropical Jungle & Temple',
    subtitle: 'Explore biological & natural systems across the jungle trail',
    emoji: '🌍',
    image: scienceJungleBg,
    accentHex: '#10B981',
    ringShadow: '0 0 0 4px rgba(16,185,129,0.28), 0 10px 20px rgba(0,0,0,0.28)',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    checkpointCoords: [
      { x: 16, y: 36 },
      { x: 21, y: 74 },
      { x: 38, y: 48 },
      { x: 56, y: 68 },
      { x: 75, y: 46 },
    ],
    svgPath: 'M 160 162 Q 150 260 210 333 Q 290 320 380 216 Q 470 230 560 306 Q 660 290 750 207',
  },
  Mathematics: {
    subject: 'Mathematics',
    themeName: 'Crystal Mountain & Observatory',
    subtitle: 'Ascend the alpine valley from crystal towers to the peak observatory',
    emoji: '🧮',
    image: mathMountainBg,
    accentHex: '#2563EB',
    ringShadow: '0 0 0 4px rgba(37,99,235,0.28), 0 10px 20px rgba(0,0,0,0.28)',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-300',
    checkpointCoords: [
      { x: 20, y: 78 },
      { x: 34, y: 60 },
      { x: 52, y: 50 },
      { x: 68, y: 68 },
      { x: 84, y: 38 },
    ],
    svgPath: 'M 200 351 Q 270 310 340 270 Q 430 240 520 225 Q 600 265 680 306 Q 760 240 840 171',
  },
  'Computer Science': {
    subject: 'Computer Science',
    themeName: 'Sky-Tech Cyber Island',
    subtitle: 'Cross glowing circuit bridges to the innovation spire',
    emoji: '💻',
    image: csCyberBg,
    accentHex: '#0284C7',
    ringShadow: '0 0 0 4px rgba(2,132,199,0.3), 0 10px 20px rgba(0,0,0,0.28)',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-300',
    checkpointCoords: [
      { x: 20, y: 74 },
      { x: 30, y: 48 },
      { x: 48, y: 56 },
      { x: 66, y: 70 },
      { x: 82, y: 42 },
    ],
    svgPath: 'M 200 333 Q 240 260 300 216 Q 390 230 480 252 Q 570 285 660 315 Q 740 250 820 189',
  },
  History: {
    subject: 'History',
    themeName: 'Golden Oasis & Ancient Citadel',
    subtitle: 'Journey past classical columns and stone bridges to the grand monument',
    emoji: '🏛️',
    image: historyAncientBg,
    accentHex: '#D97706',
    ringShadow: '0 0 0 4px rgba(217,119,6,0.28), 0 10px 20px rgba(0,0,0,0.28)',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
    checkpointCoords: [
      { x: 22, y: 52 },
      { x: 32, y: 76 },
      { x: 54, y: 72 },
      { x: 72, y: 62 },
      { x: 82, y: 38 },
    ],
    svgPath: 'M 220 234 Q 260 300 320 342 Q 430 340 540 324 Q 630 300 720 279 Q 780 225 820 171',
  },
  Literature: {
    subject: 'Literature',
    themeName: 'Storybook Countryside Village',
    subtitle: 'Stroll through cottage lanes, stone bridges, and hillside windmills',
    emoji: '📖',
    image: literatureVillageBg,
    accentHex: '#7C3AED',
    ringShadow: '0 0 0 4px rgba(124,58,237,0.28), 0 10px 20px rgba(0,0,0,0.28)',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-300',
    checkpointCoords: [
      { x: 20, y: 66 },
      { x: 42, y: 62 },
      { x: 62, y: 68 },
      { x: 76, y: 52 },
      { x: 74, y: 30 },
    ],
    svgPath: 'M 200 297 Q 310 285 420 279 Q 520 295 620 306 Q 700 275 760 234 Q 755 180 740 135',
  },
  Economics: {
    subject: 'Economics',
    themeName: 'Harbor Market & Lighthouse Plaza',
    subtitle: 'Navigate trade docks and bustling markets to the coastal lighthouse',
    emoji: '📊',
    image: economicsHarborBg,
    accentHex: '#0D9488',
    ringShadow: '0 0 0 4px rgba(13,148,136,0.28), 0 10px 20px rgba(0,0,0,0.28)',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-300',
    checkpointCoords: [
      { x: 16, y: 74 },
      { x: 34, y: 54 },
      { x: 52, y: 46 },
      { x: 74, y: 66 },
      { x: 86, y: 38 },
    ],
    svgPath: 'M 160 333 Q 240 280 340 243 Q 430 220 520 207 Q 630 250 740 297 Q 810 235 860 171',
  },
  General: {
    subject: 'General',
    themeName: 'Tropical Jungle & Temple',
    subtitle: 'Complete all 5 learning stages along the adventure path',
    emoji: '📚',
    image: scienceJungleBg,
    accentHex: '#2563EB',
    ringShadow: '0 0 0 4px rgba(37,99,235,0.28), 0 10px 20px rgba(0,0,0,0.28)',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-300',
    checkpointCoords: [
      { x: 16, y: 36 },
      { x: 21, y: 74 },
      { x: 38, y: 48 },
      { x: 56, y: 68 },
      { x: 75, y: 46 },
    ],
    svgPath: 'M 160 162 Q 150 260 210 333 Q 290 320 380 216 Q 470 230 560 306 Q 660 290 750 207',
  },
};

export function getSubjectTheme(subject?: string): SubjectThemeConfig {
  if (subject && SUBJECT_THEMES[subject]) {
    return SUBJECT_THEMES[subject];
  }
  return SUBJECT_THEMES.Science;
}

export const LEVELUP_BADGES: BadgeDefinition[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Upload your first study material and generate an AI Learning Blueprint.',
    xpReward: 50,
    iconName: 'Compass',
    gradient: 'from-[#6546F5] to-[#398BFF]',
    requirementText: 'Create 1 learning blueprint',
  },
  {
    id: 'quick_learner',
    name: 'Quick Learner',
    description: 'Complete your first learning stage checkpoint.',
    xpReward: 75,
    iconName: 'Zap',
    gradient: 'from-[#398BFF] to-[#48D4DC]',
    requirementText: 'Complete 1 learning stage',
  },
  {
    id: 'topic_explorer',
    name: 'Topic Explorer',
    description: 'Mark at least 4 core topics as understood in Stage 1 & Stage 2.',
    xpReward: 100,
    iconName: 'BookOpen',
    gradient: 'from-[#48D4DC] to-[#10B981]',
    requirementText: 'Master 4+ topics',
  },
  {
    id: 'revision_master',
    name: 'Revision Master',
    description: 'Review flashcards and complete Stage 3 Revision.',
    xpReward: 120,
    iconName: 'Layers',
    gradient: 'from-[#F36FA5] to-[#6546F5]',
    requirementText: 'Complete Stage 3 Revision',
  },
  {
    id: 'mind_mapper',
    name: 'Mind Mapper',
    description: 'Explore all concept branches in Stage 4 Mind Maps.',
    xpReward: 120,
    iconName: 'Network',
    gradient: 'from-[#8B5CF6] to-[#EC4899]',
    requirementText: 'Complete Stage 4 Mind Map',
  },
  {
    id: 'quiz_champion',
    name: 'Quiz Champion',
    description: 'Score 80% or higher on a Stage 5 Chapter Test.',
    xpReward: 150,
    iconName: 'Trophy',
    gradient: 'from-[#F59E0B] to-[#EF4444]',
    requirementText: 'Score 80%+ on a chapter test',
  },
  {
    id: 'chapter_master',
    name: 'Chapter Master',
    description: 'Conquer all 5 stages of a chapter from Topics to Test.',
    xpReward: 200,
    iconName: 'Crown',
    gradient: 'from-[#10B981] to-[#059669]',
    requirementText: 'Complete 1 full chapter',
  },
  {
    id: 'learning_legend',
    name: 'Learning Legend',
    description: 'Reach 500+ total XP across your personal learning journey.',
    xpReward: 300,
    iconName: 'Award',
    gradient: 'from-[#6546F5] via-[#F36FA5] to-[#F59E0B]',
    requirementText: 'Reach 500+ Total XP',
  },
];

export const STAGE_METADATA = [
  {
    stage: 1,
    name: 'Topics',
    subtitle: 'Structured Hierarchy',
    description: 'View all extracted topics and subtopics and mark each concept as understood.',
    xpReward: 50,
    color: '#6546F5',
    bgLight: 'bg-[#6546F5]/10',
    textColor: 'text-[#6546F5]',
  },
  {
    stage: 2,
    name: 'Explanation',
    subtitle: 'Simple Breakdowns',
    description: 'Read plain-language explanations with examples and ask your personal AI Tutor.',
    xpReward: 60,
    color: '#398BFF',
    bgLight: 'bg-[#398BFF]/10',
    textColor: 'text-[#398BFF]',
  },
  {
    stage: 3,
    name: 'Revision',
    subtitle: 'Flashcards & Notes',
    description: 'Review key definitions, flashcards, and summary notes.',
    xpReward: 70,
    color: '#F36FA5',
    bgLight: 'bg-[#F36FA5]/10',
    textColor: 'text-[#F36FA5]',
  },
  {
    stage: 4,
    name: 'Mind Maps',
    subtitle: 'Visual Connections',
    description: 'Explore an interactive concept map connecting topics and subtopics.',
    xpReward: 70,
    color: '#48D4DC',
    bgLight: 'bg-[#48D4DC]/15',
    textColor: 'text-[#0E949E]',
  },
  {
    stage: 5,
    name: 'Test',
    subtitle: 'Chapter Quiz',
    description: 'Test your knowledge with questions based on your uploaded material.',
    xpReward: 100,
    color: '#10B981',
    bgLight: 'bg-emerald-500/10',
    textColor: 'text-emerald-600',
  },
];

export function calculateLevelFromXp(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  const xpPerLevel = 150;
  const level = Math.max(1, Math.floor(xp / xpPerLevel) + 1);
  const currentLevelXp = xp % xpPerLevel;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / xpPerLevel) * 100));
  return {
    level,
    currentLevelXp,
    nextLevelXp: xpPerLevel,
    progressPercent,
  };
}
