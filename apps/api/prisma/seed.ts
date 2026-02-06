import 'dotenv/config';

import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'node:crypto';

import { prisma } from '../src/db.js';

const DEFAULT_PASSWORD = 'ChangeMe123!';

type EducationPreset = {
  system: {
    code: string;
    name: string;
    countryCode: string;
    version?: string;
    isActive?: boolean;
  };
  gradeLevels: Array<{
    code: string;
    name: string;
    stage?: string;
    order: number;
    typicalAgeMin?: number;
    typicalAgeMax?: number;
  }>;
};

const EDUCATION_PRESETS: EducationPreset[] = [
  {
    system: {
      code: 'KENYA_CBC',
      name: 'Kenya CBC (Competency Based Curriculum)',
      countryCode: 'KE',
      version: 'Current',
      isActive: true,
    },
    gradeLevels: [
      { code: 'PP1', name: 'Pre-Primary 1 (PP1)', stage: 'PRE_PRIMARY', order: 1 },
      { code: 'PP2', name: 'Pre-Primary 2 (PP2)', stage: 'PRE_PRIMARY', order: 2 },
      { code: 'G1', name: 'Grade 1', stage: 'PRIMARY', order: 3 },
      { code: 'G2', name: 'Grade 2', stage: 'PRIMARY', order: 4 },
      { code: 'G3', name: 'Grade 3', stage: 'PRIMARY', order: 5 },
      { code: 'G4', name: 'Grade 4', stage: 'PRIMARY', order: 6 },
      { code: 'G5', name: 'Grade 5', stage: 'PRIMARY', order: 7 },
      { code: 'G6', name: 'Grade 6', stage: 'PRIMARY', order: 8 },
      { code: 'G7', name: 'Grade 7', stage: 'JUNIOR_SECONDARY', order: 9 },
      { code: 'G8', name: 'Grade 8', stage: 'JUNIOR_SECONDARY', order: 10 },
      { code: 'G9', name: 'Grade 9', stage: 'JUNIOR_SECONDARY', order: 11 },
      { code: 'G10', name: 'Grade 10', stage: 'SENIOR_SECONDARY', order: 12 },
      { code: 'G11', name: 'Grade 11', stage: 'SENIOR_SECONDARY', order: 13 },
      { code: 'G12', name: 'Grade 12', stage: 'SENIOR_SECONDARY', order: 14 },
    ],
  },
  {
    system: {
      code: 'UGANDA_NATIONAL',
      name: 'Uganda National (Primary + Secondary)',
      countryCode: 'UG',
      version: 'Current',
    },
    gradeLevels: [
      { code: 'P1', name: 'Primary 1 (P1)', stage: 'PRIMARY', order: 1 },
      { code: 'P2', name: 'Primary 2 (P2)', stage: 'PRIMARY', order: 2 },
      { code: 'P3', name: 'Primary 3 (P3)', stage: 'PRIMARY', order: 3 },
      { code: 'P4', name: 'Primary 4 (P4)', stage: 'PRIMARY', order: 4 },
      { code: 'P5', name: 'Primary 5 (P5)', stage: 'PRIMARY', order: 5 },
      { code: 'P6', name: 'Primary 6 (P6)', stage: 'PRIMARY', order: 6 },
      { code: 'P7', name: 'Primary 7 (P7)', stage: 'PRIMARY', order: 7 },
      { code: 'S1', name: 'Senior 1 (S1)', stage: 'LOWER_SECONDARY', order: 8 },
      { code: 'S2', name: 'Senior 2 (S2)', stage: 'LOWER_SECONDARY', order: 9 },
      { code: 'S3', name: 'Senior 3 (S3)', stage: 'LOWER_SECONDARY', order: 10 },
      { code: 'S4', name: 'Senior 4 (S4)', stage: 'LOWER_SECONDARY', order: 11 },
      { code: 'S5', name: 'Senior 5 (S5)', stage: 'UPPER_SECONDARY', order: 12 },
      { code: 'S6', name: 'Senior 6 (S6)', stage: 'UPPER_SECONDARY', order: 13 },
    ],
  },
  {
    system: {
      code: 'TANZANIA_NATIONAL',
      name: 'Tanzania National (Primary + Secondary)',
      countryCode: 'TZ',
      version: 'Current',
    },
    gradeLevels: [
      { code: 'PRE1', name: 'Pre-Primary 1', stage: 'PRE_PRIMARY', order: 1 },
      { code: 'PRE2', name: 'Pre-Primary 2', stage: 'PRE_PRIMARY', order: 2 },
      { code: 'STD1', name: 'Standard I', stage: 'PRIMARY', order: 3 },
      { code: 'STD2', name: 'Standard II', stage: 'PRIMARY', order: 4 },
      { code: 'STD3', name: 'Standard III', stage: 'PRIMARY', order: 5 },
      { code: 'STD4', name: 'Standard IV', stage: 'PRIMARY', order: 6 },
      { code: 'STD5', name: 'Standard V', stage: 'PRIMARY', order: 7 },
      { code: 'STD6', name: 'Standard VI', stage: 'PRIMARY', order: 8 },
      { code: 'STD7', name: 'Standard VII', stage: 'PRIMARY', order: 9 },
      { code: 'FORM1', name: 'Form I', stage: 'LOWER_SECONDARY', order: 10 },
      { code: 'FORM2', name: 'Form II', stage: 'LOWER_SECONDARY', order: 11 },
      { code: 'FORM3', name: 'Form III', stage: 'LOWER_SECONDARY', order: 12 },
      { code: 'FORM4', name: 'Form IV', stage: 'LOWER_SECONDARY', order: 13 },
      { code: 'FORM5', name: 'Form V', stage: 'UPPER_SECONDARY', order: 14 },
      { code: 'FORM6', name: 'Form VI', stage: 'UPPER_SECONDARY', order: 15 },
    ],
  },
  {
    system: {
      code: 'UK_GCSE',
      name: 'United Kingdom GCSE (Key Stage 4)',
      countryCode: 'GB',
      version: 'Current',
    },
    gradeLevels: [
      { code: 'Y10', name: 'Year 10', stage: 'KEY_STAGE_4', order: 1 },
      { code: 'Y11', name: 'Year 11', stage: 'KEY_STAGE_4', order: 2 },
    ],
  },
];

