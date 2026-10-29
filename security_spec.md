# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Public Portfolio Read / Admin-Only Write (`/portfolio/{docId}`)**:
   - Anyone can fetch a single portfolio document (`get`) if `docId` is a valid ID (`isValidId(docId)`).
   - ONLY the verified site owner/admin (`request.auth != null && request.auth.token.email_verified == true && request.auth.token.email == 'solijonsolayev2003@gmail.com'`) can `create` or `update` `/portfolio/{docId}`.
   - Strangers, unauthenticated visitors, or non-admin signed-in users are strictly denied `create`, `update`, and `delete` on `/portfolio/{docId}`.
   - `ownerUid` must equal `request.auth.uid` on write, and `updatedAt` must equal `request.time`.
   - All strings have explicit `.size()` bounds and all arrays (`metrics`, `services`, `skillGroups`, `projects`, `experience`, `blogPosts`) have explicit `.size()` bounds (`<= 10`, `<= 20`, or `<= 30`) to prevent Denial of Wallet attacks.

2. **Client Inquiries (`/inquiries/{inquiryId}`)**:
   - Visitors can `create` a new inquiry document if `isValidId(inquiryId)`, `isValidInquiry(incoming())`, `incoming().status == 'new'`, `incoming().recipientEmail == 'solijonsolayev2003@gmail.com'`, `incoming().createdAt == request.time`, and `incoming().updatedAt == request.time`.
   - Strangers/visitors CANNOT `get`, `list`, `update`, or `delete` any document in `/inquiries/{inquiryId}` (PII isolation).
   - ONLY the verified admin (`isSuperAdminEmail()`) can `get`, `list` (with `resource.data.recipientEmail == 'solijonsolayev2003@gmail.com'`), `update` (status transition before terminal `archived` state, with `createdAt`, `senderName`, `senderContact`, `projectType`, `message`, `recipientEmail` immutable and `updatedAt == request.time`), or `delete` inquiries.

## 2. The "Dirty Dozen" Payloads

1. **Unauthenticated Portfolio Overwrite**: Anonymous user attempts to update `/portfolio/main`. -> `PERMISSION_DENIED`
2. **Non-Admin Authenticated Portfolio Edit**: Signed-in user `attacker@example.com` attempts to update `/portfolio/main`. -> `PERMISSION_DENIED`
3. **Unverified Admin Email Spoof**: User with `email == 'solijonsolayev2003@gmail.com'` but `email_verified == false` attempts to update `/portfolio/main`. -> `PERMISSION_DENIED`
4. **Shadow Field Injection on Portfolio**: Admin sends valid portfolio fields plus an undeclared field `isHacked: true`. -> `PERMISSION_DENIED`
5. **OwnerUid Spoofing**: Admin attempts to create/update `/portfolio/main` with `ownerUid: 'someone_else'`. -> `PERMISSION_DENIED`
6. **Stale/Forged Timestamp on Portfolio**: Admin sends client-forged `updatedAt` != `request.time`. -> `PERMISSION_DENIED`
7. **Oversized Array / Denial of Wallet on Portfolio**: Payload includes `projects` array with 50 items (`> 20` limit). -> `PERMISSION_DENIED`
8. **Public PII Scrape on Inquiries**: Anonymous or non-admin signed-in user attempts `get` or `list` on `/inquiries`. -> `PERMISSION_DENIED`
9. **Inquiry Status Pre-Elevation on Create**: Visitor creates an inquiry with `status: 'archived'` instead of `'new'`. -> `PERMISSION_DENIED`
10. **Inquiry Shadow Field Injection**: Visitor creates an inquiry with extra field `adminNotes: 'pwned'`. -> `PERMISSION_DENIED`
11. **Inquiry Forged Timestamp**: Visitor creates an inquiry with `createdAt` in the past. -> `PERMISSION_DENIED`
12. **Terminal State Mutation on Inquiry**: Attempt to update an inquiry whose existing `status` is already `'archived'`. -> `PERMISSION_DENIED`
