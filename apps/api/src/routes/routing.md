
# Routing Design (Documentation Only)

This document is the **end-state routing and API design** for Zana.

It describes:

1) **API route design** aligned to the Prisma models + deny-by-default scoping rules
2) **Frontend (React Router)** routes and “workbench-style dashboards” (dashboard *UX style*, not an API naming requirement)

Key constraints:

- Multi-tenant: every request is scoped to `tenantId` from the auth token.
- RBAC + relationship scoping (teacher→stream/subject, class-teacher→stream, student-self, etc.).
- Most screens are **task views** (queues + cards + actions), not raw table CRUD.

Non-goals: implementation details, actual Fastify handlers, exact response DTOs.

---

## 1) What “workbench-style” means (UX only)

When we say “workbench-style dashboard”, we mean:

- A **role-aware landing page** composed of cards/queues: “To mark today”, “To grade”, “At risk”, “Waiting approvals”.
- A **workspace pattern**: select a context (stream, subject, term) and then perform tasks inside it.
- A strong bias toward **next action** buttons rather than browsing.

This does **not** require endpoint names like `/workbench/*`.

---

## 2) Product modules at completion (navigation domains)

Zana naturally decomposes into these domains:

### Student portal

- My dashboard (today, homework due, recent grades)
- My grades (by subject, by term)
- My attendance summary
- My homework + submissions

### Teaching

- Stream workspaces (students you teach)
- Subject workspaces (assessments, grade entry, homework)
- Lesson plans + scheme-of-work + coverage tracking

### Class teacher oversight

- Attendance marking + attendance exceptions
- Student support signals (at-risk, missing contacts via staff workflow)
- Tasks/follow-ups (student support workflow)

### Department leadership

- Department coverage dashboard
- Performance aggregates by subject/stream
- Teacher activity/coverage signals

### Operations (staff)

- Admissions pipeline (inquiries → applications → interviews → conversion)
- Records (student profile, enrollments, transfers)
- Setup assistance (classes/streams, timetable inputs, guardian contacts)

### Administration (owner/admin)

- User + role assignment + invites
- Academic structure configuration (years/terms)
- Education systems + grade levels
- Subjects + departments
- Timetable management

### Finance / services (accountant)

- School services catalog
- Student service enrollments
- Finance dashboards (aggregates)

### Procurement / inventory (capabilities)

Even if procurement is implemented later, routing should anticipate it:

- Textbook inventory views (already modeled)
- Issuance per class/stream
- Requisitions/purchase approvals (future)

---

## 3) Frontend routing (React Router) — complete end-state

### 3.1 Route model principles

- Use a single authenticated shell: `/app/*`.
- Keep   URLs describing **workspaces** and **tasks**.
- Use nested routes for context (stream → classSubject → assessment/homework).
- A multi-role user uses the **same** app; the menu adapts and routes are guarded.

### 3.2 Core layouts and guards

- `AuthLayout`: unauthenticated public shell.
- `AppLayout`: authenticated shell (top nav, role switcher, context chips).
- `RequireAuth` guard.
- `RequireRoles(roles[])` guard.
- `ScopeGuard` (optional): verifies linked profile exists (e.g., `Teacher.userId` present).

### 3.3 Canonical route tree

Public:

- `/` landing
- `/login`
- `/signup` (optional)
- `/invite/:token` (invite acceptance)

App (authed):

- `/app`
	- `/app/dashboard` (role-aware landing; the *home*)
	- `/app/action-center` (tasks/alerts; role-aware)
	- `/app/search` (scoped search)
	- `/app/me/profile`
	- `/app/me/security` (password/session; later)

Student portal:

- `/app/student/dashboard`
- `/app/student/grades`
	- `/app/student/grades/terms/:termId`
- `/app/student/attendance`
- `/app/student/homework`
	- `/app/student/homework/:homeworkId`

Teaching (subject teacher):

- `/app/teaching/dashboard`
- `/app/teaching/streams`
	- `/app/teaching/streams/:streamId`
		- `/app/teaching/streams/:streamId/overview`
		- `/app/teaching/streams/:streamId/students`
		- `/app/teaching/streams/:streamId/subjects`
			- `/app/teaching/streams/:streamId/subjects/:classSubjectId`
				- `/app/teaching/streams/:streamId/subjects/:classSubjectId/assessments`
					- `/app/teaching/streams/:streamId/subjects/:classSubjectId/assessments/:assessmentId`
				- `/app/teaching/streams/:streamId/subjects/:classSubjectId/grade-entry`
				- `/app/teaching/streams/:streamId/subjects/:classSubjectId/homework`
					- `/app/teaching/streams/:streamId/subjects/:classSubjectId/homework/:homeworkId`
				- `/app/teaching/streams/:streamId/subjects/:classSubjectId/lesson-plans`
				- `/app/teaching/streams/:streamId/subjects/:classSubjectId/scheme`
				- `/app/teaching/streams/:streamId/subjects/:classSubjectId/coverage`

