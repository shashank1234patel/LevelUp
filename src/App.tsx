/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import {
  Home,
  BookOpen,
  Upload,
  Map,
  Trophy,
  Sparkles,
  Settings,
  Search,
  Bell,
  GraduationCap,
  Check,
  Award,
  LogOut,
  Menu,
  X,
  Trash2,
} from 'lucide-react';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  ActivePage,
  ChapterBlueprint,
  DifficultyLevel,
  SubjectCategory,
  UserProfile,
} from './types';
import {
  LEVELUP_BADGES,
  STAGE_METADATA,
  SUBJECT_THEMES,
  getSubjectTheme,
  calculateLevelFromXp,
} from './data/presets';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { WorldMapCanvas } from './components/WorldMapCanvas';
import { UploadMaterialView } from './components/UploadMaterialView';
import { BlueprintView } from './components/BlueprintView';
import { StageWorkspaceView } from './components/StageWorkspaceView';
import {
  AchievementsView,
  AiTutorPageView,
  ProfileAndProgressView,
} from './components/SecondaryViews';

const INITIAL_EMPTY_PROFILE: UserProfile = {
  userId: 'personal_learner',
  displayName: 'Learner',
  avatarUrl: 'wizard',
  level: 1,
  xp: 0,
  streak: 0,
  chaptersCompleted: 0,
  totalStudyMinutes: 0,
  totalQuizzesTaken: 0,
  averageTestScore: 0,
  dailyChallengeCompletedDate: '',
  unlockedBadges: [],
};

