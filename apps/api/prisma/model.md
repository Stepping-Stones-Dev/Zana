
# Zana Data Model: Connection + Permission Matrices

This document defines:

1) **Potential roles** in the system and how access is granted
2) A **connection matrix** (how core models relate)
3) A **permission matrix** (RBAC + relationship scope)

> Notes
> - Roles are defined in Prisma as `enum UserRole`.
> - Users can have a **primary role** (`User.role`) and **extra roles** via `UserRoleAssignment`.
> - Authorization should be **RBAC + relationship-based scoping** (ABAC-style checks) because most school data is only safe to access when you have the right relationship (teacher-to-stream, parent-to-student, student-self).

---

## 1) Roles (RBAC)

### What exists in the database today

The Prisma schema currently supports these roles (from `enum UserRole`):

- **OWNER**: tenant owner/super-admin for that school
- **ADMIN**: full administrative access inside tenant
- **STAFF**: operational staff (registrar/front office)
- **TEACHER**: teacher (subject-level responsibilities)
- **CLASS_TEACHER**: homeroom/stream-class-teacher responsibilities (usually broader than subject teacher)
- **HEAD_TEACHER**: senior academic authority (school-level academic oversight)
- **DEPARTMENT_HEAD**: academic authority for a department’s subjects/teachers
- **DIRECTOR**: executive/leadership oversight (often read-heavy + approvals)
- **ACCOUNTANT**: finance-facing access (fees/services, limited academic)
- **STUDENT**: self-service access to their own records

This list is a good start, but most real schools need a few more *job functions*.

### Recommended “complete” school structure (role catalog)

Schools vary a lot (day/boarding, primary/secondary, public/private, international), so the most practical structure is:

1) Keep a **small set of base roles** (RBAC)
2) Add **capabilities/permissions** that can be granted to roles or directly to users
3) Scope every action by **relationships** (teacher-to-stream/subject, department ownership, student-self, etc.)

Below is a working role catalog you’ll commonly encounter.

#### Leadership / Governance

- Proprietor / Board (read-only governance dashboards)
- **DIRECTOR** (executive approvals + oversight)
- **HEAD_TEACHER / PRINCIPAL** (academic + disciplinary oversight)
- Deputy Headteacher(s) / Assistant Principal(s)

#### Academic delivery

- **TEACHER** (subject teaching)
- **CLASS_TEACHER** (stream/homeroom ownership)
- **DEPARTMENT_HEAD** (departmental ownership)
- Exams Officer (assessment schedules, moderation, transcripts)
- SEN/Inclusive Education Coordinator (special needs accommodations)
- Counselor / Pastoral Lead (safeguarding + student support)
- Sports/Club Coach / Patron (co-curricular)

#### Operations / Student services

- **STAFF** (front office / registrar)
- Admissions Officer (inquiries/applications/interviews)
- Data/Records Officer (student IDs, transfers, historical records)
- Nurse/Clinic (health notes; usually heavily restricted)
- Librarian (library services, textbook inventory)
- Transport Manager (routes/transport services)
- Boarding Master/Mistress (boarding attendance + incidents)
- Procurement Officer (purchasing requests, approvals, suppliers)
- Inventory/Stores Manager (stock control, issuing, asset custody)

#### Finance

- **ACCOUNTANT / BURSAR** (fees, services, billing, receipts)
- Cashier (payments entry only)
  
#### Procurement & inventory (often cross-functional)

Many schools treat procurement/stores as part of Finance or Operations. In RBAC terms,
it’s safer to model them as **capabilities** (e.g., `procurement.manage`, `inventory.manage`)
granted to STAFF/ACCOUNTANT/ADMIN rather than giving broad tenant-wide write access.

#### IT / Platform

- ICT/Admin (user provisioning, device/IT inventory; usually no academic edits)

#### Students & families

- **STUDENT** (self)
- Guardian/Parent Portal user (commonly separate from Guardian contact records)

### How to implement this correctly (without changing code yet)

Right now you only have `UserRole` values above. In the short term, you can still represent most of the catalog by:

- Using **additional roles** via `UserRoleAssignment` (multi-role users)
- Using **scoped relationships** to narrow what a role can touch (e.g., a TEACHER only sees their streams/subjects)
- Using a small number of **policy flags** (later) to grant narrow capabilities (e.g., “can schedule interviews”)

When you’re ready to extend beyond the enum, the best-practice move is:

- Add `Role` and `Permission` tables (tenant-scoped) + `UserRole` becomes a *system default*, not the only option.
- Keep the enum small and stable; let tenants add custom roles like “EXAMS_OFFICER”.

### Suggested mapping (job function → current schema role)

Use this mapping as a bridge until custom roles/capabilities land:

| Job function (recommended) | Map to `UserRole` today | Notes |
|---|---|---|
| Admissions Officer | STAFF | Can be scoped to admissions pipeline only |
| Registrar / Records | STAFF | Student profile create/update, transfers |
| Exams Officer | HEAD_TEACHER or STAFF | Prefer HEAD_TEACHER if can manage assessments |
| Librarian | STAFF | For textbooks/services management |
| Procurement Officer | STAFF or ACCOUNTANT | Prefer STAFF for requisitions; ACCOUNTANT if tied to budgeting/payments |
| Inventory/Stores Manager | STAFF | Scope to inventory/textbooks/services only (future capability) |
| Counselor / Pastoral | STAFF | Needs strict student-scope rules |
| Nurse/Clinic | STAFF | Needs strict “health-only” scope (future capability) |
| Boarding Master | STAFF | Needs boarding module (future) |
| Cashier | ACCOUNTANT | Limit to payment entry (future capability) |
| ICT/Admin | ADMIN | But restrict domain access via policy (future capability) |
| Deputy Head | HEAD_TEACHER | Often read-heavy + approvals |
| Parent portal user | (not modeled) | Separate `User` + link to `Guardian` is recommended later |

### How roles are granted

- **Primary role**: stored on `User.role`.
- **Additional roles**: stored on `UserRoleAssignment` (`(tenantId, userId, role)` unique).
- Effective roles are the union of primary + assignments.

### How access is scoped (RBAC + relationships)

RBAC answers: *“What actions can this role perform?”*

Relationships answer: *“On which rows (records) can they perform it?”* typically by:

- `tenantId` (always enforced)
- Teacher relationships:
	- `Stream.classTeacherId` (class teacher) → full access within that stream for attendance + student support
	- `ClassSubject.teacherId` or `ClassSubjectTeacherAssignment` (subject teacher/co-teacher) → access limited to that stream+subject
	- `DepartmentHeadAssignment` / `TeacherDepartment` / `Subject.departmentId` (department head)
- Student relationships:
	- `Student.userId` (self)
	- `StudentGuardian` (guardian → student)

**Rule of thumb:** if the data is about a student, staff should only see it if they have a role *and* a relationship.

---

## 2) Connection Matrix (Core Model Relationships)

This section highlights the main “join paths” you’ll use for dashboards, permissions, and metrics.

Legend: ✅ direct FK relationship exists (often with a backrelation).

### Identity / People

| From \\ To | Tenant | User | Student | Teacher | Guardian |
|---|---:|---:|---:|---:|---:|
| **Tenant** | — | ✅ | ✅ | ✅ | ✅ |
| **User** | ✅ | — | ✅ (optional profile) | ✅ (optional profile) | — |
| **Student** | ✅ | ✅ (optional user) | — | — | ✅ via StudentGuardian |
| **Teacher** | ✅ | ✅ (optional user) | — | — | — |
| **Guardian** | ✅ | — | ✅ via StudentGuardian | — | — |

### Academics (Structure)

| From \\ To | AcademicYear | Term | EducationSystem | GradeLevel | Class | Stream | Enrollment |
|---|---:|---:|---:|---:|---:|---:|---:|
| **AcademicYear** | — | ✅ | — | — | ✅ | — | — |
| **Term** | ✅ (via academicYearId) | — | — | — | — | — | ✅ via Assessment |
| **EducationSystem** | — | — | — | ✅ | ✅ | — | — |
| **GradeLevel** | — | — | ✅ | — | ✅ | — | — |
| **Class** | ✅ (optional academicYearId) | — | ✅ | ✅ | — | ✅ | ✅ |
| **Stream** | — | — | — | — | ✅ | — | ✅ |
| **Enrollment** | — | — | — | — | ✅ | ✅ | — |

