/**
 * School Management System Navigation Utilities
 * 
 * This module provides utilities for generating role-based navigation
 * items for different user types in a school management system.
 */

import React from 'react';
import type { SideBarItem, SchoolNavigationConfig } from './types';
import { SideBarItemType, SchoolUserRole } from './types';

/**
 * Navigation items for Super Admin
 */
export const getSuperAdminNavigation = (): SideBarItem[] => [
  {
    key: 'dashboard',
    title: 'Dashboard',
    icon: 'solar:home-2-bold-duotone',
    href: '/dashboard',
  },
  {
    key: 'schools',
    title: 'Schools Management',
    icon: 'solar:buildings-2-bold-duotone',
    type: SideBarItemType.Nest,
    items: [
      {
        key: 'all-schools',
        title: 'All Schools',
        icon: 'solar:list-bold-duotone',
        href: '/schools',
      },
      {
        key: 'add-school',
        title: 'Add School',
        icon: 'solar:add-circle-bold-duotone',
        href: '/schools/add',
      },
      {
        key: 'school-settings',
        title: 'Global Settings',
        icon: 'solar:settings-bold-duotone',
        href: '/schools/settings',
      },
    ],
  },
  {
    key: 'system',
    title: 'System Management',
    icon: 'solar:server-bold-duotone',
    type: SideBarItemType.Nest,
    items: [
      {
        key: 'users',
        title: 'User Management',
        icon: 'solar:users-group-two-rounded-bold-duotone',
        href: '/system/users',
      },
      {
        key: 'licenses',
        title: 'Licenses',
        icon: 'solar:document-text-bold-duotone',
        href: '/system/licenses',
      },
      {
        key: 'analytics',
        title: 'System Analytics',
        icon: 'solar:chart-2-bold-duotone',
        href: '/system/analytics',
      },
    ],
  },
  {
    key: 'support',
    title: 'Support',
    icon: 'solar:help-bold-duotone',
    href: '/support',
  },
];

/**
 * Navigation items for Admin/Principal
 */