Class teacher:

- `/app/class-teacher/dashboard`
- `/app/class-teacher/streams`
	- `/app/class-teacher/streams/:streamId`
		- `/app/class-teacher/streams/:streamId/attendance`
		- `/app/class-teacher/streams/:streamId/students`
			- `/app/class-teacher/streams/:streamId/students/:studentId` (oversight view)
		- `/app/class-teacher/streams/:streamId/follow-ups` (tasks, at-risk)

Department head:

- `/app/department/dashboard`
- `/app/department/subjects`
	- `/app/department/subjects/:subjectId`
		- `/app/department/subjects/:subjectId/overview`
		- `/app/department/subjects/:subjectId/coverage`
		- `/app/department/subjects/:subjectId/performance`
- `/app/department/teachers`
	- `/app/department/teachers/:teacherId` (aggregates + coverage)

Admissions (staff/admin/interviewers):

- `/app/admissions/dashboard`
- `/app/admissions/inquiries`
	- `/app/admissions/inquiries/:inquiryId`
- `/app/admissions/applications`
	- `/app/admissions/applications/:applicationId`
		- `/app/admissions/applications/:applicationId/interviews/new`
- `/app/admissions/interviews/:interviewId`

Records (staff/admin):

- `/app/records/students`
	- `/app/records/students/:studentId`
		- `/app/records/students/:studentId/profile`
		- `/app/records/students/:studentId/enrollments`
		- `/app/records/students/:studentId/attendance`
		- `/app/records/students/:studentId/grades`
		- `/app/records/students/:studentId/guardians`
- `/app/records/enrollments`
- `/app/records/classes`
- `/app/records/streams`
- `/app/records/teachers`
- `/app/records/guardians`

Admin configuration (owner/admin/head-teacher):

- `/app/admin/users`
- `/app/admin/invites`
- `/app/admin/roles` (future if custom roles)

- `/app/admin/academics/years`
- `/app/admin/academics/terms`

- `/app/admin/education-systems`
- `/app/admin/grade-levels`

- `/app/admin/departments`
- `/app/admin/subjects`
- `/app/admin/class-subjects` (assign subjects to streams)

- `/app/admin/timetable`

Finance/services (accountant/admin):

- `/app/finance/dashboard`
- `/app/finance/services`
- `/app/finance/student-services`
- `/app/finance/reports`

Inventory/procurement (capability-driven; optional early):

- `/app/inventory/textbooks`
- `/app/inventory/textbooks/class-sets`
- `/app/inventory/issuance`

Error and access:

- `/app/unauthorized`
- `/app/not-found`

---

## 4) Page catalog (what each screen needs)

The goal is to avoid accidental data exposure: every page should have an explicit data contract.

### 4.1 Dashboard cards (reusable building blocks)

Dashboards are composed of cards/queues. Each card should map to **one scoped query**.

Common cards (role-aware):

- “My timetable today”
- “Homework to grade”
- “Assessments pending marks”
- “Attendance missing today”
- “At-risk attendance”
- “Coverage behind plan”
- “Admissions: awaiting interview”

#### 4.1.1 Explicit card → API mapping (recommended)

This section makes the dashboard implementation explicit.

- Each card/queue should have a clearly defined **data source** and **scope proof**.
- The card should use either:
	- **Option A**: composition from canonical resources (simpler API, more client logic)
	- **Option B**: a dedicated “queue/view” endpoint (less client logic, clearer contracts)

Important: Option B does not create a new security boundary; it must apply the same tenant + relationship scoping as the canonical routes.

##### Teacher dashboard cards