### Teaching & Assessment

| From \\ To | Subject | Department | ClassSubject | SubjectTopic | Assessment | Grade | Attendance |
|---|---:|---:|---:|---:|---:|---:|---:|
| **Department** | ✅ | — | — | — | — | — | — |
| **Subject** | ✅ | ✅ (optional) | ✅ | ✅ | — | — | — |
| **ClassSubject** | ✅ | — | — | ✅ (via LessonPlan/Assessment.topicId paths) | ✅ | — | — |
| **SubjectTopic** | ✅ | — | — | — | ✅ | — | — |
| **Assessment** | — | — | ✅ | ✅ (optional topicId) | — | ✅ | — |
| **Grade** | — | — | — | — | ✅ | — | — |
| **Attendance** | — | — | — | — | — | — | ✅ (via Enrollment) |

### Curriculum resources & student work

| From \\ To | Textbook | ClassTextbook | LessonPlan | QuestionBankItem | HomeworkAssignment | HomeworkSubmission |
|---|---:|---:|---:|---:|---:|---:|
| **Textbook** | — | ✅ | — | — | — | — |
| **ClassTextbook** | ✅ (classId) | — | — | — | — | — |
| **LessonPlan** | ✅ (classSubjectId, teacherId) | — | — | — | — | ✅ via LessonSession |
| **QuestionBankItem** | ✅ (subjectId) | — | — | — | — | ✅ via AssessmentQuestion |
| **HomeworkAssignment** | ✅ (classSubjectId) | — | ✅ via LessonSession | — | — | ✅ |
| **HomeworkSubmission** | ✅ (studentId, enrollmentId) | — | — | — | ✅ | — |

### Coverage / Scheme of Work

| From \\ To | SchemeOfWork | SchemeOfWorkWeek | SchemeOfWorkItem | LessonSession |
|---|---:|---:|---:|---:|
| **SchemeOfWork** | — | ✅ | ✅ | ✅ (via item) |
| **SchemeOfWorkWeek** | ✅ | — | ✅ | ✅ (via item) |
| **SchemeOfWorkItem** | ✅ | ✅ | — | ✅ |
| **LessonSession** | ✅ (teacherId, classSubjectId) | — | ✅ (optional) | — |

### Admissions pipeline

| From \\ To | LeadSource | Inquiry | EnrollmentApplication | Interview | Enrollment |
|---|---:|---:|---:|---:|---:|
| **LeadSource** | — | ✅ | — | — | — |
| **Inquiry** | ✅ (optional leadSourceId) | — | ✅ | — | ✅ via conversion fields |
| **EnrollmentApplication** | ✅ | ✅ (optional inquiryId) | — | ✅ | ✅ (optional convertedEnrollmentId) |
| **Interview** | — | — | ✅ | — | ✅ via application conversion |

---

## 3) Permission Matrix (RBAC + relationship scope)

This matrix defines the **default** permissions. Actual authorization should:

- ALWAYS enforce `tenantId`
- Then enforce relationship scope (teacher-stream-subject, guardian-student, etc.)

Legend:

- **N** = no access
- **R** = read
- **W** = write/create/update
- **M** = manage (configure, delete, approve, assign)

### Core admin & identity

| Domain | OWNER | ADMIN | STAFF | DIRECTOR | ACCOUNTANT | HEAD_TEACHER | DEPARTMENT_HEAD | TEACHER | CLASS_TEACHER | STUDENT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Tenant settings | M | M | N | R | N | R | N | N | N | N |
| Users & role assignments | M | M | R/W (invites) | R | N | R | R | N | N | N |
| Invitations | M | M | R/W | R | N | R | R | N | N | N |

### Students & guardians

Relationship scopes:

- STUDENT: only `Student.userId == user.id` and their own related records
- TEACHER: only students where teacher is linked via `ClassSubject` (stream+subject) OR class-teacher relationship
- CLASS_TEACHER: only students in streams they are class teacher for
- STAFF/ADMIN/OWNER: typically broad within tenant (but optionally redact sensitive fields for non-admins)