export const getAdminNavigation = (config?: SchoolNavigationConfig): SideBarItem[] => {
  const navigation: SideBarItem[] = [
    {
      key: 'dashboard',
      title: 'Dashboard',
      icon: 'solar:home-2-bold-duotone',
      href: '/dashboard',
    },
  ];

  // Academic Management Section
  if (config?.academicFeatures) {
    const academicItems: SideBarItem[] = [];
    
    if (config.academicFeatures.grades) {
      academicItems.push({
        key: 'grades',
        title: 'Grade Management',
        icon: 'solar:medal-ribbons-star-bold-duotone',
        href: '/academic/grades',
      });
    }
    
    if (config.academicFeatures.attendance) {
      academicItems.push({
        key: 'attendance',
        title: 'Attendance',
        icon: 'solar:calendar-mark-bold-duotone',
        href: '/academic/attendance',
      });
    }
    
    if (config.academicFeatures.timetable) {
      academicItems.push({
        key: 'timetable',
        title: 'Timetable',
        icon: 'solar:calendar-bold-duotone',
        href: '/academic/timetable',
      });
    }
    
    if (config.academicFeatures.examinations) {
      academicItems.push({
        key: 'examinations',
        title: 'Examinations',
        icon: 'solar:document-medicine-bold-duotone',
        href: '/academic/examinations',
      });
    }

    if (academicItems.length > 0) {
      navigation.push({
        key: 'academic',
        title: 'Academic',
        icon: 'solar:book-2-bold-duotone',
        type: SideBarItemType.Nest,
        items: academicItems,
      });
    }
  }

  // Student Management
  navigation.push({
    key: 'students',
    title: 'Students',
    icon: 'solar:user-id-bold-duotone',
    type: SideBarItemType.Nest,
    items: [
      {
        key: 'all-students',
        title: 'All Students',
        icon: 'solar:users-group-two-rounded-bold-duotone',
        href: '/students',
      },
      {
        key: 'admissions',
        title: 'Admissions',
        icon: 'solar:user-plus-bold-duotone',
        href: '/students/admissions',
      },
      {
        key: 'student-records',
        title: 'Records',
        icon: 'solar:folder-with-files-bold-duotone',
        href: '/students/records',
      },
    ],
  });

  // Staff Management
  navigation.push({
    key: 'staff',
    title: 'Staff',
    icon: 'solar:users-group-rounded-bold-duotone',
    type: SideBarItemType.Nest,
    items: [
      {
        key: 'teachers',
        title: 'Teachers',
        icon: 'solar:user-speak-bold-duotone',
        href: '/staff/teachers',
      },
      {
        key: 'support-staff',
        title: 'Support Staff',
        icon: 'solar:user-hand-up-bold-duotone',
        href: '/staff/support',
      },
      {
        key: 'payroll',
        title: 'Payroll',
        icon: 'solar:wallet-money-bold-duotone',
        href: '/staff/payroll',
      },
    ],
  });

  // Financial Management
  if (config?.academicFeatures?.fees) {
    navigation.push({
      key: 'finance',
      title: 'Finance',
      icon: 'solar:dollar-minimalistic-bold-duotone',
      type: SideBarItemType.Nest,
      items: [
        {
          key: 'fee-management',
          title: 'Fee Management',
          icon: 'solar:card-bold-duotone',
          href: '/finance/fees',
        },
        {
          key: 'payments',
          title: 'Payments',
          icon: 'solar:wallet-bold-duotone',
          href: '/finance/payments',
        },
        {
          key: 'expenses',
          title: 'Expenses',
          icon: 'solar:bill-list-bold-duotone',
          href: '/finance/expenses',
        },
      ],
    });
  }

  // Communication
  if (config?.communicationFeatures) {
    const commItems: SideBarItem[] = [];
    
    if (config.communicationFeatures.messaging) {
      commItems.push({
        key: 'messaging',
        title: 'Messages',
        icon: 'solar:chat-round-bold-duotone',
        href: '/communication/messages',
      });
    }
    
    if (config.communicationFeatures.announcements) {
      commItems.push({
        key: 'announcements',
        title: 'Announcements',
        icon: 'solar:megaphone-loud-bold-duotone',
        href: '/communication/announcements',
      });
    }
    
    if (config.communicationFeatures.events) {
      commItems.push({
        key: 'events',
        title: 'Events',
        icon: 'solar:calendar-mark-bold-duotone',
        href: '/communication/events',
      });
    }

    if (commItems.length > 0) {
      navigation.push({
        key: 'communication',
        title: 'Communication',
        icon: 'solar:phone-bold-duotone',
        type: SideBarItemType.Nest,
        items: commItems,
      });
    }
  }

  // Reports & Analytics
  if (config?.academicFeatures?.reports) {
    navigation.push({
      key: 'reports',
      title: 'Reports',
      icon: 'solar:chart-2-bold-duotone',
      type: SideBarItemType.Nest,
      items: [
        {
          key: 'academic-reports',
          title: 'Academic Reports',
          icon: 'solar:document-text-bold-duotone',
          href: '/reports/academic',
        },
        {
          key: 'financial-reports',
          title: 'Financial Reports',
          icon: 'solar:bill-list-bold-duotone',
          href: '/reports/financial',
        },
        {
          key: 'attendance-reports',
          title: 'Attendance Reports',
          icon: 'solar:calendar-mark-bold-duotone',
          href: '/reports/attendance',
        },
      ],
    });
  }

  // Settings
  navigation.push({
    key: 'settings',
    title: 'Settings',
    icon: 'solar:settings-bold-duotone',
    href: '/settings',
  });

  return navigation;
};

/**
 * Navigation items for Teachers
 */
export const getTeacherNavigation = (config?: SchoolNavigationConfig): SideBarItem[] => [
  {
    key: 'dashboard',
    title: 'Dashboard',
    icon: 'solar:home-2-bold-duotone',
    href: '/dashboard',
  },
  {
    key: 'my-classes',
    title: 'My Classes',
    icon: 'solar:course-up-bold-duotone',
    type: SideBarItemType.Nest,
    items: [
      {
        key: 'class-list',
        title: 'Class List',
        icon: 'solar:users-group-two-rounded-bold-duotone',
        href: '/classes',
      },
      {
        key: 'attendance',
        title: 'Attendance',
        icon: 'solar:calendar-mark-bold-duotone',
        href: '/classes/attendance',
      },
      {
        key: 'grades',
        title: 'Grades',
        icon: 'solar:medal-ribbons-star-bold-duotone',
        href: '/classes/grades',
      },
    ],
  },
  {
    key: 'assignments',
    title: 'Assignments',
    icon: 'solar:document-add-bold-duotone',
    type: SideBarItemType.Nest,
    items: [
      {
        key: 'create-assignment',
        title: 'Create Assignment',
        icon: 'solar:add-circle-bold-duotone',
        href: '/assignments/create',
      },
      {
        key: 'manage-assignments',
        title: 'Manage',
        icon: 'solar:clipboard-list-bold-duotone',
        href: '/assignments',
      },
      {
        key: 'submissions',
        title: 'Submissions',
        icon: 'solar:document-medicine-bold-duotone',
        href: '/assignments/submissions',
      },
    ],
  },
  {
    key: 'schedule',
    title: 'My Schedule',
    icon: 'solar:calendar-bold-duotone',
    href: '/schedule',
  },
  {
    key: 'messages',
    title: 'Messages',
    icon: 'solar:chat-round-bold-duotone',
    href: '/messages',
    endContent: <span className="w-2 h-2 bg-primary-500 rounded-full"></span>,
  },
  {
    key: 'resources',
    title: 'Resources',
    icon: 'solar:library-bold-duotone',
    href: '/resources',
  },
];

