import { z } from 'zod';

export const StudentSchema = z.object({
  id: z.string().uuid().optional(),
  schoolId: z.string().min(1).nullable().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  dateOfBirth: z.string().date().optional(),
});

export type Student = z.infer<typeof StudentSchema>;

export const UserRoleSchema = z.enum([
  'OWNER',
  'ADMIN',
  'STAFF',
  'TEACHER',
  'HEAD_TEACHER',
  'DEPARTMENT_HEAD',
  'CLASS_TEACHER',
  'DIRECTOR',
  'ACCOUNTANT',
  'STUDENT',
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserRolesSchema = z.array(UserRoleSchema);
export type UserRoles = z.infer<typeof UserRolesSchema>;

export const TenantSlugSchema = z
  .string()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/i, 'Use letters, numbers, and hyphens')
  .transform((s) => s.toLowerCase());

export const SignupSchema = z.object({
  tenantName: z.string().min(2).max(80),
  tenantSlug: TenantSlugSchema,
  email: z.string().email().transform((s) => s.toLowerCase()),
  password: z.string().min(8).max(200),
});

export type Signup = z.infer<typeof SignupSchema>;

export const InviteCreateSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase()),
  role: UserRoleSchema.exclude(['OWNER']),
});

export type InviteCreate = z.infer<typeof InviteCreateSchema>;

export const InviteAcceptSchema = z.object({
  password: z.string().min(8).max(200),
});

export type InviteAccept = z.infer<typeof InviteAcceptSchema>;

export const EducationSystemRefSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
});
export type EducationSystemRef = z.infer<typeof EducationSystemRefSchema>;

export const GradeLevelRefSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  order: z.number().int().optional(),
  stage: z.string().min(1).optional(),
});
export type GradeLevelRef = z.infer<typeof GradeLevelRefSchema>;

export const LoginSchema = z.object({
  tenantSlug: TenantSlugSchema,
  email: z.string().email(),
  password: z.string().min(1),
});

export type Login = z.infer<typeof LoginSchema>;

export const ClassSchema = z.object({
  id: z.string().uuid().optional(),
  educationSystemId: z.string().uuid().nullable().optional(),
  gradeLevelId: z.string().uuid().nullable().optional(),
  name: z.string().min(1),
  section: z.string().min(1).optional(),
  academicYear: z.string().min(4),
  classroomId: z.string().uuid().nullable().optional(),
});

export type SchoolClass = z.infer<typeof ClassSchema>;

export const StreamSchema = z.object({
  id: z.string().uuid().optional(),
  classId: z.string().uuid(),
  name: z.string().min(1),
  classroomId: z.string().uuid().nullable().optional(),
  classTeacherId: z.string().uuid().nullable().optional(),
});

export type Stream = z.infer<typeof StreamSchema>;

export const ClassroomSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  building: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
});

export type Classroom = z.infer<typeof ClassroomSchema>;

export const GuardianRelationshipSchema = z.enum(['MOTHER', 'FATHER', 'GUARDIAN']);
export type GuardianRelationship = z.infer<typeof GuardianRelationshipSchema>;

export const GuardianSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().min(1),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

export type Guardian = z.infer<typeof GuardianSchema>;

export const StudentGuardianLinkSchema = z.object({
  guardianId: z.string().uuid().optional(),
  guardian: GuardianSchema.optional(),
  relationship: GuardianRelationshipSchema,
  isPrimary: z.boolean().optional(),
});

export type StudentGuardianLink = z.infer<typeof StudentGuardianLinkSchema>;

export const SchoolServiceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  code: z.string().min(1).optional(),
  defaultFee: z.number().finite().nonnegative().optional(),
});

export type SchoolService = z.infer<typeof SchoolServiceSchema>;

export const StudentServiceEnrollSchema = z.object({
  serviceId: z.string().uuid(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  feeOverride: z.number().finite().nonnegative().optional(),
});

export type StudentServiceEnroll = z.infer<typeof StudentServiceEnrollSchema>;

export const EnrollmentCreateSchema = z.object({
  studentId: z.string().uuid(),
  streamId: z.string().uuid(),
});

export type EnrollmentCreate = z.infer<typeof EnrollmentCreateSchema>;

export const EnrollmentBulkCreateSchema = z.object({
  streamId: z.string().uuid(),
  studentIds: z.array(z.string().uuid()).min(1),
  enrolledAt: z.string().date().optional(),
});

export type EnrollmentBulkCreate = z.infer<typeof EnrollmentBulkCreateSchema>;

export const AttendanceStatusSchema = z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']);
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;

export const AttendanceUpsertSchema = z.object({
  date: z.string().date(),
  status: AttendanceStatusSchema,
});

export type AttendanceUpsert = z.infer<typeof AttendanceUpsertSchema>;

export const AttendanceBulkUpsertSchema = z.object({
  date: z.string().date(),
  items: z
    .array(
      z.object({
        enrollmentId: z.string().uuid(),
        status: AttendanceStatusSchema,
      }),
    )
    .min(1),
});

export type AttendanceBulkUpsert = z.infer<typeof AttendanceBulkUpsertSchema>;

export const TeacherSchema = z.object({
  id: z.string().uuid().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
});

export type Teacher = z.infer<typeof TeacherSchema>;

export const SubjectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  code: z.string().min(1).optional(),
});

export type Subject = z.infer<typeof SubjectSchema>;

export const ClassSubjectCreateSchema = z.object({
  streamId: z.string().uuid(),
  subjectId: z.string().uuid(),
  teacherId: z.string().uuid().optional(),
});

export type ClassSubjectCreate = z.infer<typeof ClassSubjectCreateSchema>;

export const AssessmentCreateSchema = z.object({
  classSubjectId: z.string().uuid(),
  title: z.string().min(1),
  maxScore: z.number().positive(),
  date: z.string().date().optional(),
});

export type AssessmentCreate = z.infer<typeof AssessmentCreateSchema>;

export const GradeUpsertSchema = z.object({
  enrollmentId: z.string().uuid(),
  score: z.number().finite().nonnegative(),
});

export type GradeUpsert = z.infer<typeof GradeUpsertSchema>;

export const GradeBulkUpsertSchema = z.object({
  items: z
    .array(
      z.object({
        enrollmentId: z.string().uuid(),
        score: z.number().finite().nonnegative(),
      }),
    )
    .min(1),
});

export type GradeBulkUpsert = z.infer<typeof GradeBulkUpsertSchema>;

export const TaskStatusSchema = z.enum(['OPEN', 'RESOLVED']);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const TaskCreateSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(5000).optional(),
  priority: TaskPrioritySchema.optional(),
  dueAt: z.string().datetime().optional(),
  assignedToUserId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  guardianId: z.string().uuid().optional(),
});

export type TaskCreate = z.infer<typeof TaskCreateSchema>;

export const TaskUpdateSchema = TaskCreateSchema.partial().extend({
  status: TaskStatusSchema.optional(),
});

export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;