| Domain | OWNER | ADMIN | STAFF | DIRECTOR | ACCOUNTANT | HEAD_TEACHER | DEPARTMENT_HEAD | TEACHER | CLASS_TEACHER | STUDENT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Student profile | M | M | R/W | R | R (limited) | R | R | R (scoped) | R/W (scoped) | R (self) |
| Guardians | M | M | R/W | R | R (limited) | R | R | R (scoped/limited) | R/W (scoped) | R (self, limited) |

### Structure (Classes/Streams/Subjects)

| Domain | OWNER | ADMIN | STAFF | DIRECTOR | ACCOUNTANT | HEAD_TEACHER | DEPARTMENT_HEAD | TEACHER | CLASS_TEACHER | STUDENT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Education systems & grade levels | M | M | R | R | N | R | R | N | N | N |
| Classes & streams | M | M | R/W | R | N | M | R | R (scoped) | R/W (scoped) | R (self class) |
| Subjects | M | M | R | R | N | M | M (dept subjects) | R | R | R |
| Teacher assignments (`ClassSubject*`) | M | M | R/W (assist) | R | N | M | M (dept scope) | R | R | N |

### Curriculum resources & learning process

| Domain | OWNER | ADMIN | STAFF | DIRECTOR | ACCOUNTANT | HEAD_TEACHER | DEPARTMENT_HEAD | TEACHER | CLASS_TEACHER | STUDENT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Topics (`SubjectTopic`) | M | M | R | R | N | M | M (dept scope) | R/W (assigned) | R/W (assigned) | R |
| Textbooks (`Textbook`, `ClassTextbook`) | M | M | R/W | R | N | M | M (dept scope) | R | R | R |
| Lesson plans (`LessonPlan`) | M | M | N | R | N | R | R | R/W (own; SCHOOL/PUBLIC by policy) | R/W (scoped) | R (if allowed) |
| Question bank (`QuestionBankItem`) | M | M | N | R | N | R | M (dept scope) | R/W (dept/assigned) | R/W (scoped) | N |
| Homework (`HomeworkAssignment`) | M | M | N | R | N | R | R | R/W (assigned) | R/W (assigned) | R (self) |
| Homework submissions (`HomeworkSubmission`) | M | M | N | R | N | R | R | R/W (grade for assigned) | R/W (grade for class streams) | R/W (self submit) |

### Teaching metrics / coverage

| Domain | OWNER | ADMIN | STAFF | DIRECTOR | ACCOUNTANT | HEAD_TEACHER | DEPARTMENT_HEAD | TEACHER | CLASS_TEACHER | STUDENT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Scheme of work (`SchemeOfWork*`) | M | M | N | R | N | M | M (dept scope) | R/W (assigned) | R/W (assigned) | N |
| Lesson sessions (`LessonSession`) | M | M | N | R | N | R | R | R/W (own/assigned) | R/W (scoped) | N |

### Assessments, grades, attendance

Relationship scope:

- TEACHER: only for their `ClassSubject` (stream+subject)
- CLASS_TEACHER: for streams they lead (may see broader)
- STUDENT: only own grades/attendance

| Domain | OWNER | ADMIN | STAFF | DIRECTOR | ACCOUNTANT | HEAD_TEACHER | DEPARTMENT_HEAD | TEACHER | CLASS_TEACHER | STUDENT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Assessments | M | M | N | R | N | M | M (dept scope) | R/W (assigned) | R/W (scoped) | R (self context) |
| Grades | M | M | N | R (aggregates) | N | R (aggregates) | R (dept aggregates) | R/W (assigned) | R/W (scoped) | R (self) |
| Attendance | M | M | R/W (assist) | R (aggregates) | N | R (aggregates) | R (dept aggregates) | R/W (assigned streams) | R/W (own stream) | R (self) |

### Admissions pipeline