| Card / queue | UI surface | Option A: canonical queries | Option B: optional view endpoint | Primary mutations | Scope proof (server-side) | Projection rules |
|---|---|---|---|---|---|---|
| My timetable today | `/app/teaching/dashboard` | `GET /timetable-slots?date=YYYY-MM-DD&mine=true` | `GET /queues/teacher/today-timetable` | — | Teacher relationship to `TimetableSlot.classSubjectId` through teacher assignment | Slots only; no student PII |
| My streams & subjects | `/app/teaching/dashboard` | `GET /class-subjects?assignedTo=me` + `GET /streams?ids=...` | `GET /me/teaching-context` | — | Teacher assigned via `ClassSubject.teacherId` or `ClassSubjectTeacherAssignment` | Avoid exposing unrelated classSubjects |
| Homework to grade | `/app/teaching/dashboard` | `GET /homework?assignedTo=me&status=past_due_or_due&needsGrading=true` | `GET /queues/teacher/homework-to-grade` | `POST /homework/:homeworkId/submissions/:submissionId/grade` | Teacher assignment to `HomeworkAssignment.classSubjectId` | Student identity BASIC only; no guardians/services |
| Assessments pending marks | `/app/teaching/dashboard` | `GET /assessments?assignedTo=me&status=open` + `GET /grades?assessmentId=...` | `GET /queues/teacher/assessments-missing-grades` | `POST /assessments/:assessmentId/grades/submit` | Teacher assignment to `Assessment.classSubjectId` | Student identity BASIC only |
| Coverage behind plan | `/app/teaching/dashboard` | `GET /schemes?assignedTo=me&termId=...` + `GET /lesson-sessions?termId=...&mine=true` | `GET /queues/teacher/coverage-behind` | `POST /lesson-sessions` | Teacher assignment to `SchemeOfWork.classSubjectId` and/or `LessonSession.classSubjectId` | Aggregates by week/topic; no student PII |

##### Class-teacher dashboard cards

| Card / queue | UI surface | Option A: canonical queries | Option B: optional view endpoint | Primary mutations | Scope proof (server-side) | Projection rules |
|---|---|---|---|---|---|---|
| Attendance missing today | `/app/class-teacher/dashboard` | `GET /attendance?streamId=...&date=today` + `GET /streams?mine=true` | `GET /queues/class-teacher/attendance-missing-today` | `POST /attendance/streams/:streamId/mark` | `Stream.classTeacherId == teacher.id` | Roster uses BASIC student identity only |
| At-risk attendance | `/app/class-teacher/dashboard` | `GET /attendance?streamId=...&range=30d` + computed aggregates | `GET /queues/class-teacher/attendance-risk` | `POST /tasks` (follow-up), `POST /attendance/streams/:streamId/mark` | Stream ownership (`classTeacherId`) | Risk list shows minimal PII; no guardian contacts by default |
| Open follow-ups | `/app/class-teacher/dashboard` | `GET /tasks?scope=stream&mine=true&status=open` | `GET /queues/class-teacher/open-follow-ups` | `POST /tasks`, `POST /tasks/:taskId/complete` | Task visibility is relationship-scoped (stream/student) | Task content may contain sensitive notes; strict role gates |

##### Department-head dashboard cards

| Card / queue | UI surface | Option A: canonical queries | Option B: optional view endpoint | Primary mutations | Scope proof (server-side) | Projection rules |
|---|---|---|---|---|---|---|
| Coverage status (department) | `/app/department/dashboard` | `GET /schemes?departmentId=...&termId=...` + `GET /lesson-sessions?departmentId=...&termId=...` | `GET /queues/department/coverage-status` | — (or approvals later) | Department head assignment (`DepartmentHeadAssignment`) + subject.departmentId | Default aggregates; student drill-down gated |
| Subject performance aggregates | `/app/department/dashboard` | `GET /grades?departmentId=...&termId=...` (aggregated) | `GET /queues/department/performance-aggregates` | — | Department head + department scope | Aggregates by stream/subject; no student PII by default |
| Teacher activity signals | `/app/department/dashboard` | `GET /lesson-sessions?departmentId=...&termId=...` | `GET /queues/department/teacher-activity` | — | Department head + department scope | Teacher-level metrics only |

##### Staff / admin dashboard cards

| Card / queue | UI surface | Option A: canonical queries | Option B: optional view endpoint | Primary mutations | Scope proof (server-side) | Projection rules |
|---|---|---|---|---|---|---|
| Admissions awaiting interview | `/app/admissions/dashboard` | `GET /admissions/applications?status=awaiting_interview` + `GET /admissions/interviews?status=pending` | `GET /queues/admissions/awaiting-interview` | `POST /admissions/applications/:applicationId/interviews` | STAFF/ADMIN within tenant; interviewers only see assigned interviews | Admissions notes are sensitive; strict role gates |
| Missing guardian contacts | `/app/records/students` (or operations dashboards) | `GET /students?missingGuardianContact=true` (projected) | `GET /queues/operations/missing-guardian-contacts` | `POST /guardians` / `POST /student-guardians` (future naming) | STAFF/ADMIN within tenant | Teachers should not access this queue by default |

