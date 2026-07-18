# School Management System — Multi-Tenant SaaS: Complete Project Plan

**Scope:** CBSE-pattern schools, KG to 12th (Science/Commerce/Arts streams), built as a SaaS product you can eventually sell to multiple schools.
**Builder context:** Solo developer, learning project, MERN web stack, mobile app for Android + iOS.

---

## 1. Strategy: build single-tenant first, architect multi-tenant from day one

Since you're solo, don't try to build the full SaaS (billing, self-onboarding, multi-school admin) on day one — that's a recipe for never shipping. The trick is:

- **Architect every database collection with a `schoolId` field from the very first line of code.** Retrofitting multi-tenancy later means touching every query you've already written — expensive. Adding it now costs almost nothing.
- **Launch and validate with one pilot school** (real or hypothetical) using the full feature set.
- **Add the "SaaS shell"** (super admin panel, subscription billing, self-service onboarding) only once the core product actually works for one school.

This is the single most important architectural decision in this whole plan, so it gets its own section below (§4).

---

## 2. User roles

| Role | Who | Primary device |
|---|---|---|
| Super admin | You (platform owner) | Web |
| School admin | Principal / office staff | Web (mobile later) |
| Teacher | Teaching staff | Web + mobile |
| Parent | Parents/guardians | Mobile (primary), web (optional) |
| Student | Students (via parent's phone or own device) | Mobile |

A parent account can be linked to **multiple children** (siblings in the same or different classes) — this is a common requirement people forget until late.

---

## 3. Feature list by role

### 3.1 Super admin (you — SaaS owner)
- Onboard new schools (tenants), assign subscription plan
- Manage subscription plans, billing, payment status per school
- Platform-wide analytics (active schools, active users, churn)
- Impersonate / support access for troubleshooting
- Feature flags per plan tier (e.g., transport module only on "Pro")

### 3.2 School admin
- School profile setup: board, academic year, classes (KG–12), sections, streams (Science/Commerce/Arts for 11–12)
- Staff management: add/remove teachers, assign subjects & classes
- Student admission & enrollment, ID/roll number generation, promote students to next class at year-end
- Class, section, and subject management
- Timetable creation and publishing
- Fee structure setup, fee collection tracking, online payment, receipt generation, due-date reminders
- Attendance oversight (daily, class-wise reports)
- Exam/term setup and gradebook configuration
- Report card generation (PDF)
- Notice board / circulars (school-wide or class-wise)
- Parent-teacher meeting (PTM) scheduling
- Staff & student leave management
- Document/certificate generation (transfer certificate, bonafide certificate)
- Bulk-generate printable student ID cards (PDF grid) — cheap to build, high "wow factor" in a sales pitch
- Record offline fee payments (cash/cheque/NEFT) with instant PDF receipt generation, alongside online payments
- Run year-end batch promotion of an entire section to the next class/academic year in one action
- Dashboards: attendance trends, fee collection %, performance summaries

### 3.3 Teacher (web + mobile)
- View assigned classes/subjects and timetable
- Mark daily attendance
- Create and assign homework with attachments (mobile push to parents/students)
- Upload study material and activities
- Grade submitted homework via a gallery/lightbox view (pre-loaded images, grade + remark, then "next student") — without this, a teacher facing 40 students × 2 photos each will simply abandon the app
- Enter marks, generate/preview report cards
- Send notices to a class or individual parent
- Set/view PTM availability slots
- Host a virtual PTM or online class via video call link (optional module — see §12)
- Apply for leave
- Chat with parents (moderated, scoped to their own students only)

### 3.4 Parent (mobile, primary surface)
- One account, multiple linked children
- View each child's homework, attendance, timetable, grades, fees
- Pay fees online (UPI/cards)
- Push notifications: new homework, notices, fee due, PTM scheduled, child marked absent
- Chat/raise queries with teachers
- View and download report cards & certificates
- Book/RSVP a PTM slot, join the virtual meeting link from the app at the scheduled time

### 3.5 Student (separate login, mobile)
- View homework and due dates, mark as done
- View timetable, attendance, results
- View notices and study material
- Optional: submit homework as a photo/file upload

---

## 4. Multi-tenancy strategy (the SaaS architecture decision)

There are three common approaches:

| Approach | Description | When to use |
|---|---|---|
| **Shared DB, shared schema** | One MongoDB database, every document has a `schoolId` field. All queries filtered by `schoolId`. | **Recommended for you.** Cheapest to build and operate; fine up to hundreds of schools on MongoDB. |
| **Database-per-tenant** | Each school gets its own database/cluster. | Better isolation, much more ops overhead — only worth it once you have large schools or strict compliance needs. |
| **Hybrid** | Shared DB for small schools, dedicated DB for large/enterprise customers. | Later-stage optimization, not a v1 concern. |

**Recommendation:** start with shared DB + `schoolId` on every collection. Concretely:

- Every collection (`users`, `students`, `homework`, `attendance`, etc.) has a `schoolId: ObjectId` field with a compound index, e.g. `{ schoolId: 1, classId: 1 }`.
- **Enforce tenant isolation in middleware, not in each controller.** Decode `schoolId` from the JWT on every request and inject it automatically into every query (e.g., a Mongoose plugin or a wrapper around your query layer). This is the single biggest security risk in multi-tenant apps — one missed `schoolId` filter and School A can see School B's students. Don't rely on remembering to add it manually in every route.
- Keep a top-level `schools` collection holding tenant metadata: name, board, subscription plan, logo, active status, created date.

---

## 5. Database design (core collections)

```
Schools          { _id, name, board, address, subscriptionPlan, logoUrl, isActive, createdAt }
Users            { _id, schoolId, role[superadmin|admin|teacher|parent|student], name, email, phone, passwordHash, profilePic, isActive }
StudentProfiles  { _id, userId, schoolId, classId, sectionId, rollNo, admissionNo, dob, parentIds[], academicYear, apaarId, pen, motherName, fatherName, category[General|SC|ST|OBC], isCWSN }
ParentProfiles   { _id, userId, schoolId, childrenIds[] }
TeacherProfiles  { _id, userId, schoolId, subjectIds[], assignedClasses[], teacherCode, designation[PRT|TGT|PGT|PET], trainingHoursCompleted }
Classes          { _id, schoolId, name, stream[Science|Commerce|Arts|null], academicYear }
Sections         { _id, schoolId, classId, name }
Subjects         { _id, schoolId, classId, name }
SubjectGroups    { _id, schoolId, classId, stream, compulsorySubjectIds[], electiveSubjectIds[], minSubjectsRequired }
Timetable        { _id, schoolId, classId, sectionId, day, periods[{subjectId, teacherId, startTime, endTime}] }
Attendance       { _id, schoolId, classId, sectionId, date, records[{studentId, status}] }
Homework         { _id, schoolId, classId, sectionId, subjectId, teacherId, title, description, attachments[], dueDate, createdAt }
HomeworkSubmission { _id, homeworkId, studentId, fileUrl, status, submittedAt }
Notices          { _id, schoolId, audience[all|class|role], title, body, attachments[], createdBy, createdAt }
Events           { _id, schoolId, title, type[holiday|exam|ptm|event], date, endDate, classIds[], createdBy }
Exams            { _id, schoolId, classId, name, term, subjects[{subjectId, maxMarks}] }
Results          { _id, examId, studentId, assessmentType[Numerical|Qualitative], marks[{subjectId, marksObtained}], descriptiveFeedback, grade }
Fees             { _id, schoolId, classId, feeHead, amount, dueDate, academicYear }
FeePayments      { _id, studentId, feeId, amountPaid, paymentDate, paymentMethod[Online|Cash|Cheque|NEFT], chequeNumber, reconciliationStatus[Pending|Cleared|Bounced], transactionId, status }
LeaveRequests    { _id, schoolId, userId, fromDate, toDate, reason, status }
PTMSchedule      { _id, schoolId, classId, teacherId, date, meetingLink, meetingProvider, slots[{time, parentId, status}] }
ChatMessages     { _id, schoolId, threadId, senderId, receiverId, message, attachments[], readAt, createdAt }
Notifications    { _id, schoolId, userId, type, title, body, isRead, createdAt }
AuditLogs        { _id, schoolId, userId, action, entity, timestamp }
```

Notes:
- `StudentProfiles.parentIds[]` and `ParentProfiles.childrenIds[]` are inverse references — this is what makes multi-child-per-parent and multi-parent-per-child work cleanly.
- `Classes.stream` is null for KG through class 10, and `Science | Commerce | Arts` for 11–12 — this is the CBSE-specific bit people often hardcode wrong.
- `Events.classIds` empty/null means school-wide (e.g. a holiday); populated means it only shows for those classes (e.g. a class 10 exam date). This single collection backs the academic calendar — see §13 for whether to build your own calendar UI or lean on Google Calendar.
- `StudentProfiles.apaarId` and `.pen` exist because CBSE made the APAAR ID (Automated Permanent Academic Account Registry) **mandatory for board exam registration starting the 2026–27 session** — generating one requires the student's PEN (from UDISE+) plus separate `motherName`/`fatherName` fields matching Aadhaar. Capture these at admission, not at exam-registration time, or your school admin will be manually backfilling hundreds of records under deadline pressure. See §21 for more on this.
- `TeacherProfiles.designation` (PRT/TGT/PGT/PET) should drive a **soft validation warning** (not a hard block) when assigning a teacher to a class — CBSE's affiliation reporting (OASIS) checks whether teachers are graded appropriately for the classes they teach, but real-world staffing isn't always textbook-perfect.
- `Results.assessmentType` exists because NEP 2020's Holistic Progress Card (HPC) replaces marks with narrative/qualitative feedback for the early stages — don't hardcode `Results` to always be numerical.
- `FeePayments.paymentMethod` exists because a large share of real school fee payments still happen as cash, cheque, or NEFT at the office window, not online — the admin needs a UI to manually record these and instantly generate a PDF receipt, not just a payment gateway webhook handler.
- Don't delete data at year-end — add an `academicYear` field everywhere and "promote" students by creating new `StudentProfiles` linked to the next class, so historical attendance/results/fees stay intact.

---

## 6. Tech stack — website (MERN)

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TypeScript | Type safety matters once roles/permissions multiply |
| Styling | Tailwind CSS | Fast to build with, easy to keep consistent |
| State/data | TanStack Query (server state) + Zustand (client/UI state) | Cleaner than Redux for most CRUD-heavy apps |
| Backend | Node.js + Express.js | Matches MERN, huge ecosystem |
| Database | MongoDB Atlas | Flexible schema fits varied roles/modules; good for shared-tenant model |
| Auth | JWT (access + refresh tokens), bcrypt for hashing | Standard, well-documented |
| File storage | AWS S3 or Cloudinary | Homework attachments, profile photos, certificates |
| Real-time | Socket.io | Chat, live notifications |
| Payments | Razorpay | UPI support, built for Indian market |
| Email | Nodemailer + Brevo / SendGrid / AWS SES | Receipts, password resets |
| SMS | Twilio or MSG91 | Fee reminders, absentee alerts (India-focused) |
| Push notifications | Firebase Cloud Messaging (FCM) | Free, works for both web push and mobile |
| WhatsApp alerts (optional, premium tier) | WhatsApp Business Platform via a Business Solution Provider (e.g. Gupshup, Interakt, AiSensy) | High-stakes alerts only (fee overdue, absence, emergency holiday) — billed per delivered message since July 2025, plus the BSP's own platform fee; see §22 |
| PDF generation | pdf-lib or html-pdf-node, run inside a BullMQ background job | Report cards, certificates, fee receipts, ID cards. Avoid Puppeteer here — launching headless Chromium needs well over Render's free-tier 512MB RAM and will crash intermittently; pdf-lib/html-pdf-node are lighter and run fine in a worker |
| Background jobs | BullMQ + Redis | Scheduled reminders, PDF generation, notification fan-out |
| Caching | Redis | Sessions, rate limiting, job queue |
| Validation | Zod | Shared schemas between frontend, backend, and (later) mobile |
| Testing | Jest + Supertest (backend), React Testing Library (frontend) | |
| CI/CD | GitHub Actions | |
| Hosting | Backend: Render/Railway (cheap to start) → AWS later. Frontend: Vercel. DB: MongoDB Atlas | Low ops burden for a solo dev |
| Error tracking | Sentry | |

---

## 7. Tech stack — mobile app (recommendation: React Native + Expo)

**Recommendation: React Native with Expo**, for these reasons specific to your situation:

- You're already committed to the JS/TypeScript ecosystem (MERN) — React Native lets you reuse mental models, validation logic (Zod schemas), API client code, and even some UI logic between web and mobile.
- **One codebase covers both Android and iOS** — critical for a solo developer; you don't have time to maintain two native codebases or learn Flutter's Dart language from scratch on top of everything else.
- Expo removes most native build/config pain (push notifications, app icons, splash screens, store builds) via **EAS Build**, so you can build and submit to both the Play Store and App Store without owning a Mac for iOS builds.
- Mature ecosystem for everything this app needs: navigation, secure storage, camera/file picker (for homework submission), push notifications.

| Concern | Tool |
|---|---|
| Framework | React Native + Expo (managed workflow) |
| Navigation | React Navigation |
| State/data | Same as web: TanStack Query + Zustand |
| Push notifications | Expo Notifications (FCM under the hood) |
| Secure local storage | expo-secure-store (tokens), expo-sqlite for offline cache |
| Auth persistence | Refresh token stored securely, biometric quick-login via expo-local-authentication |
| File/photo upload | expo-image-picker, expo-document-picker (for homework submission) |
| Build & store submission | EAS Build + EAS Submit |

**Alternative considered — Flutter:** gives slightly smoother native performance and animation, but costs you a new language (Dart) and zero code-sharing with your MERN backend logic/validation. For a solo dev already in the JS ecosystem, the cost doesn't pay off. Worth revisiting only if you later hire a dedicated mobile specialist.

**Offline consideration:** Indian schools, especially smaller ones, often have patchy connectivity. Cache the last-fetched homework/timetable/notices locally (expo-sqlite or even simple AsyncStorage for small payloads) so the app isn't blank when offline — sync on reconnect.

---

## 8. System architecture

See the diagram above. In short: both clients (web admin/teacher portal, mobile parent/student app) talk to a single Express API that handles auth and tenant scoping, which reads/writes MongoDB (tenant-scoped), uses Redis for caching and as a job queue, and stores files in S3/Cloudinary. A background worker layer (BullMQ) handles anything that shouldn't block a request — sending push notifications, generating PDFs, firing fee-due reminders — and talks to third-party services (FCM, Razorpay, Twilio/SendGrid).

---

## 9. API & repo structure

Recommended monorepo layout (use npm/yarn workspaces — no need for Turborepo complexity at solo scale):

```
school-saas/
  apps/
    api/      → Express backend
    web/      → React admin/teacher web app
    mobile/   → React Native (Expo) app
  packages/
    shared-types/   → TypeScript interfaces + Zod schemas shared across all three apps
```

Sharing `shared-types` across web, mobile, and API means a schema change (e.g., adding a field to `Homework`) only needs to happen once, and TypeScript will flag every place that needs updating.

Backend folder structure inside `apps/api`:
```
src/
  models/        (Mongoose schemas)
  controllers/
  routes/
  middlewares/   (auth, tenant-scoping, role-check, error handler)
  services/      (business logic — keep controllers thin)
  jobs/          (BullMQ workers)
  utils/
```

API versioning: prefix all routes with `/api/v1/...` from day one — costs nothing now, saves pain later.

---

## 10. Authentication & security

- JWT access token (short-lived, ~15 min) + refresh token (longer-lived, rotated on use). Web stores refresh token in an httpOnly cookie; mobile stores it in expo-secure-store.
- Role-based access control (RBAC) middleware on every route — check role **and** `schoolId` match.
- bcrypt for password hashing, express-rate-limit on auth routes, helmet for HTTP headers, Zod for input validation, strict CORS config, HTTPS everywhere.
- Since most end users here are minors' data and parents: enforce strict visibility rules (a student can never query another student's records — not just hidden in the UI, blocked at the API level), validate file uploads (type/size limits), and avoid storing more personal data than you need.
- For India specifically, look into the **Digital Personal Data Protection (DPDP) Act, 2023** as you get closer to handling real student data — this isn't legal advice, just a flag that data-privacy law for children's data is an active area you'll want to research before going live with real schools.
- Keep an `AuditLogs` collection for sensitive actions (grade changes, fee adjustments, admin actions) — schools will ask for this once they trust you with real data.