| Domain | OWNER | ADMIN | STAFF | DIRECTOR | ACCOUNTANT | HEAD_TEACHER | DEPARTMENT_HEAD | TEACHER | CLASS_TEACHER | STUDENT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Lead sources | M | M | R | R | N | R | R | N | N | N |
| Inquiries & applications | M | M | R/W | R | N | R | R | R (interview role) | R | N |
| Interviews & scoring | M | M | R/W (schedule) | R | N | R | R | R/W (assigned interviewer) | R | N |

---

## 4) Giving access in practice (recommended approach)

Implement access checks as:

1) **Role gates** (RBAC): “does user have one of these roles?”
2) **Relationship gates** (scoping): “is this user linked to this record?”

Examples of relationship checks:

- Student reading their own profile: `student.userId == auth.userId`
- Teacher reading grades: join `Grade -> Assessment -> ClassSubject` and ensure teacher is assigned via `ClassSubject.teacherId` or `ClassSubjectTeacherAssignment`
- Class teacher marking attendance: join `Attendance -> Enrollment -> Stream` and ensure `stream.classTeacherId == teacher.id`
- Department head access to subject metrics: `Subject.departmentId` must be within departments they head (active `DepartmentHeadAssignment`)

---

## 5) Deny-by-default + scoped access across the entire schema

This section expands the same thinking to **every model**: access is not “role-only”.

### Reasonable default assumptions (applies unless overridden by policy)

These assumptions are designed to be safe for most schools:

1) **No global search for students by teachers.** Teachers only see students they teach.
2) **Guardians and finance are private.** Teachers do not see guardian contact details or finance/service enrollment.
3) **Students see their own outcomes, not administrative join data.** Students see their own grades/attendance/homework, but not raw `Enrollment` rows or other students.
4) **Department heads and leadership see aggregates by default.** Per-student drill-down is allowed only when necessary and logged.
5) **Admissions is private.** Only admissions staff and assigned interviewers can view applications/interviews.
6) **“Write” is narrower than “read”.** E.g., a class teacher can read overall performance, but only subject teachers write grades for their subject.

If a school wants a more open culture (e.g., teachers can contact guardians), implement that as an explicit capability and audit it.

### Data classification (helps decide redactions)

Use these categories when deciding what to show:

- **Public directory**: names of subjects, departments, teachers (optional)
- **Student academic**: grades, assessments, homework
- **Student operational**: attendance, behavior/discipline (future), tasks
- **PII**: student DOB, phone/email, guardian phone/email
- **Sensitive**: admissions notes, interview scores, authentication data, payments/services

Default redaction rules:

- TEACHER (subject): can see **Student academic (subject-scoped)** + minimal identity; cannot see **PII** or **Sensitive**.
- CLASS_TEACHER: can see broader **operational**; guardian PII is still restricted (typically “contactName only”, or phone/email only if policy allows).
- STUDENT: can see own academic + operational summaries; cannot see guardians’ PII by default (unless it is their own contact profile).

### The 3 layers to enforce on every query

1) **Tenant isolation**: every query includes `tenantId == auth.tenantId`.
2) **Row scope** (relationship): only allow rows the user is related to.
3) **Field projection** (view model): even if you can read a row, you might not be allowed to see all fields.

Practical outcome:

- A teacher with **no interaction** with a student must have **no read access** to that student.
- A **subject teacher** can only manage performance artifacts for their subject + stream.
- A **class teacher** can manage broader student oversight for their stream.
- Students/guardians should typically receive **derived views** (dashboard summaries) and not raw join tables.

### Standard visibility levels (recommended)

Use a small set of “visibility levels” for student-related data. This makes policies consistent.

- **NONE**: cannot access the student at all
- **BASIC**: minimal identity needed for teaching (name, schoolId, current class/stream)
- **SUBJECT**: can access performance artifacts only for the specific subject(s) they teach
- **CLASS**: can access broader class-level oversight (attendance + support + overall performance summaries)
- **ADMIN**: staff/admin leadership access (with optional redactions)

### Relationship scopes (how access is proven)

All teacher interaction with a student should be proven through existing join paths:

- **Class teacher (broad)**: `Enrollment → Stream.classTeacherId == teacher.id`
- **Subject teacher (narrow)**: `Enrollment → Stream → ClassSubject(streamId, subjectId)` where teacher is assigned via:
	- `ClassSubject.teacherId == teacher.id`, or
	- `ClassSubjectTeacherAssignment.teacherId == teacher.id`