const createInteractiveSubjectBlueprint = (
  subjectInput: string
): ChapterBlueprint => {
  const validSubjects: SubjectCategory[] = [
    'Science',
    'Mathematics',
    'Computer Science',
    'History',
    'Literature',
    'Economics',
  ];
  const subject: SubjectCategory = validSubjects.includes(
    subjectInput as SubjectCategory
  )
    ? (subjectInput as SubjectCategory)
    : 'Science';
  const theme = getSubjectTheme(subject);

  return {
    id: `interactive_${subject.toLowerCase().replace(/\s+/g, '_')}`,
    userId: 'personal_learner',
    title: `${subject}: ${theme.themeName}`,
    subject,
    difficulty: 'Beginner',
    estimatedMinutes: 15,
    sourceSummary: theme.subtitle,
    currentStage: 1,
    completedStages: [],
    understoodTopicIds: [],
    progressPercent: 0,
    testScore: 0,
    xpEarned: 0,
    status: 'in_progress',
    topics: [
      {
        id: 'topic_1',
        title: `Core Foundations of ${subject}`,
        summary: `Essential building blocks and first principles in ${subject}.`,
        estimatedMinutes: 5,
        subtopics: [
          `Key definitions in ${subject}`,
          'How core ideas connect together',
          'Common patterns to recognize',
        ],
      },
      {
        id: 'topic_2',
        title: `Practical Applications`,
        summary: `How ${subject} concepts work in everyday situations.`,
        estimatedMinutes: 5,
        subtopics: [
          'Step-by-step problem solving',
          'Real-world examples and use cases',
        ],
      },
      {
        id: 'topic_3',
        title: `Review & Mastery Check`,
        summary: `Synthesizing the main ideas to build lasting understanding.`,
        estimatedMinutes: 5,
        subtopics: [
          'Connecting cause and effect',
          'Avoiding common mistakes',
        ],
      },
    ],
    explanations: [
      {
        topicId: 'topic_1',
        title: `Core Foundations of ${subject}`,
        simpleExplanation: `${subject} becomes easy to understand when you break big ideas into small, connected steps.`,
        realWorldExample: `Just like following a map through ${theme.themeName}, each concept guides you naturally to the next checkpoint.`,
        keyConcept: `Master the core foundation first, and every advanced topic becomes much simpler.`,
        visualAnalogy: `Picture ${theme.themeName} where each stepping stone supports the next bridge forward.`,
      },
      {
        topicId: 'topic_2',
        title: `Practical Applications`,
        simpleExplanation: `Once you know the core rule, you can apply it to solve real problems quickly and confidently.`,
        realWorldExample: `Observing how patterns repeat in ${subject} lets you predict outcomes before calculating them.`,
        keyConcept: `Always connect theory to a real-life example you can picture clearly.`,
        visualAnalogy: `Like using a compass on a trail—once calibrated, it points you in the right direction anywhere.`,
      },
      {
        topicId: 'topic_3',
        title: `Review & Mastery Check`,
        simpleExplanation: `Reviewing how the pieces fit together turns short-term notes into permanent skill.`,
        realWorldExample: `Explaining a concept in your own words is the fastest way to verify you truly understand it.`,
        keyConcept: `Simple recall + clear connections = complete chapter mastery.`,
        visualAnalogy: `Viewing the entire world map from the summit after climbing each stage.`,
      },
    ],
    revisionNotes: [
      `Start with the core definition and purpose of ${subject}.`,
      `Link every new concept to a concrete real-world example.`,
      `Use the visual mind map in Stage 4 to see how topics connect.`,
      `Test your recall with flashcards before taking the Stage 5 quiz.`,
    ],
    flashcards: [
      {
        id: 'fc_1',
        term: `What is the best way to approach ${subject}?`,
        definition: `Break complex material into small stages: Topics, Explanation, Revision, Mind Maps, and Test.`,
        category: 'Core Strategy',
      },
      {
        id: 'fc_2',
        term: `Why use real-world examples?`,
        definition: `Connecting abstract ideas to everyday experiences makes them effortless to remember.`,
        category: 'Application',
      },
      {
        id: 'fc_3',
        term: `How do Mind Maps help in Stage 4?`,
        definition: `They show how individual subtopics branch out from the central chapter concept.`,
        category: 'Visual Learning',
      },
    ],
    mindMap: {
      rootLabel: `${subject} Mastery`,
      branches: [
        {
          id: 'branch_1',
          label: '1. Core Concepts',
          color: '#6546F5',
          nodes: [
            {
              id: 'n_1',
              label: 'Key Definitions',
              detail: `The fundamental vocabulary of ${subject}.`,
            },
            {
              id: 'n_2',
              label: 'First Principles',
              detail: 'The main rules everything else builds upon.',
            },
          ],
        },
        {
          id: 'branch_2',
          label: '2. Real-World Use',
          color: '#398BFF',
          nodes: [
            {
              id: 'n_3',
              label: 'Everyday Examples',
              detail: 'Seeing the concept in action around you.',
            },
            {
              id: 'n_4',
              label: 'Problem Solving',
              detail: 'Applying steps clearly from start to finish.',
            },
          ],
        },
        {
          id: 'branch_3',
          label: '3. Connections',
          color: '#10B981',
          nodes: [
            {
              id: 'n_5',
              label: 'Cause & Effect',
              detail: 'Understanding why one step leads to the next.',
            },
          ],
        },
        {
          id: 'branch_4',
          label: '4. Quick Recall',
          color: '#F36FA5',
          nodes: [
            {
              id: 'n_6',
              label: 'Key Takeaways',
              detail: 'Summarizing the chapter in simple words.',
            },
          ],
        },
      ],
    },
    quizQuestions: [
      {
        id: 'q_1',
        type: 'MCQ',
        question: `What is the first step when learning a new chapter in ${subject}?`,
        options: [
          'Explore the key Topics & Subtopics in Stage 1',
          'Skip straight to the final exam without reading',
          'Memorize random pages out of order',
          'Ignore real-world examples',
        ],
        correctIndex: 0,
        explanation:
          'Starting with Stage 1 (Topics) gives you a clear roadmap of what you are about to learn.',
        topicTag: 'Stage 1 Roadmap',
      },
      {
        id: 'q_2',
        type: 'MCQ',
        question: 'How does Stage 2 (Explanation) make tough concepts simple?',
        options: [
          'By using plain language, real-life examples, and visual analogies',
          'By using long, complicated jargon',
          'By hiding the key takeaways',
          'By removing all examples',
        ],
        correctIndex: 0,
        explanation:
          'Simple words paired with real-world examples and analogies make any concept click immediately.',
        topicTag: 'Simple Explanations',
      },
      {
        id: 'q_3',
        type: 'MCQ',
        question: 'What is the benefit of the Visual Mind Map in Stage 4?',
        options: [
          'It visually connects the central topic to its main branches and sub-ideas',
          'It deletes your revision notes',
          'It locks previous stages',
          'It hides topic connections',
        ],
        correctIndex: 0,
        explanation:
          'Mind maps help your brain see how every branch connects back to the core topic.',
        topicTag: 'Mind Maps',
      },
    ],
  };
};

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('stage');
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_EMPTY_PROFILE);
  const [chapters, setChapters] = useState<ChapterBlueprint[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [activeStageNumber, setActiveStageNumber] = useState<number>(1);
  const [showResultsCelebration, setShowResultsCelebration] = useState(false);

  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastBanner, setToastBanner] = useState<{
    title: string;
    subtitle: string;
    xp: number;
  } | null>(null);

  const activeChapter =
    chapters.find((c) => c.id === selectedChapterId) ||
    chapters[0] ||
    createInteractiveSubjectBlueprint(
      selectedSubjectFilter === 'All' ? 'Science' : selectedSubjectFilter
    );

  const triggerCelebration = (title: string, subtitle: string, xp: number) => {
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.65 },
      });
    } catch {
      // Ignore confetti errors in headless environments
    }
    setToastBanner({ title, subtitle, xp });
    setTimeout(() => {
      setToastBanner(null);
    }, 4000);
  };

  // 1. Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFbUser(currentUser);
      setIsAuthReady(true);

      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            const newProfile = {
              userId: currentUser.uid,
              displayName: (currentUser.displayName || 'Learner').slice(0, 80),
              avatarUrl: (currentUser.photoURL || 'wizard').slice(0, 500),
              level: 1,
              xp: 0,
              streak: 0,
              chaptersCompleted: 0,
              totalStudyMinutes: 0,
              totalQuizzesTaken: 0,
              averageTestScore: 0,
              dailyChallengeCompletedDate: '',
              unlockedBadges: [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(userRef, newProfile);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore Listeners when authenticated
  useEffect(() => {
    if (!isAuthReady || !fbUser) return;

    const userDocRef = doc(db, 'users', fbUser.uid);
    const unsubProfile = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setUserProfile(snapshot.data() as UserProfile);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}`);
      }
    );

    const legacyAutoSeededId = `chap_${fbUser.uid.slice(0, 12)}_1`;
    const chaptersQuery = query(
      collection(db, 'chapters'),
      where('userId', '==', fbUser.uid)
    );
    const unsubChapters = onSnapshot(
      chaptersQuery,
      (snapshot) => {
        const userDocs = snapshot.docs.filter((d) => {
          if (d.id === legacyAutoSeededId) {
            deleteDoc(doc(db, 'chapters', d.id)).catch(() => {});
            return false;
          }
          return true;
        });

        const loaded: ChapterBlueprint[] = userDocs.map((d) => ({
          ...(d.data() as Omit<ChapterBlueprint, 'id'>),
          id: d.id,
        }));
        setChapters(loaded);
        setSelectedChapterId((prev) =>
          loaded.some((c) => c.id === prev) ? prev : loaded[0]?.id || ''
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'chapters');
      }
    );

    return () => {
      unsubProfile();
      unsubChapters();
    };
  }, [isAuthReady, fbUser]);

  // Helper to award XP & badges and persist to Firestore
  const awardUserXpAndBadges = async (
    xpDelta: number,
    newBadgeIds: string[] = [],
    options?: {
      incrementChapterCompleted?: boolean;
      newTestScore?: number;
      dailyChallengeDate?: string;
    }
  ) => {
    const nextXp = Math.min(10000000, userProfile.xp + xpDelta);
    const nextLevelInfo = calculateLevelFromXp(nextXp);
    const mergedBadges = Array.from(
      new Set([
        ...userProfile.unlockedBadges,
        ...newBadgeIds,
        ...(nextXp >= 500 ? ['learning_legend'] : []),
      ])
    ).slice(0, 20);

    const nextChaptersCompleted = options?.incrementChapterCompleted
      ? userProfile.chaptersCompleted + 1
      : userProfile.chaptersCompleted;

    const nextQuizzesTaken =
      typeof options?.newTestScore === 'number'
        ? userProfile.totalQuizzesTaken + 1
        : userProfile.totalQuizzesTaken;

    const nextAvgScore =
      typeof options?.newTestScore === 'number'
        ? userProfile.totalQuizzesTaken === 0
          ? options.newTestScore
          : Math.round(
              (userProfile.averageTestScore * userProfile.totalQuizzesTaken +
                options.newTestScore) /
                nextQuizzesTaken
            )
        : userProfile.averageTestScore;

    const nextDailyDate =
      options?.dailyChallengeDate ?? userProfile.dailyChallengeCompletedDate;

    const updatedProfile: UserProfile = {
      ...userProfile,
      level: nextLevelInfo.level,
      xp: nextXp,
      chaptersCompleted: nextChaptersCompleted,
      totalQuizzesTaken: nextQuizzesTaken,
      averageTestScore: Math.max(0, Math.min(100, nextAvgScore)),
      dailyChallengeCompletedDate: nextDailyDate,
      unlockedBadges: mergedBadges,
    };

    setUserProfile(updatedProfile);

    if (fbUser) {
      const userRef = doc(db, 'users', fbUser.uid);
      try {
        await updateDoc(userRef, {
          level: updatedProfile.level,
          xp: updatedProfile.xp,
          streak: updatedProfile.streak,
          chaptersCompleted: updatedProfile.chaptersCompleted,
          totalStudyMinutes: updatedProfile.totalStudyMinutes,
          totalQuizzesTaken: updatedProfile.totalQuizzesTaken,
          averageTestScore: updatedProfile.averageTestScore,
          dailyChallengeCompletedDate: updatedProfile.dailyChallengeCompletedDate,
          unlockedBadges: updatedProfile.unlockedBadges,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${fbUser.uid}`);
      }
    }
  };

  // Delete an uploaded chapter
  const handleDeleteChapter = async (chapterId: string) => {
    setChapters((prev) => {
      const remaining = prev.filter((c) => c.id !== chapterId);
      if (selectedChapterId === chapterId) {
        setSelectedChapterId(remaining[0]?.id || '');
      }
      return remaining;
    });

    if (fbUser) {
      try {
        await deleteDoc(doc(db, 'chapters', chapterId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `chapters/${chapterId}`);
      }
    }
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setActivePage('dashboard');
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Google sign-in popup was closed. You can try again or continue below.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  // Guest / Onboarding Sign-In
  const handleDemoSignIn = (displayName: string, _goalSubject: string) => {
    setUserProfile({
      ...INITIAL_EMPTY_PROFILE,
      displayName: displayName.slice(0, 80),
    });
    setChapters([]);
    setSelectedChapterId('');
    setActivePage('dashboard');
  };

  // Generate New AI Learning Blueprint
  const handleGenerateBlueprint = async (payload: {
    title: string;
    subject: SubjectCategory;
    difficulty: DifficultyLevel;
    content: string;
    fileBase64?: string;
    mimeType?: string;
  }) => {
    setIsGeneratingBlueprint(true);
    setUploadError(null);
    setGenerationStep('Reading your material & extracting topics...');

    try {
      const stepTimer = setTimeout(() => {
        setGenerationStep('Building explanations, flashcards, mind map & quiz...');
      }, 1800);

      const response = await fetch('/api/blueprint/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      clearTimeout(stepTimer);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate AI learning blueprint.');
      }

      const generated = await response.json();
      const newChapterId = `chap_${Date.now()}`;
      const ownerUid = fbUser?.uid || userProfile.userId;

      const newChapter: ChapterBlueprint = {
        id: newChapterId,
        userId: ownerUid,
        title: generated.title,
        subject: generated.subject,
        difficulty: generated.difficulty,
        estimatedMinutes: generated.estimatedMinutes,
        sourceSummary: generated.sourceSummary,
        currentStage: 1,
        completedStages: [],
        understoodTopicIds: [],
        progressPercent: 0,
        testScore: 0,
        xpEarned: 0,
        status: 'in_progress',
        topics: generated.topics,
        explanations: generated.explanations,
        revisionNotes: generated.revisionNotes,
        flashcards: generated.flashcards,
        mindMap: generated.mindMap,
        quizQuestions: generated.quizQuestions,
      };

      if (fbUser) {
        const chapRef = doc(db, 'chapters', newChapterId);
        try {
          const { id: _omitId, ...firestoreData } = newChapter;
          await setDoc(chapRef, {
            ...firestoreData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `chapters/${newChapterId}`);
        }
      } else {
        setChapters((prev) => [newChapter, ...prev]);
      }

      setSelectedChapterId(newChapterId);
      setActivePage('blueprint');
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Error generating blueprint.'
      );
    } finally {
      setIsGeneratingBlueprint(false);
      setGenerationStep('');
    }
  };

  // Mark Topic as Understood (+10 XP in Stage 1, +15 XP in Stage 2)
  const handleToggleTopicUnderstood = async (topicId: string, xpDelta: number) => {
    if (!activeChapter) return;
    const alreadyUnderstood = activeChapter.understoodTopicIds.includes(topicId);
    if (alreadyUnderstood) return;

    const nextUnderstood = [...activeChapter.understoodTopicIds, topicId].slice(0, 30);
    const nextXpEarned = Math.min(5000, activeChapter.xpEarned + xpDelta);
    const nextProgress = Math.min(95, activeChapter.progressPercent + 5);

    const updatedChapter: ChapterBlueprint = {
      ...activeChapter,
      understoodTopicIds: nextUnderstood,
      xpEarned: nextXpEarned,
      progressPercent: nextProgress,
    };

    setChapters((prev) =>
      prev.some((c) => c.id === activeChapter.id)
        ? prev.map((c) => (c.id === activeChapter.id ? updatedChapter : c))
        : [updatedChapter, ...prev]
    );
    setSelectedChapterId(activeChapter.id);

    if (
      fbUser &&
      !activeChapter.id.startsWith('interactive_') &&
      activeChapter.status !== 'completed'
    ) {
      const chapRef = doc(db, 'chapters', activeChapter.id);
      try {
        await updateDoc(chapRef, {
          currentStage: updatedChapter.currentStage,
          completedStages: updatedChapter.completedStages,
          understoodTopicIds: updatedChapter.understoodTopicIds,
          progressPercent: updatedChapter.progressPercent,
          testScore: updatedChapter.testScore,
          xpEarned: updatedChapter.xpEarned,
          status: updatedChapter.status,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `chapters/${activeChapter.id}`);
      }
    }

    const extraBadges = nextUnderstood.length >= 4 ? ['topic_explorer'] : [];
    await awardUserXpAndBadges(xpDelta, extraBadges);
    triggerCelebration('Concept Mastered!', 'Marked as understood.', xpDelta);
  };

  // Complete a Stage Checkpoint (Stages 1..5)
  const handleCompleteStage = async (stageNumber: number, quizScore?: number) => {
    if (!activeChapter) return;

    const stageRewards: Record<number, number> = {
      1: 50,
      2: 60,
      3: 70,
      4: 70,
      5: 130,
    };

    const xpEarnedDelta = stageRewards[stageNumber] || 50;
    const nextCompletedStages = Array.from(
      new Set([...activeChapter.completedStages, stageNumber])
    )
      .sort((a, b) => a - b)
      .slice(0, 5);

    const nextCurrentStage = Math.min(
      5,
      Math.max(activeChapter.currentStage, stageNumber + 1)
    );
    const isFullChapterComplete = stageNumber === 5 || nextCompletedStages.length >= 5;
    const nextProgress = isFullChapterComplete
      ? 100
      : Math.min(95, nextCompletedStages.length * 20);
    const nextStatus: 'in_progress' | 'completed' = isFullChapterComplete
      ? 'completed'
      : 'in_progress';
    const nextTestScore =
      typeof quizScore === 'number' ? quizScore : activeChapter.testScore;
    const nextChapterXp = Math.min(5000, activeChapter.xpEarned + xpEarnedDelta);

    const updatedChapter: ChapterBlueprint = {
      ...activeChapter,
      currentStage: nextCurrentStage,
      completedStages: nextCompletedStages,
      progressPercent: nextProgress,
      testScore: nextTestScore,
      xpEarned: nextChapterXp,
      status: nextStatus,
    };

    setChapters((prev) =>
      prev.some((c) => c.id === activeChapter.id)
        ? prev.map((c) => (c.id === activeChapter.id ? updatedChapter : c))
        : [updatedChapter, ...prev]
    );
    setSelectedChapterId(activeChapter.id);

    if (
      fbUser &&
      !activeChapter.id.startsWith('interactive_') &&
      activeChapter.status !== 'completed'
    ) {
      const chapRef = doc(db, 'chapters', activeChapter.id);
      try {
        await updateDoc(chapRef, {
          currentStage: updatedChapter.currentStage,
          completedStages: updatedChapter.completedStages,
          understoodTopicIds: updatedChapter.understoodTopicIds,
          progressPercent: updatedChapter.progressPercent,
          testScore: updatedChapter.testScore,
          xpEarned: updatedChapter.xpEarned,
          status: updatedChapter.status,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `chapters/${activeChapter.id}`);
      }
    }

    const earnedBadges: string[] = ['quick_learner'];
    if (stageNumber === 3) earnedBadges.push('revision_master');
    if (stageNumber === 4) earnedBadges.push('mind_mapper');
    if (stageNumber === 5) {
      earnedBadges.push('chapter_master');
      if ((quizScore ?? 100) >= 80) earnedBadges.push('quiz_champion');
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    await awardUserXpAndBadges(xpEarnedDelta, earnedBadges, {
      incrementChapterCompleted: isFullChapterComplete,
      newTestScore: stageNumber === 5 ? nextTestScore : undefined,
      dailyChallengeDate: todayStr,
    });

    if (stageNumber === 5) {
      setShowResultsCelebration(true);
      triggerCelebration(
        'Chapter Completed!',
        `You conquered all 5 stages of ${activeChapter.title}!`,
        xpEarnedDelta
      );
    } else {
      setActiveStageNumber(stageNumber + 1);
      triggerCelebration(
        `Stage ${stageNumber} Complete!`,
        `Unlocked Stage ${stageNumber + 1} checkpoint.`,
        xpEarnedDelta
      );
    }
  };

  // Profile Settings Update
  const handleUpdateProfile = async (displayName: string, avatarUrl: string) => {
    const cleanName = displayName.slice(0, 80);
    const cleanAvatar = avatarUrl.slice(0, 500);
    setUserProfile((prev) => ({
      ...prev,
      displayName: cleanName,
      avatarUrl: cleanAvatar,
    }));

    if (fbUser) {
      const userRef = doc(db, 'users', fbUser.uid);
      try {
        await updateDoc(userRef, {
          displayName: cleanName,
          avatarUrl: cleanAvatar,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${fbUser.uid}`);
      }
    }
  };

  // Render Page 1: Landing Page
  if (activePage === 'landing') {
    return (
      <LandingPage
        onStartLearning={() => setActivePage(fbUser ? 'dashboard' : 'auth')}
        onExploreHowItWorks={() => {
          const el = document.getElementById('how-it-works');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    );
  }

  // Render Page 2: Authentication & Onboarding
  if (activePage === 'auth') {
    return (
      <AuthPage
        onGoogleSignIn={handleGoogleSignIn}
        onDemoSignIn={handleDemoSignIn}
        onBackToLanding={() => setActivePage('landing')}
        authError={authError}
        isSigningIn={isSigningIn}
      />
    );
  }

  const levelInfo = calculateLevelFromXp(userProfile.xp);

  const filteredChapters = chapters.filter((c) => {
    const matchesSearch =
      !searchQuery.trim() ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubj =
      selectedSubjectFilter === 'All' || c.subject === selectedSubjectFilter;
    return matchesSearch && matchesSubj;
  });

  const navItems: Array<{
    id: ActivePage;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'dashboard', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'my-learning', label: 'Courses', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'upload', label: 'Upload', icon: <Upload className="w-4 h-4" /> },
    { id: 'journey', label: 'Journey', icon: <Map className="w-4 h-4" /> },
    { id: 'ai-tutor', label: 'AI Tutor', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'achievements', label: 'Achievement', icon: <Trophy className="w-4 h-4" /> },
    { id: 'settings', label: 'Setting', icon: <Settings className="w-4 h-4" /> },
  ];

  const subjectTabs = [
    { id: 'All', label: 'All Subjects', emoji: '📚' },
    { id: 'Literature', label: 'Literature', emoji: '📖' },
    { id: 'Science', label: 'Science', emoji: '🌍' },
    { id: 'Mathematics', label: 'Mathematics', emoji: '🧮' },
    { id: 'Computer Science', label: 'Computer Science', emoji: '💻' },
    { id: 'History', label: 'History', emoji: '🏛️' },
    { id: 'Economics', label: 'Economics', emoji: '📊' },
  ];

  const badgeUnlockPercent = Math.round(
    (userProfile.unlockedBadges.length / Math.max(1, LEVELUP_BADGES.length)) * 100
  );

  const currentPreviewTheme = getSubjectTheme(
    selectedSubjectFilter !== 'All'
      ? selectedSubjectFilter
      : activeChapter?.subject || 'Science'
  );

  // Reusable Empty State with Animated Subject-Specific World Theme
  const renderEmptyMaterialState = () => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs text-center space-y-4"
    >
      <div className="flex items-center justify-between text-left">
        <div>
          <h2 className="text-lg font-bold text-[#1E293B]">
            {currentPreviewTheme.emoji} {currentPreviewTheme.themeName}
          </h2>
          <p className="text-xs text-[#64748B]">
            {currentPreviewTheme.subtitle}
          </p>
        </div>
        <span className="text-xs font-semibold text-[#2563EB]">
          {currentPreviewTheme.subject} Theme
        </span>
      </div>

      <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200/70">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentPreviewTheme.subject}
            src={currentPreviewTheme.image}
            alt={currentPreviewTheme.themeName}
            initial={{ scale: 1.06, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0.7 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-white space-y-3">
          <div
            className="animate-float w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg"
            style={{ color: currentPreviewTheme.accentHex }}
          >
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">
            Start Your {currentPreviewTheme.subject} Journey
          </h3>
          <p className="text-xs sm:text-sm text-white/90 max-w-md">
            Upload a PDF, paste your study notes, or enter any topic to unlock this 5-stage adventure map.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setActivePage('upload')}
            style={{ backgroundColor: currentPreviewTheme.accentHex }}
            className="mt-1 px-6 py-2.5 rounded-full hover:opacity-95 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Study Material</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  const subjectThemeShowcaseList =
    selectedSubjectFilter === 'All'
      ? [
          SUBJECT_THEMES.Literature,
          SUBJECT_THEMES.Science,
          SUBJECT_THEMES.Mathematics,
          SUBJECT_THEMES['Computer Science'],
          SUBJECT_THEMES.History,
          SUBJECT_THEMES.Economics,
        ]
      : [getSubjectTheme(selectedSubjectFilter)];

  return (
    <div className="min-h-screen bg-[#F3F5F9] text-[#1E293B] flex flex-col">
      {/* Animated Celebration Toast */}
      <AnimatePresence>
        {toastBanner && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-5 py-4 rounded-2xl shadow-2xl border border-white/15 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">{toastBanner.title}</p>
              <p className="text-xs text-white/75">{toastBanner.subtitle}</p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-amber-400 text-[#1E293B] text-xs font-bold tabular-nums">
              +{toastBanner.xp} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#F3F5F9]/95 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          {/* Left Brand Pill */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2.5 rounded-full bg-white text-[#1E293B] shadow-xs"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => setActivePage('dashboard')}
              className="px-5 py-2.5 rounded-full bg-white shadow-xs flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-base font-bold font-display text-[#1E293B]">
                LevelUp
              </span>
            </motion.button>
          </div>

          {/* Center Horizontal Pill Navigation Bar */}
          <nav className="hidden lg:flex items-center gap-1 px-4 py-1.5 rounded-full bg-white shadow-xs">
            {navItems.map((item) => {
              const isCurrent =
                activePage === item.id ||
                (item.id === 'journey' &&
                  (activePage === 'blueprint' || activePage === 'stage'));
              return (
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setShowResultsCelebration(false);
                    setActivePage(item.id);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    isCurrent
                      ? 'text-[#2563EB] font-bold bg-blue-50/70'
                      : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  <span className={isCurrent ? 'text-[#2563EB]' : 'text-[#64748B]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Right Search + Notification + Avatar Pill */}
          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full shadow-xs">
            <div className="relative hidden sm:block w-48 md:w-56">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search here..."
                className="w-full pl-9 pr-4 py-2 rounded-full bg-[#F3F5F9] text-xs text-[#1E293B] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications((prev) => !prev)}
                className="w-9 h-9 rounded-full bg-[#F3F5F9] hover:bg-slate-200/70 text-[#1E293B] flex items-center justify-center relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {activeChapter && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl p-4 space-y-2.5 z-50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#1E293B]">Notifications</p>
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="text-[11px] text-[#2563EB] font-semibold cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F3F5F9] text-xs text-[#64748B]">
                    {activeChapter
                      ? `Stage ${activeChapter.currentStage} of "${activeChapter.title}" is ready.`
                      : 'Upload your study material to generate an AI learning blueprint.'}
                  </div>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setActivePage('profile')}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#38BDF8] text-white font-bold text-xs flex items-center justify-center ring-2 ring-pink-200 cursor-pointer"
              title={userProfile.displayName}
            >
              {userProfile.displayName.slice(0, 2).toUpperCase()}
            </motion.button>

            <button
              type="button"
              onClick={async () => {
                if (fbUser) {
                  await signOut(auth);
                }
                setActivePage('landing');
              }}
              className="p-2 rounded-full text-[#64748B] hover:text-rose-600 cursor-pointer"
              title="Exit"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 p-3 rounded-3xl bg-white shadow-lg border border-slate-100 grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setShowResultsCelebration(false);
                  setActivePage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  activePage === item.id
                    ? 'bg-blue-50 text-[#2563EB]'
                    : 'text-[#64748B]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-8 pb-10 max-w-[1400px] w-full mx-auto">
        {/* PAGE 3: MAIN DASHBOARD */}
        {activePage === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Main Column (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {activeChapter ? (
                <WorldMapCanvas
                  chapter={activeChapter}
                  chapters={chapters}
                  onSelectChapter={(id) => setSelectedChapterId(id)}
                  onOpenStage={(stageNum) => {
                    setShowResultsCelebration(false);
                    setActiveStageNumber(stageNum);
                    setActivePage('stage');
                  }}
                  onViewBlueprint={() => setActivePage('blueprint')}
                  overrideSubjectTheme={selectedSubjectFilter}
                  compact
                />
              ) : (
                renderEmptyMaterialState()
              )}

              {/* Course Category & Subject Themes Section */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#1E293B]">
                    Course Category
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActivePage('upload')}
                    className="text-xs font-semibold text-[#64748B] hover:text-[#2563EB] cursor-pointer"
                  >
                    + Upload Material
                  </button>
                </div>

                {/* Category Pill Tabs */}
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {subjectTabs.map((tab) => {
                    const isSelected = selectedSubjectFilter === tab.id;
                    const tabTheme =
                      tab.id === 'All' ? null : getSubjectTheme(tab.id);
                    return (
                      <motion.button
                        whileHover={{ y: -2, scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubjectFilter(tab.id);
                          const matchingChap = chapters.find(
                            (c) => tab.id === 'All' || c.subject === tab.id
                          );
                          if (matchingChap) {
                            setSelectedChapterId(matchingChap.id);
                          }
                        }}
                        style={
                          isSelected && tabTheme
                            ? { borderColor: tabTheme.accentHex }
                            : undefined
                        }
                        className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                          isSelected
                            ? 'bg-blue-50/70 border-[#2563EB] text-[#1E293B] shadow-2xs'
                            : 'bg-white border-slate-200 text-[#64748B] hover:border-slate-300'
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-[#F3F5F9] flex items-center justify-center text-xs">
                          {tab.emoji}
                        </span>
                        <span>{tab.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Uploaded Chapters OR Subject Theme Worlds Grid */}
                {filteredChapters.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredChapters.map((chap, idx) => {
                      const chapTheme = getSubjectTheme(chap.subject);
                      return (
                        <motion.div
                          key={chap.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: idx * 0.06 }}
                          whileHover={{ y: -6, scale: 1.015 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedChapterId(chap.id);
                            setShowResultsCelebration(false);
                            setActiveStageNumber(chap.currentStage);
                            setActivePage('stage');
                          }}
                          className="p-3.5 rounded-3xl bg-white border border-slate-100 shadow-xs hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between space-y-3.5 group"
                        >
                          <div className="space-y-3">
                            <div className="relative h-32 rounded-2xl overflow-hidden bg-slate-100">
                              <img
                                src={chapTheme.image}
                                alt={chap.title}
                                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteChapter(chap.id);
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-slate-600 hover:text-rose-600 shadow-xs"
                                title="Remove Chapter"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="px-1 space-y-0.5">
                              <h3 className="text-sm font-bold text-[#1E293B] line-clamp-1">
                                {chap.title}
                              </h3>
                              <p className="text-[11px] text-[#64748B]">
                                {chapTheme.emoji} {chap.subject} · {chapTheme.themeName}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 px-1 pb-1">
                            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${chap.progressPercent}%` }}
                                transition={{ duration: 0.7, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor: chapTheme.accentHex,
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-[#64748B] tabular-nums">
                              <span>
                                Complete:{' '}
                                <strong className="text-[#1E293B]">
                                  {chap.progressPercent}%
                                </strong>
                              </span>
                              <span>
                                Stage:{' '}
                                <strong className="text-[#1E293B]">
                                  {chap.completedStages.length}/5
                                </strong>
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {subjectThemeShowcaseList.map((themeItem, idx) => {
                      const subjectChapters = chapters.filter(
                        (c) => c.subject === themeItem.subject
                      );
                      const completedInSubj = subjectChapters.filter(
                        (c) => c.status === 'completed'
                      ).length;
                      const pct =
                        subjectChapters.length > 0
                          ? Math.round(
                              subjectChapters.reduce(
                                (acc, c) => acc + c.progressPercent,
                                0
                              ) / subjectChapters.length
                            )
                          : 0;

                      return (
                        <motion.div
                          key={themeItem.subject}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: idx * 0.06 }}
                          whileHover={{ y: -6, scale: 1.015 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedSubjectFilter(themeItem.subject);
                            setSelectedChapterId('');
                            setShowResultsCelebration(false);
                            setActiveStageNumber(1);
                            setActivePage('stage');
                          }}
                          className="p-3.5 rounded-3xl bg-white border border-slate-100 shadow-xs hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between space-y-3.5 group"
                        >
                          <div className="space-y-3">
                            <div className="relative h-32 rounded-2xl overflow-hidden bg-slate-100">
                              <img
                                src={themeItem.image}
                                alt={themeItem.themeName}
                                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                              />
                            </div>

                            <div className="px-1 space-y-0.5">
                              <h3 className="text-sm font-bold text-[#1E293B] line-clamp-1">
                                {themeItem.subject} · {themeItem.themeName}
                              </h3>
                              <p className="text-[11px] text-[#64748B] line-clamp-1">
                                {themeItem.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 px-1 pb-1">
                            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.7, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor: themeItem.accentHex,
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-[#64748B] tabular-nums">
                              <span>
                                Complete:{' '}
                                <strong className="text-[#1E293B]">{pct}%</strong>
                              </span>
                              <span>
                                Done:{' '}
                                <strong className="text-[#1E293B]">
                                  {completedInSubj}/{subjectChapters.length}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Sidebar Column (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Card 1: Performance Report */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#1E293B]">
                    Performance Report
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActivePage('profile')}
                    className="text-xs font-bold text-[#64748B] hover:text-[#1E293B] cursor-pointer"
                  >
                    •••
                  </button>
                </div>

                <div className="flex flex-col items-center text-center space-y-1.5">
                  <div className="animate-float w-18 h-18 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-pink-500 to-[#2563EB]">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-lg text-[#1E293B]">
                      {userProfile.displayName.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-[#1E293B] pt-1">
                    {userProfile.displayName}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Level {levelInfo.level}
                  </p>
                  <p className="text-xs font-bold text-[#1E293B] flex items-center gap-1 tabular-nums">
                    <span>💰</span>
                    <span>{userProfile.xp.toLocaleString()} Points</span>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-[#F8FAFC] text-center tabular-nums">
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] text-[#64748B]">Course</p>
                    <p className="text-xs font-bold text-[#1E293B]">
                      {activeChapter ? `${activeChapter.progressPercent}%` : '0%'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
                      <Award className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] text-[#64748B]">Badge</p>
                    <p className="text-xs font-bold text-[#1E293B]">
                      {badgeUnlockPercent}%
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] text-[#64748B]">Quiz Score</p>
                    <p className="text-xs font-bold text-[#1E293B]">
                      {userProfile.totalQuizzesTaken > 0
                        ? `${userProfile.averageTestScore}%`
                        : '—'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: 5-Stage Challenge Rings */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.16 }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#1E293B]">
                    Stage Challenge
                  </h2>
                  <span className="text-xs text-[#64748B]">5 Stages</span>
                </div>

                <div className="grid grid-cols-5 gap-2 text-center tabular-nums">
                  {STAGE_METADATA.map((st) => {
                    const isDone = activeChapter?.completedStages.includes(st.stage);
                    const isCurr =
                      activeChapter &&
                      !isDone &&
                      activeChapter.currentStage === st.stage;
                    return (
                      <motion.div
                        key={st.stage}
                        whileHover={{ scale: 1.08, y: -2 }}
                        className="space-y-1.5 flex flex-col items-center"
                      >
                        <span className="text-[11px] text-[#64748B] truncate max-w-[52px]">
                          {st.name.split(' ')[0]}
                        </span>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                            isDone
                              ? 'bg-[#2563EB] text-white'
                              : isCurr
                                ? 'border-2 border-[#2563EB] text-[#2563EB] bg-blue-50/50 animate-pulse'
                                : 'bg-[#F3F5F9] text-[#64748B]'
                          }`}
                        >
                          {isDone ? <Check className="w-4 h-4 stroke-[2.5]" /> : isCurr ? '50%' : '0%'}
                        </div>
                        <span className="text-[10px] text-[#64748B]">
                          {isDone ? '1/1' : '0/1'}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-amber-50/80 text-amber-700 text-[11px] font-medium flex items-center gap-2">
                  <span>🏆</span>
                  <span>
                    {activeChapter
                      ? `${activeChapter.completedStages.length} of 5 stages completed in current chapter.`
                      : 'Select any subject world or upload material to start.'}
                  </span>
                </div>
              </motion.div>

              {/* Card 3: Active Chapter Progress Bar */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.24 }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#1E293B]">
                    Chapter Progress
                  </h2>
                  <span className="text-xs font-semibold text-[#64748B] tabular-nums">
                    {chapters.length} Uploaded
                  </span>
                </div>

                <div className="flex items-center gap-2.5 tabular-nums">
                  <span className="text-xl animate-float">🎯</span>
                  <span className="text-2xl font-bold text-[#1E293B]">
                    {activeChapter ? `${activeChapter.progressPercent}%` : '0%'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 text-xs tabular-nums">
                  <div className="space-y-1">
                    <p className="font-semibold text-[#1E293B]">Topics Checked</p>
                    <p className="text-[#64748B]">
                      {activeChapter
                        ? `${activeChapter.understoodTopicIds.length} / ${activeChapter.topics.length}`
                        : '0 / 0'}
                    </p>
                  </div>
                  <div className="space-y-1 border-l border-slate-200 pl-3">
                    <p className="font-semibold text-[#1E293B]">Stages Done</p>
                    <p className="text-[#64748B]">
                      {activeChapter
                        ? `${activeChapter.completedStages.length} / 5`
                        : '0 / 5'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 h-7 rounded-lg bg-slate-100 overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${activeChapter ? Math.max(8, activeChapter.progressPercent) : 0}%`,
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-md"
                      style={{
                        backgroundColor: currentPreviewTheme.accentHex,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* MY LEARNING / COURSES VIEW */}
        {activePage === 'my-learning' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-[#1E293B]">
                My Courses
              </h1>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => setActivePage('upload')}
                className="px-5 py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer self-start"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Material</span>
              </motion.button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {subjectTabs.map((tab) => (
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedSubjectFilter(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    selectedSubjectFilter === tab.id
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-white text-[#64748B] hover:text-[#1E293B] border border-slate-200'
                  }`}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </div>

            {filteredChapters.length === 0 ? (
              renderEmptyMaterialState()
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredChapters.map((chap, idx) => {
                  const chapTheme = getSubjectTheme(chap.subject);
                  return (
                    <motion.div
                      key={chap.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: idx * 0.06 }}
                      whileHover={{ y: -6 }}
                      className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-lg transition-shadow flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        <div className="relative h-36 rounded-2xl overflow-hidden">
                          <img
                            src={chapTheme.image}
                            alt={chap.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span style={{ color: chapTheme.accentHex }}>
                            {chapTheme.emoji} {chap.subject} · {chapTheme.themeName}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteChapter(chap.id)}
                            className="text-[#64748B] hover:text-rose-600 cursor-pointer"
                            title="Delete Chapter"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h2 className="text-lg font-bold text-[#1E293B]">
                          {chap.title}
                        </h2>
                        <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                          {chap.sourceSummary}
                        </p>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${chap.progressPercent}%` }}
                            transition={{ duration: 0.7 }}
                            className="h-full"
                            style={{
                              backgroundColor: chapTheme.accentHex,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#64748B] tabular-nums">
                          <span>Complete: {chap.progressPercent}%</span>
                          <span>Stage: {chap.completedStages.length}/5</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedChapterId(chap.id);
                              setActivePage('blueprint');
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-[#F3F5F9] hover:bg-slate-200/70 text-[#1E293B] text-xs font-bold cursor-pointer"
                          >
                            Blueprint
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedChapterId(chap.id);
                              setShowResultsCelebration(false);
                              setActiveStageNumber(chap.currentStage);
                              setActivePage('stage');
                            }}
                            style={{ backgroundColor: chapTheme.accentHex }}
                            className="flex-1 py-2.5 rounded-xl hover:opacity-95 text-white text-xs font-bold cursor-pointer"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PAGE 4: UPLOAD STUDY MATERIAL */}
        {activePage === 'upload' && (
          <UploadMaterialView
            onGenerateBlueprint={handleGenerateBlueprint}
            isGenerating={isGeneratingBlueprint}
            generationStep={generationStep}
            error={uploadError}
          />
        )}

        {/* PAGE 5: AI LEARNING BLUEPRINT */}
        {activePage === 'blueprint' &&
          (activeChapter ? (
            <BlueprintView
              chapter={activeChapter}
              onOpenStage={(stageNum) => {
                setShowResultsCelebration(false);
                setActiveStageNumber(stageNum);
                setActivePage('stage');
              }}
              onOpenWorldMap={() => setActivePage('journey')}
            />
          ) : (
            renderEmptyMaterialState()
          ))}

        {/* PAGE 6: LEARNING JOURNEY / GAME MAP */}
        {activePage === 'journey' &&
          (activeChapter ? (
            <WorldMapCanvas
              chapter={activeChapter}
              chapters={chapters}
              onSelectChapter={(id) => setSelectedChapterId(id)}
              onOpenStage={(stageNum) => {
                setShowResultsCelebration(false);
                setActiveStageNumber(stageNum);
                setActivePage('stage');
              }}
              onViewBlueprint={() => setActivePage('blueprint')}
              overrideSubjectTheme={selectedSubjectFilter}
            />
          ) : (
            renderEmptyMaterialState()
          ))}

        {/* PAGE 7 & PAGE 8: LEARNING STAGE INTERFACES & RESULTS CELEBRATION */}
        {(activePage === 'stage' || activePage === 'results') &&
          (activeChapter ? (
            <StageWorkspaceView
              chapter={activeChapter}
              activeStage={activeStageNumber}
              showResultsCelebration={showResultsCelebration || activePage === 'results'}
              onSelectStage={(stageNum) => {
                setShowResultsCelebration(false);
                setActiveStageNumber(stageNum);
              }}
              onToggleTopicUnderstood={handleToggleTopicUnderstood}
              onCompleteStage={handleCompleteStage}
              onBackToMap={() => {
                setShowResultsCelebration(false);
                setActivePage('journey');
              }}
              onStartNextChapter={() => {
                setShowResultsCelebration(false);
                setActivePage('upload');
              }}
            />
          ) : (
            renderEmptyMaterialState()
          ))}

        {/* PAGE 9: ACHIEVEMENTS */}
        {activePage === 'achievements' && (
          <AchievementsView userProfile={userProfile} />
        )}

        {/* AI TUTOR */}
        {activePage === 'ai-tutor' && (
          <AiTutorPageView
            chapters={chapters}
            activeChapter={activeChapter}
            onSelectChapter={(id) => setSelectedChapterId(id)}
            onGoToUpload={() => setActivePage('upload')}
          />
        )}

        {/* PAGE 10: PROFILE & SETTINGS */}
        {(activePage === 'profile' || activePage === 'settings') && (
          <ProfileAndProgressView
            userProfile={userProfile}
            chapters={chapters}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>
    </div>
  );
}
