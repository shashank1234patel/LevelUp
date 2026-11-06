# Security Specification (`security_spec.md`)

## 1. Data Invariants & Relational Source of Truth

1. **Default-Deny Catch-All**: All paths not explicitly matched (`/users/{userId}` and `/chapters/{chapterId}`) are unconditionally denied (`allow read, write: if false;`).
2. **Verified Identity Gate**: Every read and write operation requires an authenticated user (`request.auth != null`) and every write operation requires a verified email token (`request.auth.token.email_verified == true`).
3. **PII Isolation & Strictly Scoped Profile Access**: `/users/{userId}` stores zero raw PII (`email`, `phone`, `address` are omitted from the schema) and is strictly readable and writable only by the document owner (`request.auth.uid == userId`). Blanket `list` queries on `/users` are disallowed.
4. **Relational Integrity (Master Gate)**: A `/chapters/{chapterId}` document can only be created if the parent `/users/$(request.auth.uid)` profile document exists (`exists(/databases/$(database)/documents/users/$(request.auth.uid))`), and its `userId` field must strictly match `request.auth.uid`.
5. **Query Enforcer on Chapters List**: `allow list` on `/chapters/{chapterId}` strictly validates `resource.data.userId == request.auth.uid`, forcing client queries to filter by `where('userId', '==', uid)`.
6. **Terminal State Locking**: Once a `/chapters/{chapterId}` document reaches `status == 'completed'`, no further updates are permitted (`existing().status != 'completed'`).
7. **Temporal & Identity Immutability**: `createdAt` and `updatedAt` must equal `request.time` on creation; `updatedAt` must equal `request.time` on update while `createdAt` and `userId` remain strictly immutable (`incoming().createdAt == existing().createdAt && incoming().userId == existing().userId`).

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 (Identity Spoofing on User Create)**: Authenticated user `uid_A` attempts to create `/users/uid_A` with `userId: "uid_B"`. -> `PERMISSION_DENIED`
2. **Payload 2 (Unverified Email Write)**: User with `email_verified: false` attempts to create `/users/uid_A`. -> `PERMISSION_DENIED`
3. **Payload 3 (Shadow Field Injection on User Update)**: User updates `/users/uid_A` including an undeclared field `isAdmin: true`. -> `PERMISSION_DENIED`
4. **Payload 4 (Cross-User Profile Read / PII Probe)**: Authenticated user `uid_B` attempts `get` on `/users/uid_A`. -> `PERMISSION_DENIED`
5. **Payload 5 (Timestamp Forgery on Create)**: User attempts to create `/users/uid_A` with a past client timestamp `createdAt: Timestamp.fromMillis(1000000)`. -> `PERMISSION_DENIED`
6. **Payload 6 (Immutable Field Mutation)**: User attempts to update `createdAt` or `userId` on `/users/uid_A`. -> `PERMISSION_DENIED`
7. **Payload 7 (Orphaned Chapter Creation)**: User `uid_no_profile` attempts to create `/chapters/chap_1` before `/users/uid_no_profile` exists in Firestore. -> `PERMISSION_DENIED`
8. **Payload 8 (Denial-of-Wallet String Overflow)**: User attempts to create `/chapters/chap_1` with a 20,000-character `sourceSummary` or a 500-character `chapterId`. -> `PERMISSION_DENIED`
9. **Payload 9 (Unbounded Array Injection)**: User attempts to update `/users/uid_A` with `unlockedBadges` containing 50 elements (exceeding limit of 20) or integer elements instead of strings. -> `PERMISSION_DENIED`
10. **Payload 10 (Terminal State Bypass)**: User attempts to update `/chapters/chap_completed` when `existing().status == 'completed'`. -> `PERMISSION_DENIED`
11. **Payload 11 (Unauthorized Chapter List Scraping)**: User executes an unfiltered `getDocs(collection(db, 'chapters'))` trying to read chapters where `resource.data.userId != request.auth.uid`. -> `PERMISSION_DENIED`
12. **Payload 12 (Value Poisoning on Action Update)**: User updates whitelisted key `progressPercent` on `/chapters/chap_1` with a string `"100%"` or out-of-range integer `250`. -> `PERMISSION_DENIED`