function envBool(name: string, defaultValue: boolean) {
  const raw = process.env[name];
  if (!raw) return defaultValue;
  return raw === '1' || raw.toLowerCase() === 'true' || raw.toLowerCase() === 'yes';
}

function envInt(name: string, defaultValue: number) {
  const raw = process.env[name];
  if (!raw) return defaultValue;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function weightedAttendanceStatus() {
  const r = Math.random();
  if (r < 0.85) return 'PRESENT' as const;
  if (r < 0.93) return 'ABSENT' as const;
  if (r < 0.98) return 'LATE' as const;
  return 'EXCUSED' as const;
}

async function ensureEducationPresets(tenantId: string) {
  const systemsByCode = new Map<string, { id: string; code: string }>();

  for (const preset of EDUCATION_PRESETS) {
    const system = await prisma.educationSystem.upsert({
      where: { tenantId_code: { tenantId, code: preset.system.code } },
      create: {
        tenantId,
        code: preset.system.code,
        name: preset.system.name,
        countryCode: preset.system.countryCode,
        version: preset.system.version ?? null,
        isActive: preset.system.isActive ?? false,
      },
      update: {
        name: preset.system.name,
        countryCode: preset.system.countryCode,
        version: preset.system.version ?? null,
        ...(preset.system.isActive !== undefined ? { isActive: preset.system.isActive } : {}),
      },
      select: { id: true, code: true },
    });

    systemsByCode.set(system.code, system);

    for (const gl of preset.gradeLevels) {
      await prisma.gradeLevel.upsert({
        where: {
          tenantId_educationSystemId_code: {
            tenantId,
            educationSystemId: system.id,
            code: gl.code,
          },
        },
        create: {
          tenantId,
          educationSystemId: system.id,
          code: gl.code,
          name: gl.name,
          stage: gl.stage ?? null,
          order: gl.order,
          typicalAgeMin: gl.typicalAgeMin ?? null,
          typicalAgeMax: gl.typicalAgeMax ?? null,
        },
        update: {
          name: gl.name,
          stage: gl.stage ?? null,
          order: gl.order,
          typicalAgeMin: gl.typicalAgeMin ?? null,
          typicalAgeMax: gl.typicalAgeMax ?? null,
        },
        select: { id: true },
      });
    }
  }

  return systemsByCode;
}

async function seedTenant(tenantId: string, tenantSlug: string, tenantName: string, passwordHash: string) {
  const academicYear = process.env.ACADEMIC_YEAR ?? String(new Date().getFullYear());

  faker.seed(20260204 + tenantSlug.length);

  // Users
  const demoBase = tenantSlug === 'demo' ? 'zana.local' : `${tenantSlug}.zana.local`;
  const ownerEmail = `owner@${demoBase}`.toLowerCase();

  type SeedUserRole =
    | 'OWNER'
    | 'ADMIN'
    | 'STAFF'
    | 'TEACHER'
    | 'HEAD_TEACHER'
    | 'DEPARTMENT_HEAD'
    | 'CLASS_TEACHER'
    | 'DIRECTOR'
    | 'ACCOUNTANT'
    | 'STUDENT';

  async function createUserWithRoles(params: {
    email: string;
    primaryRole: SeedUserRole;
    roles?: SeedUserRole[];
  }) {
    const email = params.email.toLowerCase();
    const roles = Array.from(new Set([params.primaryRole, ...(params.roles ?? [])]));

    const user = await prisma.user.create({
      data: {
        tenantId,
        email,
        passwordHash,
        role: params.primaryRole,
      },
      select: { id: true },
    });

    await prisma.userRoleAssignment.createMany({
      data: roles.map((r) => ({ tenantId, userId: user.id, role: r })),
    });

    return { id: user.id, email, role: params.primaryRole, roles };
  }

  await createUserWithRoles({ email: ownerEmail, primaryRole: 'OWNER' });

  await createUserWithRoles({ email: `admin@${demoBase}`, primaryRole: 'ADMIN' });
  await createUserWithRoles({ email: `staff1@${demoBase}`, primaryRole: 'STAFF' });
  await createUserWithRoles({ email: `staff2@${demoBase}`, primaryRole: 'STAFF' });
  const teacher1User = await createUserWithRoles({ email: `teacher1@${demoBase}`, primaryRole: 'TEACHER' });
  const teacher2User = await createUserWithRoles({ email: `teacher2@${demoBase}`, primaryRole: 'TEACHER' });

  await createUserWithRoles({ email: `director@${demoBase}`, primaryRole: 'DIRECTOR' });
  await createUserWithRoles({ email: `accountant@${demoBase}`, primaryRole: 'ACCOUNTANT' });
  const studentUser = await createUserWithRoles({ email: `student1@${demoBase}`, primaryRole: 'STUDENT' });

  // Teacher leadership roles (single-role)
  const headTeacherUser = await createUserWithRoles({ email: `headteacher@${demoBase}`, primaryRole: 'HEAD_TEACHER' });
  const deptHeadUser = await createUserWithRoles({ email: `depthead@${demoBase}`, primaryRole: 'DEPARTMENT_HEAD' });
  const classTeacherUser = await createUserWithRoles({ email: `classteacher@${demoBase}`, primaryRole: 'CLASS_TEACHER' });

  // Multi-role example to validate combined permissions.
  await createUserWithRoles({
    email: `multi.teacher@${demoBase}`,
    primaryRole: 'TEACHER',
    roles: ['DEPARTMENT_HEAD', 'CLASS_TEACHER'],
  });

  // Invitations
  const creator = await prisma.user.findFirstOrThrow({ where: { tenantId, role: 'OWNER' } });
  const inviteCount = envInt('SEED_INVITES', 6);
  for (let i = 0; i < inviteCount; i++) {
    await prisma.invitation.create({
      data: {
        tenantId,
        email: faker.internet.email({ provider: `${tenantSlug}.example` }).toLowerCase(),
        role: pick(['ADMIN', 'STAFF', 'TEACHER'] as const),
        tokenHash: randomUUID(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        createdByUserId: creator.id,
      },
    });
  }

  // Teachers
  const teacherCount = envInt('SEED_TEACHERS', 10);
  const teachers: Array<{ id: string; firstName: string; lastName: string }> = [];
  for (let i = 0; i < teacherCount; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName, provider: `${tenantSlug}.school` }).toLowerCase();
    const t = await prisma.teacher.create({
      data: { tenantId, firstName, lastName, email },
      select: { id: true, firstName: true, lastName: true },
    });
    teachers.push(t);
  }

  // Link a few teacher user accounts to teacher profiles so RBAC checks work in demo.
  const linkedTeacherUsers = [teacher1User, teacher2User, headTeacherUser, deptHeadUser, classTeacherUser];
  for (const u of linkedTeacherUsers) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const t = await prisma.teacher.create({
      data: { tenantId, userId: u.id, firstName, lastName, email: u.email },
      select: { id: true, firstName: true, lastName: true },
    });
    teachers.push(t);
  }

  // Subjects
  const subjectSeeds = [
    ['Mathematics', 'MATH'],
    ['English', 'ENG'],
    ['Kiswahili', 'KIS'],
    ['Science', 'SCI'],
    ['Social Studies', 'SST'],
    ['CRE', 'CRE'],
    ['ICT', 'ICT'],
    ['Home Science', 'HSC'],
    ['Agriculture', 'AGR'],
    ['Business Studies', 'BST'],
  ] as const;

  const subjects = [] as Array<{ id: string; name: string; code: string | null }>;
  for (let i = 0; i < subjectSeeds.length; i++) {
    const [name, code] = subjectSeeds[i]!;
    const s = await prisma.subject.create({
      data: { tenantId, name, code: `${code}-${tenantSlug.toUpperCase()}` },
      select: { id: true, name: true, code: true },
    });
    subjects.push(s);
  }

  // Classrooms
  const classroomCount = envInt('SEED_CLASSROOMS', 8);
  const classrooms: Array<{ id: string; name: string }> = [];
  for (let i = 0; i < classroomCount; i++) {
    const building = pick(['Block A', 'Block B', 'Block C', 'Annex'] as const);
    const name = `Room ${String(i + 1).padStart(2, '0')}`;
    const c = await prisma.classroom.create({
      data: {
        tenantId,
        name,
        building,
        capacity: faker.number.int({ min: 25, max: 55 }),
      },
      select: { id: true, name: true },
    });
    classrooms.push(c);
  }

  // Education systems + grade levels
  await ensureEducationPresets(tenantId);
  const kenyaSystem = await prisma.educationSystem.findFirstOrThrow({ where: { tenantId, code: 'KENYA_CBC' } });
  const kenyaLevels = await prisma.gradeLevel.findMany({
    where: { tenantId, educationSystemId: kenyaSystem.id },
    orderBy: { order: 'asc' },
    select: { id: true, name: true },
  });

  // Classes
  const classCount = envInt('SEED_CLASSES', 12);
  const classes: Array<{ id: string; name: string }> = [];
  for (let i = 0; i < classCount; i++) {
    const gradeLevel = kenyaLevels.length ? kenyaLevels[i % kenyaLevels.length]! : null;
    const name = gradeLevel?.name ?? `Class ${i + 1}`;
    const classroomId = faker.helpers.maybe(() => pick(classrooms).id, { probability: 0.75 });
    const headTeacherId = faker.helpers.maybe(() => pick(teachers).id, { probability: 0.35 });

    const cls = await prisma.class.create({
      data: {
        tenantId,
        educationSystemId: kenyaSystem.id,
        gradeLevelId: gradeLevel?.id ?? null,
        name,
        section: null,
        academicYear,
        classroomId: classroomId ?? null,
        headTeacherId: headTeacherId ?? null,
      },
      select: { id: true, name: true },
    });
    classes.push({ id: cls.id, name: cls.name });
  }

  // Streams (sections) per class
  const streams: Array<{ id: string; classId: string; name: string }> = [];
  for (const cls of classes) {
    const streamCount = envInt('SEED_STREAMS_PER_CLASS', 2);
    const streamNames = faker.helpers.arrayElements(['A', 'B', 'C'] as const, Math.min(3, Math.max(1, streamCount)));

    for (const name of streamNames) {
      const classTeacherId = faker.helpers.maybe(() => pick(teachers).id, { probability: 0.55 });
      const stream = await prisma.stream.create({
        data: {
          tenantId,
          classId: cls.id,
          name,
          classroomId: faker.helpers.maybe(() => pick(classrooms).id, { probability: 0.6 }) ?? null,
          classTeacherId: classTeacherId ?? null,
        },
        select: { id: true, classId: true, name: true },
      });
      streams.push(stream);
    }
  }

  // ClassSubjects
  const classSubjects: Array<{ id: string; classId: string; streamId: string; subjectId: string }> = [];
  for (const st of streams) {
    const perClass = faker.number.int({ min: 5, max: Math.min(8, subjects.length) });
    const chosen = faker.helpers.arrayElements(subjects, perClass);
    for (const sub of chosen) {
      const teacherId = faker.helpers.maybe(() => pick(teachers).id, { probability: 0.9 });
      const cs = await prisma.classSubject.create({
        data: {
          tenantId,
          classId: st.classId,
          streamId: st.id,
          subjectId: sub.id,
          teacherId: teacherId ?? null,
        },
        select: { id: true, classId: true, streamId: true, subjectId: true },
      });
      classSubjects.push(cs);
    }
  }

  // Assessments
  const assessments: Array<{ id: string; classSubjectId: string; maxScore: number; classId: string; streamId: string }> = [];
  const classSubjectToCtx = new Map(classSubjects.map((cs) => [cs.id, { classId: cs.classId, streamId: cs.streamId }] as const));

  for (const cs of classSubjects) {
    const maxScore = pick([20, 50, 100] as const);
    const a1 = await prisma.assessment.create({
      data: {
        tenantId,
        classSubjectId: cs.id,
        title: 'CAT 1',
        maxScore,
        date: faker.date.recent({ days: 30 }),
      },
      select: { id: true, classSubjectId: true, maxScore: true },
    });
    const a2 = await prisma.assessment.create({
      data: {
        tenantId,
        classSubjectId: cs.id,
        title: 'Mid Term',
        maxScore,
        date: faker.date.recent({ days: 60 }),
      },
      select: { id: true, classSubjectId: true, maxScore: true },
    });

    const ctx = classSubjectToCtx.get(cs.id) ?? { classId: cs.classId, streamId: cs.streamId };
    assessments.push({ ...a1, classId: ctx.classId, streamId: ctx.streamId });
    assessments.push({ ...a2, classId: ctx.classId, streamId: ctx.streamId });
  }

  // Services
  const servicesSeed = [
    { name: 'Transport', code: `TRN-${tenantSlug.toUpperCase()}`, defaultFee: 3500 },
    { name: 'Lunch', code: `LCH-${tenantSlug.toUpperCase()}`, defaultFee: 2500 },
    { name: 'Boarding', code: `BRD-${tenantSlug.toUpperCase()}`, defaultFee: 18000 },
    { name: 'Library', code: `LIB-${tenantSlug.toUpperCase()}`, defaultFee: 500 },
  ];

  const services: Array<{ id: string; defaultFee: number | null }> = [];
  for (const s of servicesSeed) {
    const svc = await prisma.schoolService.create({
      data: {
        tenantId,
        name: s.name,
        code: s.code,
        defaultFee: s.defaultFee,
      },
      select: { id: true, defaultFee: true },
    });
    services.push(svc);
  }

  // Guardians
  const studentCount = envInt('SEED_STUDENTS', 120);
  const guardianCount = envInt('SEED_GUARDIANS', Math.max(30, Math.floor(studentCount * 0.7)));
  const guardians: Array<{ id: string }> = [];

  const kenyaPhoneNumber = () => `+2547${faker.string.numeric(8)}`;

  for (let i = 0; i < guardianCount; i++) {
    const g = await prisma.guardian.create({
      data: {
        tenantId,
        fullName: faker.person.fullName(),
        phone: faker.helpers.maybe(() => kenyaPhoneNumber(), { probability: 0.85 }) ?? null,
        email:
          faker.helpers.maybe(() => faker.internet.email({ provider: `${tenantSlug}.family` }).toLowerCase(), { probability: 0.55 }) ??
          null,
      },
      select: { id: true },
    });
    guardians.push(g);
  }

  // Students
  const students: Array<{ id: string }> = [];
  for (let i = 0; i < studentCount; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const schoolId = `SCH-${tenantSlug.toUpperCase()}-${academicYear}-${String(i + 1).padStart(4, '0')}`;

    const email =
      faker.helpers.maybe(
        () => faker.internet.email({ firstName, lastName, provider: `${tenantSlug}.students` }).toLowerCase(),
        { probability: 0.6 },
      ) ?? null;

    const dob = faker.helpers.maybe(() => faker.date.birthdate({ min: 6, max: 20, mode: 'age' }), { probability: 0.8 }) ?? null;

    const s = await prisma.student.create({
      data: {
        tenantId,
        ...(i === 0
          ? { userId: studentUser.id, email: studentUser.email }
          : {}),
        schoolId,
        firstName,
        lastName,
        email: i === 0 ? studentUser.email : email,
        dateOfBirth: dob,
      },
      select: { id: true },
    });
    students.push(s);
  }

  // Student-Guardian links
  for (const s of students) {
    const linkCount = faker.number.int({ min: 1, max: 2 });
    const chosen = faker.helpers.arrayElements(guardians, linkCount);
    for (let i = 0; i < chosen.length; i++) {
      const g = chosen[i]!;
      await prisma.studentGuardian.create({
        data: {
          tenantId,
          studentId: s.id,
          guardianId: g.id,
          relationship: pick(['MOTHER', 'FATHER', 'GUARDIAN'] as const),
          isPrimary: i === 0,
        },
      });
    }
  }

  // Enrollments (each student into one class)
  const enrollments: Array<{ id: string; classId: string; streamId: string }> = [];
  for (const s of students) {
    const cls = pick(classes);
    const availableStreams = streams.filter((st) => st.classId === cls.id);
    const st = availableStreams.length ? pick(availableStreams) : null;
    if (!st) throw new Error(`Seed: class ${cls.id} has no streams`);
    const e = await prisma.enrollment.create({
      data: {
        tenantId,
        studentId: s.id,
        classId: cls.id,
        streamId: st.id,
        enrolledAt: faker.date.past({ years: 1 }),
      },
      select: { id: true, classId: true, streamId: true },
    });
    enrollments.push(e);
  }

  // Service enrollments
  for (const s of students) {
    if (Math.random() < 0.35) continue;
    const count = faker.number.int({ min: 1, max: Math.min(2, services.length) });
    const chosen = faker.helpers.arrayElements(services, count);
    for (const svc of chosen) {
      await prisma.studentServiceEnrollment.create({
        data: {
          tenantId,
          studentId: s.id,
          serviceId: svc.id,
          startDate: faker.date.past({ years: 1 }),
          endDate: faker.helpers.maybe(() => faker.date.recent({ days: 30 }), { probability: 0.1 }) ?? null,
          feeOverride:
            faker.helpers.maybe(() => faker.number.float({ min: 200, max: 25000, fractionDigits: 0 }), { probability: 0.15 }) ??
            null,
        },
      });
    }
  }

  // Attendance
  const days = envInt('SEED_DAYS', 30);
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  const attendanceRows: Array<{ tenantId: string; enrollmentId: string; date: Date; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' }> = [];
  for (const e of enrollments) {
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      attendanceRows.push({
        tenantId,
        enrollmentId: e.id,
        date,
        status: weightedAttendanceStatus(),
      });
    }
  }

  for (const part of chunk(attendanceRows, 500)) {
    await prisma.attendance.createMany({ data: part });
  }

  // Grades
  const enrollmentsByStreamId = new Map<string, string[]>();
  for (const e of enrollments) {
    const arr = enrollmentsByStreamId.get(e.streamId) ?? [];
    arr.push(e.id);
    enrollmentsByStreamId.set(e.streamId, arr);
  }

  const gradeRows: Array<{ tenantId: string; assessmentId: string; enrollmentId: string; score: number }> = [];
  for (const a of assessments) {
    const enrollmentIds = enrollmentsByStreamId.get(a.streamId) ?? [];
    for (const enrollmentId of enrollmentIds) {
      if (Math.random() < 0.15) continue;
      const raw = faker.number.float({ min: 0, max: a.maxScore, fractionDigits: 1 });
      const score = Math.max(0, Math.min(a.maxScore, raw));
      gradeRows.push({ tenantId, assessmentId: a.id, enrollmentId, score });
    }
  }

  for (const part of chunk(gradeRows, 500)) {
    await prisma.grade.createMany({ data: part });
  }

  console.warn(
    `Seed: tenant '${tenantName}' (${tenantSlug}) → users, invites, ${students.length} students, ${classes.length} classes, ${attendanceRows.length} attendances, ${gradeRows.length} grades`,
  );
}

