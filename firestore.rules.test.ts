/**
 * Security Rules Verification Suite (Phase 0 & Phase 5 Dirty Dozen Payloads)
 * Verifies that all 12 adversarial payloads defined in security_spec.md are rejected
 * with PERMISSION_DENIED by firestore.rules.
 */
export interface AdversarialPayloadTestCase {
  id: number;
  name: string;
  collection: 'users' | 'chapters';
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  authUid: string | null;
  emailVerified: boolean;
  payload?: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_PAYLOADS: AdversarialPayloadTestCase[] = [
  {
    id: 1,
    name: 'Identity Spoofing on User Create',
    collection: 'users',
    operation: 'create',
    authUid: 'user_alpha_1',
    emailVerified: true,
    payload: { userId: 'user_beta_2', displayName: 'Spoofer' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Write',
    collection: 'users',
    operation: 'create',
    authUid: 'user_alpha_1',
    emailVerified: false,
    payload: { userId: 'user_alpha_1', displayName: 'Unverified' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow Field Injection on User Update',
    collection: 'users',
    operation: 'update',
    authUid: 'user_alpha_1',
    emailVerified: true,
    payload: { displayName: 'Alex', isAdmin: true },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Cross-User Profile Read / PII Probe',
    collection: 'users',
    operation: 'get',
    authUid: 'user_beta_2',
    emailVerified: true,
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Timestamp Forgery on Create',
    collection: 'users',
    operation: 'create',
    authUid: 'user_alpha_1',
    emailVerified: true,
    payload: { userId: 'user_alpha_1', createdAt: '1999-01-01T00:00:00Z' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Immutable Field Mutation (userId / createdAt)',
    collection: 'users',
    operation: 'update',
    authUid: 'user_alpha_1',
    emailVerified: true,
    payload: { userId: 'user_hacked_99' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Orphaned Chapter Creation Without Parent User Doc',
    collection: 'chapters',
    operation: 'create',
    authUid: 'ghost_user_no_profile',
    emailVerified: true,
    payload: { userId: 'ghost_user_no_profile', title: 'Orphan Chapter' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Denial-of-Wallet String Overflow (>5000 chars)',
    collection: 'chapters',
    operation: 'create',
    authUid: 'user_alpha_1',
    emailVerified: true,
    payload: { userId: 'user_alpha_1', sourceSummary: 'X'.repeat(6000) },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Unbounded Array Injection on unlockedBadges (>20 items)',
    collection: 'users',
    operation: 'update',
    authUid: 'user_alpha_1',
    emailVerified: true,
    payload: { unlockedBadges: Array.from({ length: 25 }, (_, i) => `badge_${i}`) },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Terminal State Bypass on Completed Chapter',
    collection: 'chapters',
    operation: 'update',
    authUid: 'user_alpha_1',
    emailVerified: true,
    payload: { status: 'in_progress', xpEarned: 4999 },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Unauthorized Chapter List Scraping Across Users',
    collection: 'chapters',
    operation: 'list',
    authUid: 'user_beta_2',
    emailVerified: true,
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Value Poisoning on Whitelisted Update Key (progressPercent > 100)',
    collection: 'chapters',
    operation: 'update',
    authUid: 'user_alpha_1',
    emailVerified: true,
    payload: { progressPercent: 250 },
    expectedOutcome: 'PERMISSION_DENIED',
  },
];