/**
 * Navigation items for Students
 */
export const getStudentNavigation = (): SideBarItem[] => [
  {
    key: 'dashboard',
    title: 'Dashboard',
    icon: 'solar:home-2-bold-duotone',
    href: '/dashboard',
  },
  {
    key: 'courses',
    title: 'My Courses',
    icon: 'solar:book-2-bold-duotone',
    href: '/courses',
  },
  {
    key: 'assignments',
    title: 'Assignments',
    icon: 'solar:document-add-bold-duotone',
    type: SideBarItemType.Nest,
    items: [
      {
        key: 'pending-assignments',
        title: 'Pending',
        icon: 'solar:clock-circle-bold-duotone',
        href: '/assignments/pending',
        endContent: <span className="text-xs bg-warning-100 text-warning-600 px-2 py-0.5 rounded-full">3</span>,
      },
      {
        key: 'submitted-assignments',
        title: 'Submitted',
        icon: 'solar:check-circle-bold-duotone',
        href: '/assignments/submitted',
      },
      {
        key: 'graded-assignments',
        title: 'Graded',
        icon: 'solar:medal-ribbons-star-bold-duotone',
        href: '/assignments/graded',
      },
    ],
  },
  {
    key: 'grades',
    title: 'Grades',
    icon: 'solar:chart-2-bold-duotone',
    href: '/grades',
  },
  {
    key: 'attendance',
    title: 'Attendance',
    icon: 'solar:calendar-mark-bold-duotone',
    href: '/attendance',
  },
  {
    key: 'schedule',
    title: 'Schedule',
    icon: 'solar:calendar-bold-duotone',
    href: '/schedule',
  },
  {
    key: 'library',
    title: 'Library',
    icon: 'solar:library-bold-duotone',
    href: '/library',
  },
  {
    key: 'messages',
    title: 'Messages',
    icon: 'solar:chat-round-bold-duotone',
    href: '/messages',
  },
];

/**
 * Navigation items for Parents
 */
export const getParentNavigation = (): SideBarItem[] => [
  {
    key: 'dashboard',
    title: 'Dashboard',
    icon: 'solar:home-2-bold-duotone',
    href: '/dashboard',
  },
  {
    key: 'children',
    title: 'My Children',
    icon: 'solar:users-group-two-rounded-bold-duotone',
    type: SideBarItemType.Nest,
    items: [
      {
        key: 'academic-progress',
        title: 'Academic Progress',
        icon: 'solar:chart-2-bold-duotone',
        href: '/children/progress',
      },
      {
        key: 'attendance',
        title: 'Attendance',
        icon: 'solar:calendar-mark-bold-duotone',
        href: '/children/attendance',
      },
      {
        key: 'assignments',
        title: 'Assignments',
        icon: 'solar:document-add-bold-duotone',
        href: '/children/assignments',
      },
      {
        key: 'grades',
        title: 'Grades',
        icon: 'solar:medal-ribbons-star-bold-duotone',
        href: '/children/grades',
      },
    ],
  },
  {
    key: 'fees',
    title: 'Fees & Payments',
    icon: 'solar:wallet-bold-duotone',
    type: SideBarItemType.Nest,
    items: [
      {
        key: 'fee-structure',
        title: 'Fee Structure',
        icon: 'solar:bill-list-bold-duotone',
        href: '/fees/structure',
      },
      {
        key: 'payment-history',
        title: 'Payment History',
        icon: 'solar:history-bold-duotone',
        href: '/fees/history',
      },
      {
        key: 'pending-dues',
        title: 'Pending Dues',
        icon: 'solar:danger-bold-duotone',
        href: '/fees/pending',
        endContent: <span className="text-xs bg-danger-100 text-danger-600 px-2 py-0.5 rounded-full">Due</span>,
      },
    ],
  },
  {
    key: 'communication',
    title: 'Communication',
    icon: 'solar:chat-round-bold-duotone',
    type: SideBarItemType.Nest,
    items: [
      {
        key: 'messages',
        title: 'Messages',
        icon: 'solar:letter-bold-duotone',
        href: '/communication/messages',
      },
      {
        key: 'announcements',
        title: 'Announcements',
        icon: 'solar:megaphone-loud-bold-duotone',
        href: '/communication/announcements',
      },
      {
        key: 'events',
        title: 'Events',
        icon: 'solar:calendar-mark-bold-duotone',
        href: '/communication/events',
      },
    ],
  },
  {
    key: 'meetings',
    title: 'Teacher Meetings',
    icon: 'solar:users-group-rounded-bold-duotone',
    href: '/meetings',
  },
];