async function main() {
  const reset = envBool('SEED_RESET', false);

  const existingTenants = await prisma.tenant.count();
  const existingStudents = await prisma.student.count();
  if (!reset && (existingTenants > 0 || existingStudents > 0)) {
    console.warn('Seed: database is not empty. Set SEED_RESET=1 to wipe and seed full fake data.');
    console.warn('Seed: exiting without changes.');
    return;
  }

  if (reset) {
    console.warn('Seed: resetting database (deleting all tenants)…');
    await prisma.tenant.deleteMany();
  }

  const password = process.env.SEED_PASSWORD ?? process.env.ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
  const passwordHash = await bcrypt.hash(password, 10);

  const tenantsToSeed = [
    { slug: 'demo', name: 'Demo School' },
    { slug: 'sunrise', name: 'Sunrise Academy' },
  ];

  const tenantCount = envInt('SEED_TENANTS', tenantsToSeed.length);
  const selected = tenantsToSeed.slice(0, Math.max(1, tenantCount));

  for (const t of selected) {
    const tenant = await prisma.tenant.create({ data: { slug: t.slug, name: t.name } });
    await seedTenant(tenant.id, t.slug, t.name, passwordHash);
  }

  console.warn('Seed: done.');
  console.warn(`Seed login password for created users: ${password}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