##### Student dashboard cards

| Card / queue | UI surface | Option A: canonical queries | Option B: optional view endpoint | Primary mutations | Scope proof (server-side) | Projection rules |
|---|---|---|---|---|---|---|
| My timetable today | `/app/student/dashboard` | `GET /timetable-slots?date=YYYY-MM-DD&studentSelf=true` | `GET /me/today-timetable` | — | Student-self via current enrollment/stream schedule rules | Timetable only; no staff-only notes |
| Homework due | `/app/student/dashboard` | `GET /homework?studentSelf=true&dueSoon=true` | `GET /me/homework-due` | `POST /homework/:homeworkId/submissions` | Student-self | Only published homework; no teacher private notes |
| Recent grades summary | `/app/student/dashboard` | `GET /grades?studentSelf=true&recent=true` | `GET /me/grades-summary` | — | Student-self | Only own grades; no peer comparison |
| Attendance summary | `/app/student/dashboard` | `GET /attendance?studentSelf=true&range=30d` | `GET /me/attendance-summary` | — | Student-self | Summary only unless policy allows detail |

### 4.2 Student portal pages

`/app/student/dashboard`

- Data: timetable summary, homework due, recent grades, attendance summary
- Actions: open homework, view subject performance
- Notes: derived views only (no raw `Enrollment` rows)

`/app/student/homework/:homeworkId`

- Data: homework details + my submission
- Actions: submit/update my submission (policy-controlled)

### 4.3 Teaching workspace pages

`/app/teaching/streams/:streamId/subjects/:classSubjectId/grade-entry`

- Data: roster (scoped), assessment list, grade entry sheet shape
- Actions: save draft, submit grades, export (optional)
- Notes: must validate teacher assignment to `classSubjectId` server-side; ignore client-passed IDs when scoping.

`/app/teaching/streams/:streamId/subjects/:classSubjectId/scheme`

- Data: scheme-of-work for term, weekly items, topic mapping
- Actions: create/update items, publish scheme

`/app/teaching/streams/:streamId/subjects/:classSubjectId/coverage`

- Data: planned vs taught (lesson sessions vs scheme items)
- Actions: log lesson session, link to lesson plan / homework

### 4.4 Class teacher oversight pages

`/app/class-teacher/streams/:streamId/attendance`

- Data: today’s roster, current attendance marks, historical streaks (optional)
- Actions: mark attendance, add notes, flag absences

`/app/class-teacher/streams/:streamId/students/:studentId`

- Data: student summary (broader than subject teacher), attendance trend, overall grades summary, tasks/follow-ups
- Actions: create a follow-up task, request guardian contact update (staff workflow)

### 4.5 Department leadership pages

`/app/department/subjects/:subjectId/coverage`

- Data: coverage aggregates across streams/teachers (no PII by default)
- Actions: drill down (policy-controlled), message teachers (future)

`/app/department/subjects/:subjectId/performance`

- Data: performance aggregates; drill-down links gated by scope

### 4.6 Admissions pages

`/app/admissions/applications/:applicationId`

- Data: application details, status, scheduled interviews, scores
- Actions: schedule interview, record decision, convert to enrollment (staff/admin)
- Notes: interviewers only see interviews they’re assigned to.

### 4.7 Admin/config pages

`/app/admin/education-systems` + `/app/admin/grade-levels`

- Data: tenant-scoped education systems and grade levels
- Actions: add/edit; careful with downstream references to `Class.gradeLevelId`

---

## 5) API design (end-state)

### 5.1 API principles

- A single API surface, scoped by auth + relationships.
- Prefer canonical resource endpoints.
- Use **view endpoints** where field projection differs materially by role.
- Avoid “role-only” trust: scoping must be proven through joins.

### 5.2 Standard request context

Every request is scoped by:

- `tenantId` (auth)
- `userId` (auth)
- effective roles (`User.role` + `UserRoleAssignment`)
- linked profiles (`Teacher.userId`, `Student.userId`) when present

### 5.3 Canonical resource endpoints

Identity/admin:

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

- `GET /users` (admin)
- `POST /invites` (admin/staff)

Academic structure:

- `GET /academic-years`, `GET /terms`
- `GET /education-systems`, `GET /grade-levels`
- `GET /classes`, `GET /streams`
- `GET /subjects`, `GET /departments`
- `GET /class-subjects` (the core “teaching assignment surface”)