/**
 * Get navigation items based on user role
 */
export const getNavigationByRole = (
  role: SchoolUserRole,
  config?: SchoolNavigationConfig
): SideBarItem[] => {
  switch (role) {
    case SchoolUserRole.SUPER_ADMIN:
      return getSuperAdminNavigation();
    
    case SchoolUserRole.ADMIN:
    case SchoolUserRole.PRINCIPAL:
    case SchoolUserRole.VICE_PRINCIPAL:
      return getAdminNavigation(config);
    
    case SchoolUserRole.TEACHER:
      return getTeacherNavigation(config);
    
    case SchoolUserRole.STUDENT:
      return getStudentNavigation();
    
    case SchoolUserRole.PARENT:
      return getParentNavigation();
    
    case SchoolUserRole.LIBRARIAN:
      return [
        {
          key: 'dashboard',
          title: 'Dashboard',
          icon: 'solar:home-2-bold-duotone',
          href: '/dashboard',
        },
        {
          key: 'library',
          title: 'Library Management',
          icon: 'solar:library-bold-duotone',
          type: SideBarItemType.Nest,
          items: [
            {
              key: 'books',
              title: 'Books',
              icon: 'solar:book-bold-duotone',
              href: '/library/books',
            },
            {
              key: 'issued-books',
              title: 'Issued Books',
              icon: 'solar:book-bookmark-bold-duotone',
              href: '/library/issued',
            },
            {
              key: 'returns',
              title: 'Returns',
              icon: 'solar:undo-left-bold-duotone',
              href: '/library/returns',
            },
          ],
        },
      ];
    
    case SchoolUserRole.ACCOUNTANT:
      return [
        {
          key: 'dashboard',
          title: 'Dashboard',
          icon: 'solar:home-2-bold-duotone',
          href: '/dashboard',
        },
        {
          key: 'finance',
          title: 'Financial Management',
          icon: 'solar:dollar-minimalistic-bold-duotone',
          type: SideBarItemType.Nest,
          items: [
            {
              key: 'income',
              title: 'Income',
              icon: 'solar:wallet-money-bold-duotone',
              href: '/finance/income',
            },
            {
              key: 'expenses',
              title: 'Expenses',
              icon: 'solar:bill-list-bold-duotone',
              href: '/finance/expenses',
            },
            {
              key: 'reports',
              title: 'Financial Reports',
              icon: 'solar:document-text-bold-duotone',
              href: '/finance/reports',
            },
          ],
        },
      ];
    
    default:
      return [
        {
          key: 'dashboard',
          title: 'Dashboard',
          icon: 'solar:home-2-bold-duotone',
          href: '/dashboard',
        },
      ];
  }
};

/**
 * Default navigation configurations for different roles
 */
export const getDefaultSchoolConfig = (role: SchoolUserRole): SchoolNavigationConfig => ({
  userRole: role,
  academicFeatures: {
    grades: true,
    attendance: true,
    assignments: true,
    examinations: true,
    timetable: true,
    library: true,
    transport: false,
    hostel: false,
    fees: true,
    reports: true,
  },
  adminFeatures: {
    userManagement: [SchoolUserRole.ADMIN, SchoolUserRole.PRINCIPAL].includes(role),
    schoolSettings: [SchoolUserRole.ADMIN, SchoolUserRole.PRINCIPAL].includes(role),
    academicYear: [SchoolUserRole.ADMIN, SchoolUserRole.PRINCIPAL].includes(role),
    subjects: true,
    classes: true,
    departments: [SchoolUserRole.ADMIN, SchoolUserRole.PRINCIPAL].includes(role),
    notifications: true,
    analytics: [SchoolUserRole.ADMIN, SchoolUserRole.PRINCIPAL].includes(role),
  },
  communicationFeatures: {
    messaging: true,
    announcements: true,
    events: true,
    parentPortal: [SchoolUserRole.ADMIN, SchoolUserRole.PRINCIPAL, SchoolUserRole.TEACHER].includes(role),
    staffPortal: [SchoolUserRole.ADMIN, SchoolUserRole.PRINCIPAL].includes(role),
  },
});