For family access (if/when a parent portal user exists):

- **Guardian**: `StudentGuardian(guardianId) → studentId`

### Field projection examples (why teachers shouldn’t see guardian/service info)

Even when a teacher can “see a student”, they should not automatically see:

- Guardian phone/email (sensitive)
- Services/fees (finance)
- Admissions/inquiry notes (privacy)
- Authentication/user details

So you use **different Prisma `select` shapes** per visibility level.

### Scoped-deny patterns you’ll apply repeatedly

- **Never return a row if the user is not scoped to it** (avoid “exists” leaks).
- **Prefer derived views for students** (e.g., “my current class/stream name”, “my grades summary”) instead of exposing join tables.
- **Use subject/stream joins for teacher scoping** rather than relying on IDs passed by the client.
- **Avoid exposing foreign keys in student-facing views** (e.g., don’t return `streamId`, `classSubjectId` unless needed).

---

## 6) Model-by-model access rules (scoped/denied examples)

This table is intentionally opinionated (safe defaults). Adjust per school policy.

Legend:

- **Scope**: how to decide which rows are visible
- **Who**: which roles can access (subject to scope)
- **Notes**: field restrictions / “don’t expose” guidance

### Identity & tenancy

| Model | Scope rule | Who | Notes |
|---|---|---|---|
| Tenant | `tenantId` only | OWNER/ADMIN | Never expose to students |
| User | same tenant; role-gated | OWNER/ADMIN (STAFF limited) | Teachers/students should not read other users by default |
| UserRoleAssignment | same tenant; role-gated | OWNER/ADMIN | Internal-only |
| Invitation | same tenant; role-gated | OWNER/ADMIN/STAFF | Internal-only |

### People (Student/Teacher/Guardian)

| Model | Scope rule | Who | Notes |
|---|---|---|---|
| Student | student-self OR teacher relationship OR admin | ADMIN/STAFF, CLASS_TEACHER (CLASS), TEACHER (BASIC/SUBJECT), STUDENT (self) | Subject teachers should not see guardian/services/admissions notes |
| Teacher | same tenant; role-gated | ADMIN/STAFF/HEAD_TEACHER/DEPARTMENT_HEAD | Teachers can see limited teacher directory if needed |
| Guardian | guardian-self OR class-teacher/admin | ADMIN/STAFF, CLASS_TEACHER (scoped) | Do **not** expose guardian PII to subject teachers |
| StudentGuardian | student relationship | ADMIN/STAFF, CLASS_TEACHER (scoped) | Hide from subject teachers unless explicitly allowed |

### Academic structure

| Model | Scope rule | Who | Notes |
|---|---|---|---|
| EducationSystem / GradeLevel | same tenant | ADMIN/HEAD_TEACHER | Usually read-only to teachers |
| AcademicYear / Term | same tenant | ADMIN/STAFF/TEACHERS (read) | Terms drive assessments/schemes |
| Class / Stream | same tenant; teacher relationships for teacher views | ADMIN/STAFF; TEACHER/CLASS_TEACHER (scoped) | Students can be shown only “current class/stream name”, not raw IDs |
| Classroom | same tenant | ADMIN/STAFF | Teachers read-only |

### Enrollment (critical: students should not query join tables directly)

| Model | Scope rule | Who | Notes |
|---|---|---|---|
| Enrollment | admin OR teacher relationship to the enrollment’s stream OR student-self (optional) | ADMIN/STAFF, CLASS_TEACHER/TEACHER (scoped) | Recommended: **do not expose Enrollment rows to STUDENT**; instead provide derived “My class/stream” fields |

### Teaching assignment

| Model | Scope rule | Who | Notes |
|---|---|---|---|
| Subject | same tenant | ADMIN/HEAD_TEACHER/DEPT_HEAD manage; teachers read | Department heads manage subject structure within department |
| ClassSubject | teacher assignment OR class teacher OR admin | ADMIN/HEAD_TEACHER/DEPT_HEAD; TEACHER/CLASS_TEACHER (scoped) | This is the core “teacher interaction” proof |
| ClassSubjectTeacherAssignment | same as ClassSubject | ADMIN/HEAD_TEACHER/DEPT_HEAD | Lets multiple teachers share responsibility |
| TeacherSubjectQualification | role-gated | ADMIN/HEAD_TEACHER/DEPT_HEAD | Used for assignment validation |