---

## 11. Notifications strategy

- **Push (FCM)** is the primary channel for the mobile app: new homework, new notice, fee due, PTM scheduled, child marked absent.
- **SMS/email fallback** for the handful of things that are too important to risk a missed push notification — fee due reminders, absentee alerts. Not every parent checks the app daily.
- **In-app notification center** with read/unread state, so nothing is purely "fire and forget."

---

## 12. Video calling / virtual meetings

**Is this mandatory? No.** Nothing else in this plan depends on it, and you can ship a fully working v1 (Phases 0–2) without it. It's a genuinely useful add-on for two specific cases:

1. **Virtual parent-teacher meetings** — for parents who can't come in person.
2. **Online/hybrid classes** — useful during closures, sick days, or for schools that want a remote-learning option.

If neither of those is a priority for your pilot school, skip this entirely for now and add it in Phase 3. If you do want it, here's the honest technical picture — specifically on "using Google Meet," since that's not quite as simple as it sounds.

### Why Google Meet specifically is awkward to integrate

Google Meet has **no public API to programmatically create or manage meetings** the way Zoom does. The only way to generate a Meet link from your own backend is via the **Google Calendar API** — you create a calendar event with `conferenceDataVersion: 1`, and Google Meet auto-attaches a join link to that event. This works, but it comes with real strings attached:

- Whoever creates the event needs a connected **Google account with OAuth consent** — so either every teacher individually connects their Google account to your app (extra onboarding friction), or the **school is on Google Workspace for Education** and you use a service account with domain-wide delegation (admin has to grant this — common for schools, but it's a setup step per school, not a one-time integration).
- You're now depending on Google's OAuth consent screen, token refresh, and quota limits — more moving parts than a typical REST integration.
- It only really works smoothly if your target schools are already standardized on Google Workspace. If a school uses Microsoft 365 or nothing at all, this doesn't help them.

### Three ways to actually implement it, easiest to hardest

| Option | How it works | Effort | Best for |
|---|---|---|---|
| **A — Manual link (recommended starting point)** | Teacher creates a Google Meet (or Zoom) link themselves from their own Google/Zoom account, pastes it into the PTM/class scheduling form. Your app just stores the link, shows it to parents, and reminds them at the right time. | Almost zero — just a text field + reminder notification | MVP / Phase 2. No OAuth, no API limits, works with literally any video tool a teacher already uses. |
| **B — Google Calendar API integration** | Your backend creates the Calendar event + Meet link automatically when a teacher schedules a PTM, using OAuth (per-teacher) or domain-wide delegation (per-school, if school is on Google Workspace for Education). | Medium — OAuth flow, token storage/refresh, Calendar API quota handling | Once you have a few real schools on Google Workspace asking for "auto-generated" links instead of manual ones. |
| **C — Dedicated video SDK (true in-app calling)** | Use a purpose-built video API — **Jitsi Meet** (free, open-source, no OAuth, can self-host), **Daily.co** or **100ms** (generous free tiers, designed for embedding), or **Zoom Meeting SDK**. The call happens *inside* your app/mobile screen instead of redirecting to an external Meet/Zoom app. | Higher — SDK integration on both web and mobile, but no dependency on each user's Google account | If "leaving the app to join a call" feels wrong for your product, or you want a polished, branded in-app experience later in the SaaS's life. |

**Recommendation for you specifically:** start with **Option A** (manual link) in Phase 2 — it costs almost nothing to build, has zero integration risk, and works regardless of whether a school uses Google, Zoom, or Microsoft Teams. Revisit Option B (Calendar API auto-generation) or Option C (Jitsi/Daily.co in-app calling) later, once real schools tell you which one they actually want — that feedback is worth more right now than guessing.

### What to add to the schema either way

The `PTMSchedule` collection above already has `meetingLink` and `meetingProvider` fields for this — `meetingProvider` lets you support "manual link" today and swap in an automated provider later without a schema change. The same pattern (a `meetingLink` field + a reminder notification job) applies if you later add video for regular online classes, not just PTMs.

---

## 13. Academic calendar: build your own vs. Google Calendar

Same question as Google Meet, different feature — and the answer follows the same shape: **building your own simple calendar (backed by the `Events` collection above) is the right default**, with an easy bridge to Google Calendar for anyone who wants it there.

### Why "just use Google Calendar" is harder than it sounds at SaaS scale

- A **public, embeddable Google Calendar** (the free iframe embed you've probably seen on other sites) works great for one calendar, viewed read-only, on a website. But you're running a multi-tenant product — every school would need its **own** Google Calendar, which means either you manually create one per school (doesn't scale past a handful of customers) or you automate creation via the Calendar API, which puts you right back into OAuth/domain-wide-delegation territory from §12.
- Google Calendar has no concept of your role-based visibility — a parent should only see events relevant to their child's class, but a Google Calendar is shared at the whole-calendar level. You'd need a separate calendar per class to replicate that, multiplying the management overhead.
- The iframe embed is web-only. It doesn't help your **mobile app** at all — there's no "embed a Google Calendar" widget for React Native; you'd have to pull events back out via the API and render them yourself anyway, which means you've built a calendar view either way.

### The approach that actually fits

| Approach | What it gives you | Effort | Recommendation |
|---|---|---|---|
| **A — Your own `Events` collection + calendar UI (recommended)** | Full control over RBAC (each role sees only what's relevant), works identically on web and mobile, no per-school setup, no OAuth, no Google dependency at all. | Low — it's a CRUD feature like Notices, plus any off-the-shelf calendar UI component (web: e.g. FullCalendar; mobile: e.g. react-native-calendars) | **Yes, build this as the source of truth.** |
| **B — Add a "subscribe" export (.ics feed)** | Anyone — parent, teacher, admin — can add the school's calendar to **their own** personal Google Calendar, Apple Calendar, or Outlook, by subscribing to a generated `.ics` URL. No OAuth, no Google API calls, no per-school Google account needed. | Low — generate a standard iCalendar feed (e.g. with the `ical-generator` npm package) from your existing `Events` data, expose it at a per-school (or per-class) URL. | **Add this alongside Option A.** It's the part of "I want it in Google Calendar" that people actually want — seeing school events in the calendar app they already check — without you building any Google integration. |
| **C — Full Google Calendar API sync (two-way)** | Events created in your app automatically appear in a real Google Calendar, and vice versa. | High — same OAuth/domain-wide-delegation complexity as Meet integration, plus handling recurrence, time zones, and conflict resolution for two-way sync. | Skip unless a paying school specifically asks for it later. |

**Bottom line:** keep the calendar feature inside your own app (Option A) — it's the only version that respects per-role visibility and works on mobile without extra plumbing. Layer Option B (.ics subscription link) on top in the same phase; it's a small addition that gives parents/teachers the "see it in my own Google Calendar" experience for almost no engineering cost, and it works for Apple/Outlook users too, not just Google. Save full two-way API sync (Option C) for if and when a customer actually pays you to build it.

---

## 14. Things you didn't mention but will likely need

| Feature | Why it matters | Suggested phase |
|---|---|---|
| Multi-tenancy & billing | Core to the SaaS goal | Phase 1 (architecture), Phase 4 (billing UI) |
| Academic calendar / events | Holidays, exam dates, PTM dates in one place — see §13 for build-your-own vs Google Calendar | Phase 2 |
| Fee management + online payments | Schools will ask for this immediately | Phase 2 |
| Exam/grading config that varies by stage | KG has no formal exams; 9–12 follow CBSE's CCE-style term pattern; 11–12 are stream-specific | Phase 2 |
| Report card / certificate PDF generation | Expected deliverable, not optional | Phase 2 |
| Leave management (staff & student) | Common admin request | Phase 2–3 |
| Library management | Books issue/return tracking | Phase 3 |
| Transport: route & stop manifests | Build this instead of live GPS tracking — let admin define routes/stops, conductor marks "Boarded"/"Dropped" like attendance. Solves most of the real need for a fraction of the effort; see §22 for why live GPS is a trap for a solo dev | Phase 3 |
| Cafeteria / lunch menu management | Optional differentiator — published weekly menu, parent-flagged allergens, age-appropriate canteen rules | Phase 3+ (optional) |
| WhatsApp alerts for high-stakes notices | Premium-tier add-on for fee-overdue/absence/emergency alerts alongside push — see §22 | Phase 3+ (optional) |
| Automated ID card generation | Bulk PDF batch from existing student data — cheap win, big sales-demo impact | Phase 2–3 |
| CBSE/NEP compliance fields (APAAR, PEN, HPC, stream rules) | Needed before a school can use this for real board-exam registration — see §21 | Phase 1–2 (capture at admission, don't retrofit later) |
| Hostel management | Only if targeting boarding schools | Phase 3+ (optional) |
| HR & payroll basics for staff | Larger schools will ask eventually | Phase 3+ |
| Multi-language support (Hindi/English) | Important for the Indian market | Phase 3 |
| Admission enquiry / online admission funnel | Helps schools acquire students — good SaaS selling point | Phase 4 |
| Analytics dashboards | Attendance trends, fee collection %, performance | Phase 3 |
| White-labeling per school (logo/colors) | Expected in a multi-school SaaS product | Phase 4 |
| Data backup & disaster recovery plan | Non-negotiable once real student data is involved | Phase 2 onward |
| Offline support on mobile | Patchy connectivity in many areas | Phase 2 |
| Video calling for PTMs/online classes | Optional — see §12 for Google Meet feasibility and alternatives | Phase 2 (manual link) / Phase 3+ (automated or in-app) |

---

## 15. Development roadmap (solo, realistic pacing)

| Phase | Duration (part-time solo) | Deliverables |
|---|---|---|
| 0 — Planning | 2–3 weeks | Wireframes (Figma), finalized DB schema, repo + CI/CD skeleton |
| 1 — MVP | 2–3 months | Multi-tenant auth, school/class/section/student/teacher CRUD, attendance, homework (create on web, view+complete on mobile), notices, basic parent + student login |
| 2 — Core school operations | 1–2 months | Fees + online payments, exams/grades/report cards (PDF), academic calendar with .ics subscription feed, PTM scheduling (with manual meeting link), chat, push notifications, leave management |
| 3 — Differentiators | 1–2 months | Library, transport tracking, analytics dashboards, multi-language, automated video meeting integration if needed |
| 4 — SaaS shell | Ongoing | Super admin panel, subscription billing, self-service school onboarding, white-labeling, marketing site |

Rough total to a sellable v1: **6–9 months part-time**, longer if learning the stack alongside building. Don't skip Phase 0 — a half-finished schema is the #1 cause of expensive rewrites in projects like this.

---

## 16. Suggested build order (since this is also a learning project)

1. **Backend first.** Build and test the API with Postman/Insomnia before touching any UI — auth, tenant scoping, and core CRUD (schools, classes, students, teachers).
2. **Web admin panel** — easiest to iterate on, and it's where most of the "system configuration" complexity lives (classes, sections, timetable, fee structure).
3. **Web teacher/parent flows** — homework, attendance, notices.
4. **Mobile app** — start from Expo, reuse the exact same API. By this point your API is stable, so the mobile app becomes mostly "build the UI and wire it to endpoints you've already tested."

This order front-loads the hardest, most reusable part (the API) and saves the highest-risk new skill (React Native) for when you already have a working, tested backend to build against.

---

## 17. SaaS monetization (for later, once core product works)

- Subscription tiers per school, e.g. **Basic** (core: attendance, homework, notices) / **Pro** (+ fees, exams, PTM, chat) / **Enterprise** (+ transport, library, white-labeling).
- Per-student/month or flat per-school/year pricing — per-student is easier to scale fairly across small and large schools.
- Free trial period per new school to reduce signup friction.
- Optional one-time setup/onboarding fee for white-labeled deployments.

---

## 18. Immediate next steps

1. Finalize the database schema above against your own mental model of how a real school operates — adjust before writing code, not after.
2. Set up the monorepo skeleton (`apps/api`, `apps/web`, `apps/mobile`, `packages/shared-types`).
3. Build auth + tenant-scoping middleware first — everything else depends on this being correct.
4. Build the School Admin's class/section/student/teacher CRUD next — it's the foundation every other module reads from.

---

## 19. Building this for $0: a genuinely free-tier stack

You can build and run an MVP — and even host one real pilot school — at **$0/month**, using only services with a real, lasting free tier (not a 30-day trial). This maps directly onto the tech stack in §6 and §7; here's the free-tier substitution for each piece, plus the few costs that are genuinely unavoidable once you go beyond testing.

### Free-forever components

| Piece | Free option | The catch |
|---|---|---|
| Database | MongoDB Atlas **M0** — 512MB, no time limit | Permanent and free, but no automated backups — back up manually as real data accumulates |
| Backend hosting | Render **free web service** — 750 hrs/month | Sleeps after 15 min idle, ~30–60s cold start on next request. Fine for an MVP/pilot, not ideal for round-the-clock use |
| Frontend hosting | Serve the React build as static files from the **same Express server** on that same Render free service, instead of a separate Vercel/Netlify deployment | Vercel's and Netlify's free Hobby tiers explicitly prohibit commercial use in their Terms of Service the moment you take real payment from a real school — bundling frontend + backend on Render sidesteps that entirely |
| File storage | Cloudinary **free tier** — 25 credits/month (1 credit = 1GB storage *or* 1GB bandwidth *or* 1,000 transformations, shared pool) | Smaller than commonly assumed — it's one shared bucket, not 25GB of storage on top of separate free bandwidth. Tight once real attachments pile up |
| Redis / job queue | Upstash **free tier** — ~256MB + a generous monthly command allowance | Plenty for light background-job usage (reminders, PDF generation) at pilot scale |
| Transactional email | **Brevo** — 300 emails/day, forever free, full API | SendGrid's old permanent free tier is gone (60-day trial only as of 2026) — Brevo is the better pick now |
| Push notifications | Firebase Cloud Messaging (FCM) | Genuinely free forever at this scale, no real quota concern |
| Mobile builds | Expo SDK/CLI — 100% free forever. EAS Build free tier — 15 Android + 15 iOS builds/month | Test instantly on your own phone via the Expo Go app without using any build credits at all |
| CI/CD | GitHub Actions | Free for public repos; ~2,000 free minutes/month on private repos |
| Error tracking | Sentry free tier | Generous enough for a solo project |
| Payments | Razorpay | No signup/monthly fee — only a transaction fee (~2%) on real payments, so $0 while testing in sandbox mode |

### Costs you genuinely can't avoid

| Cost | When it hits | Amount |
|---|---|---|
| Google Play developer registration | Once, before publishing on the Play Store | $25 one-time |
| Apple Developer Program | Required to publish/update on the App Store (testing on your own iPhone is free without it) | $99/year, recurring |
| SMS reminders | No provider has a real perpetual free tier anymore | A few cents per message — use email-only as the $0 substitute until SMS is worth paying for |
| Domain name | Optional — skip it for the MVP/pilot phase, use a free subdomain instead | ~$10–15/year if/when you want one |

**A note on Oracle Cloud's "Always Free" tier**, since it sometimes comes up as an alternative for a backend that never sleeps: it's genuinely powerful on paper (ARM compute, no card-required usage), but as of mid-2026 the free-tier allocation was cut in half (2 OCPU/12GB, down from 4/24) and there are recurring reports of signup approval friction and regional capacity shortages. Start with Render's free tier — it's simpler and more predictable — and only revisit Oracle if the 15-minute sleep cycle becomes a real problem with your pilot school.

**Bottom line:** $0/month through building and running an MVP for one real school, web included. Publishing to the App Store adds $99/year; SMS adds a few dollars a month once you need it; real payments cost ~2% to Razorpay. Nothing else is a forced cost.

---

## 20. Git workflow: repo setup, branching per module, and commit conventions

Working branch-by-module from day one keeps your history readable and makes it easy to tell, months from now, exactly which commits built the Attendance module versus the Fees module. Here's the concrete setup.

### Step 1 — Create the repo and the base structure

```bash
mkdir school-saas && cd school-saas
git init
mkdir -p apps/api apps/web apps/mobile packages/shared-types

cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
dist/
build/
.expo/
*.log
.DS_Store
EOF

git add .
git commit -m "chore: initial repo structure (api, web, mobile, shared-types)"
git branch -M main
git remote add origin https://github.com/<your-username>/school-saas.git
git push -u origin main
```

Then create a permanent **`dev`** branch — this is your integration branch. `main` only ever receives stable, working code; everything in progress lives on `dev` or on a feature branch off it.

```bash
git checkout -b dev
git push -u origin dev
```

### Step 2 — Branch naming: one branch per module

| Branch prefix | Use for | Example |
|---|---|---|
| `feature/<module>` | A new module or feature, per the roadmap in §15 | `feature/attendance`, `feature/homework`, `feature/fees` |
| `fix/<short-name>` | A bug fix | `fix/attendance-timezone` |
| `chore/<short-name>` | Tooling, dependency bumps, config — no feature behavior | `chore/upgrade-mongoose` |
| `release/<version>` | Optional — cutting a specific release off `dev` | `release/v0.1.0-mvp` |

### Step 3 — Commit message convention (Conventional Commits)

Format: **`type(scope): short description`** — written in plain present tense, no period at the end.

| Type | Meaning |
|---|---|
| `feat` | A new feature or capability |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `refactor` | Code restructuring, no behavior change |
| `test` | Adding or fixing tests |
| `chore` | Tooling, dependencies, config |
| `perf` | Performance improvement |

Examples using this project's actual modules:

```
feat(auth): add JWT refresh token rotation
feat(homework): allow teacher to attach files to homework
feat(attendance): add daily attendance marking endpoint
fix(attendance): correct timezone bug in daily attendance date
fix(fees): handle Razorpay webhook signature mismatch
refactor(api): extract tenant-scoping into shared middleware
docs(readme): add local setup instructions
chore(deps): upgrade mongoose to v8
test(fees): add unit tests for fee payment webhook
```

This also makes your commit log a readable changelog — `git log --oneline` becomes a feature-by-feature history of the build.

### Step 4 — The day-to-day push/pull cycle

This is the actual sequence you repeat for every module:

```bash
# 1. Start from an up-to-date dev branch
git checkout dev
git pull origin dev

# 2. Create your module's branch
git checkout -b feature/attendance

# 3. ...write code...

# 4. Stage and commit (commit often, in small logical chunks)
git add .
git commit -m "feat(attendance): add daily attendance marking endpoint"

# 5. Push the branch (first time needs -u, after that just `git push`)
git push -u origin feature/attendance

# 6. On GitHub: open a Pull Request, feature/attendance → dev
#    Review your own diff one more time before merging — this catches a
#    surprising number of bugs even with no one else reviewing.

# 7. Merge the PR (squash merge keeps dev's history to one clean commit
#    per feature), then delete the feature branch.

# 8. Sync dev locally before starting the next module
git checkout dev
git pull origin dev
```

### Step 5 — Keeping `main` always deployable

Only merge `dev` → `main` at the end of each roadmap phase from §15, once things are stable — not after every individual feature branch. Tag the release when you do:

```bash
git checkout main
git merge dev
git tag -a v0.1.0-mvp -m "Phase 1 MVP: auth, classes, attendance, homework, notices"
git push origin main --tags
```

### Step 6 — Two optional habits worth adopting even solo

- **Branch protection on `main`** (GitHub repo Settings → Branches): require a pull request before merging, even though you're the only one merging it. It stops an accidental direct push from skipping review.
- **A GitHub Issue or Project card per module**, linked to its feature branch. This turns the roadmap in §15 into trackable, checkable units of work instead of a static table.

---

## 21. CBSE/NEP 2020 compliance: government identifiers & stream rules

This section exists because of a sharp, well-researched piece of feedback: a school management system that ignores India's actual board/government data requirements will force admins to manually rebuild records at exam-registration time. The relevant fields are already added to the schema in §5 — here's the reasoning and the current facts behind them, verified against current sources rather than assumed.

- **APAAR ID is no longer optional.** It's confirmed that CBSE has made the APAAR (Automated Permanent Academic Account Registry) ID **mandatory for board exam registration starting the 2026–27 academic session**. Generating one requires the student's PEN (Permanent Education Number, from UDISE+) and separate `motherName`/`fatherName` fields matching Aadhaar exactly — no titles or abbreviations. Capture all of this at **admission**, not at exam-registration time; as of early 2026, several states reported fewer than 20% of eligible students had an APAAR ID, which tells you how much last-minute scrambling this causes schools today.
- **`category` and `isCWSN`** support standard board exam fee concessions for SC/ST/OBC categories and Children With Special Needs.
- **OASIS (CBSE's affiliation/data-reporting portal)** does track faculty designation counts (PRT/TGT/PGT/PET) and mandatory training-hour completion at the school level, and it does check whether teachers are assigned to classes appropriate to their grade. What's *not* independently confirmed is whether OASIS issues a specific individual "teacher code" in that exact form — treat `TeacherProfiles.teacherCode` as a flexible field you populate once you've checked the current OASIS documentation for your pilot school, rather than a guaranteed exact format.
- **Designation-based class assignment** (e.g., PGTs typically teaching 11–12) should be a **soft warning** in your UI, not a hard validation block — real schools sometimes staff outside the textbook rule, and your software shouldn't refuse to let an admin do their job.
- **The Holistic Progress Card (HPC)** is real and developed by NCERT's PARAKH body under NEP 2020 — it replaces marks with narrative, competency-based feedback. It's rolling out across the Foundational, Preparatory, Middle, and (soon) Secondary stages, not just Nursery–Class 2 as sometimes assumed. The `Results.assessmentType` field in §5 lets a single collection hold both numerical and qualitative records as this rolls out further.
- **`SubjectGroups`** exists because Class 11–12 stream subject combinations are genuinely messy (e.g., PCMB vs. PCB + an elective) — use it to validate that a student's chosen subjects meet the minimum requirement for their stream before enrollment is finalized, rather than discovering the gap at exam-registration time.

None of this needs to be perfect on day one — but capturing the *fields* from the start (§5) costs nothing, while retrofitting them into hundreds of existing student records later is exactly the kind of manual, error-prone work this whole product is meant to eliminate for schools.

---

## 22. Operational realities for the Indian school market

A few more practical, India-specific suggestions worth folding in — these are about how schools actually operate day to day, not about the core architecture.

### WhatsApp as a premium alert channel

Push notifications get ignored or accidentally disabled far more often in practice than in theory. A genuinely useful premium-tier feature: route only the **high-stakes** alerts — fee overdue, child marked absent, emergency holiday — through WhatsApp, while keeping routine things like daily homework on push/in-app only.

The cost model has changed recently and is worth getting right: as of July 2025, Meta moved the WhatsApp Business Platform from per-conversation to **per-message billing**. Utility-category messages (which is what fee/absence alerts are) are inexpensive per message, and any reply within a customer-initiated 24-hour window is free — but you'll also need a **Business Solution Provider** (e.g. Gupshup, Interakt, AiSensy, or Twilio) to actually send template messages, and BSPs typically add their own monthly platform fee on top of Meta's per-message rate. Budget for "a real but small monthly cost," not free, and not the old flat per-conversation pricing some older guides still describe.

### Fee collection: respect the cash/cheque/NEFT reality

A meaningful share of Indian school fees are still paid in person — cash, cheque, or bank transfer at the office window, not through your payment gateway. The `FeePayments` schema in §5 now includes `paymentMethod`, `chequeNumber`, and `reconciliationStatus` for exactly this — the admin needs a UI to manually log an offline payment and instantly generate a PDF receipt, not just a payment-gateway webhook handler.

For the online side specifically: **don't let school fee money land in your own bank account first.** Beyond it just being bad practice, India's RBI Payment Aggregator regulations mean only an RBI-authorized Payment Aggregator can legally pool customer funds in a nodal account before forwarding them — an unlicensed platform doing this risks operating outside those rules, on top of the GST/accounting complexity of money passing through your books as if it were your revenue. **Razorpay Route** (or equivalent split-payment products from other gateways) solves this cleanly: a parent's ₹10,000 payment is split at the gateway itself, with your small SaaS fee going to your account and the rest going directly to the school's account — you never legally "receive" the school's fee money at all.

### Transport: build manifests, not live GPS (already reflected in §14)

Live GPS bus tracking is a common solo-developer trap — it needs hardware integration (driver phones or OBD2 scanners), high-frequency WebSocket streams, and handling dead zones where a bus loses signal. **Route & stop manifests** solve most of the actual problem for a fraction of the effort: admin defines routes and stops, students are assigned to a stop, and the conductor marks "Boarded" / "Dropped" — the same UX pattern as class attendance, reusing code you've already built.

### Two cheap wins worth prioritizing

- **Automated ID card generation**: every field needed (photo, blood group, emergency contact, APAAR ID, roll number) is already in `StudentProfiles`. A script that lays out a printable A4 grid of student ID cards via `pdf-lib` costs almost nothing to build and is a genuinely strong "wow" moment in a sales pitch to a principal.
- **Teacher grading workflow for submitted homework**: if a teacher has 40 students submitting photos and has to download each one individually, they'll abandon the app within a week. Build a gallery/lightbox view in the teacher portal — images pre-loaded, a grade field and remark box next to each, a "next student" button — instead of leaving them to manage 80 downloaded image files by hand.

---