People:

- `GET /students` (scoped)
- `GET /students/:studentId` (role-projected)
- `GET /teachers` (role-gated)
- `GET /guardians` (role-gated)

Teaching & learning:

- `GET /timetable-slots` (scoped; supports `mine=true` / `studentSelf=true` / date filters)
- `GET /attendance` (scoped by stream)
- `GET /assessments` (scoped by classSubject)
- `GET /grades` (scoped by assessment/classSubject)
- `GET /homework` (scoped by classSubject)

- `GET /lesson-plans` (visibility rules)
- `GET /schemes` (scheme of work)
- `GET /lesson-sessions` (coverage/activity)

Admissions:

- `GET /admissions/inquiries`
- `GET /admissions/applications`
- `GET /admissions/interviews`

Services/finance-adjacent:

- `GET /services`
- `GET /student-services`

Tasks/action-center (optional but recommended for the dashboard UX):

- `GET /tasks` (scoped)
- `POST /tasks`
- `POST /tasks/:taskId/complete`

### 5.4 Workflow/action endpoints (write paths)

Keep writes explicit and scope-validated:

- `POST /attendance/streams/:streamId/mark`
- `POST /assessments`
- `POST /assessments/:assessmentId/grades/submit`
- `POST /homework`
- `POST /homework/:homeworkId/submissions` (student-self)
- `POST /homework/:homeworkId/submissions/:submissionId/grade`
- `POST /schemes` / `POST /schemes/:schemeId/publish`
- `POST /lesson-sessions`
- `POST /admissions/applications/:applicationId/interviews`

### 5.5 View endpoints (explicit projection)

These exist to make the field-projection obvious:

- `GET /students/:studentId/summary`
- `GET /students/:studentId/timeline`
- `GET /streams/:streamId/overview`
- `GET /class-subjects/:classSubjectId/overview`

Optional (dashboard-card queues):

- `GET /queues/*` (role-gated; always scoped)
- `GET /me/*` (student/teacher self-projections; always scoped)

### 5.6 Dashboard endpoints (optional)

Option A (recommended early):

- No special endpoint; UI composes the dashboard from scoped resource queries.

Option B (optional later, for performance):

- `GET /dashboard` (role-aware)
- `GET /dashboard/teacher` / `GET /dashboard/class-teacher` / etc.

Important: dashboard endpoints are a convenience layer; they must not bypass scoping rules.

---

## 6) Policy mapping (how scoping is proven)

This section is the “explicitness layer”: every domain has a scope proof.

### Student data

- Student-self: `Student.userId == auth.userId`
- Class teacher: `Enrollment.stream.classTeacherId == teacher.id`
- Subject teacher: `Enrollment.stream.classSubject(teacher assignment)`

Projection:

- Subject teachers get BASIC + subject-specific academic; no guardian PII, no services.
- Students get derived views; no raw join tables.

### Admissions

- Staff/admin: tenant scope
- Interviewers: `Interview.interviewerTeacherId == teacher.id`

### Coverage / scheme

- Teacher: teacher assigned to `classSubjectId`
- Department head: within departments they head (department membership/assignment)

---

## 7) End-to-end flows (what completion looks like)

### 7.1 Student submits homework

1) Student opens `/app/student/homework/:homeworkId`
2) UI loads homework details (published only)
3) Student posts submission
4) Teacher sees it in “to grade” queue

### 7.2 Teacher creates an assessment and enters grades

1) Teacher chooses stream + subject workspace
2) Creates assessment linked to topic/questions
3) Opens grade entry sheet
4) Submits grades (immutable submission semantics recommended)

### 7.3 Class teacher marks attendance

1) Class teacher opens stream attendance page
2) Marks today’s register
3) System emits alerts for missing/late marks and at-risk patterns

### 7.4 Staff converts an application to enrollment

1) Staff reviews application
2) Schedules interviews
3) Records decision
4) Converts to `Enrollment` (or triggers enrollment creation workflow)

---

## 8) Completion checklist (explicit requirements)

To consider routing “complete”, ensure the UI has:

- A role-aware dashboard that prioritizes next actions
- Stream+subject workspaces for teachers
- Attendance marking for class teachers
- Coverage/scheme dashboards for department heads
- Admissions pipeline for staff/admin and interviewers
- Admin configuration for education systems/grade levels/subjects/departments
- Strict scoping and field projection rules on every query