### Curriculum resources

| Model | Scope rule | Who | Notes |
|---|---|---|---|
| SubjectTopic | subject scope; optionally gradeLevel/class scope | ADMIN/HEAD_TEACHER/DEPT_HEAD manage; TEACHER (assigned) | Good for coverage and performance slicing |
| Textbook / ClassTextbook | class/subject scope | ADMIN/STAFF manage; teachers read | Students read only if policy allows |
| LessonPlan | teacher is owner OR visibility allows | TEACHER (own), CLASS_TEACHER (scoped read), DEPT_HEAD (read) | Visibility: PRIVATE/SCHOOL/PUBLIC; avoid cross-tenant publishing |
| QuestionBankItem | subject/department scope | TEACHER (dept/assigned), DEPT_HEAD manage | Students: generally N |

### Assessments & outcomes

| Model | Scope rule | Who | Notes |
|---|---|---|---|
| Assessment | teacher assignment via `classSubjectId` (and optionally topic) | TEACHER/CLASS_TEACHER (scoped RW), DEPT_HEAD moderation | Students should see results, not assessment authoring |
| Grade | `Grade → Assessment → ClassSubject` relationship | TEACHER RW only for their classSubject; CLASS_TEACHER read across stream | Students read own grades only |
| Attendance | `Attendance → Enrollment → Stream` relationship | CLASS_TEACHER RW; TEACHER optional; STAFF RW | Students read own attendance summary |

### Homework

| Model | Scope rule | Who | Notes |
|---|---|---|---|
| HomeworkAssignment | teacher assignment via classSubject | TEACHER/CLASS_TEACHER RW (scoped) | Students can see published homework only |
| HomeworkSubmission | student-self OR teacher assignment to homework | STUDENT self RW; TEACHER RW grading (scoped) | Never allow teachers to view submissions outside their classSubject |

### Coverage / metrics (Scheme of Work)

| Model | Scope rule | Who | Notes |
|---|---|---|---|
| SchemeOfWork / Week / Item | teacher assignment or department oversight | TEACHER RW (assigned); DEPT_HEAD manage; HEAD_TEACHER read/manage | Drives “coverage vs plan” dashboards |
| LessonSession | teacher is owner OR class teacher scope | TEACHER RW (own); CLASS_TEACHER read (stream) | Can power teacher activity metrics |

### Scheduling

| Model | Scope rule | Who | Notes |
|---|---|---|---|
| TimetableSlot | classSubject scope | ADMIN/STAFF manage; teachers read | Do not expose teacher-wide timetable search to students unless limited |

### Services / finance-adjacent (keep away from teachers)

| Model | Scope rule | Who | Notes |
|---|---|---|---|
| SchoolService | same tenant | ADMIN/ACCOUNTANT/STAFF | Teachers: typically N/R only |
| StudentServiceEnrollment | student relationship + finance role | ADMIN/ACCOUNTANT/STAFF | Teachers should be **N** by default |

### Operations

| Model | Scope rule | Who | Notes |
|---|---|---|---|
| Task | role + relationship to student/guardian + assignment | STAFF/ADMIN; TEACHER/CLASS_TEACHER scoped | Students: only tasks assigned to their user (if enabled) |

### Admissions pipeline (keep away from teachers unless they interview)

| Model | Scope rule | Who | Notes |
|---|---|---|---|
| LeadSource | same tenant | ADMIN/STAFF | Teachers: N |
| Inquiry / EnrollmentApplication | admissions roles only; optional interview access | STAFF/ADMIN; TEACHER only if `Interview.interviewer*` | Do not expose inquiry notes broadly |
| Interview / Score / Criterion | interviewer or admissions roles | STAFF/ADMIN; TEACHER (assigned interviewer) | Scores are sensitive; restrict exports |


