import { 
  collection, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { 
  User,
  Organization, 
  Membership, 
  OrgSlug, 
  OrgDomain, 
  Subscription,
  Invoice 
} from '@zana/types';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  ORGANIZATIONS: 'organizations', 
  MEMBERSHIPS: 'memberships',
  ORG_SLUGS: 'orgSlugs',
  ORG_DOMAINS: 'orgDomains',
  SUBSCRIPTIONS: 'subscriptions',
  INVOICES: 'invoices',
} as const;

// Firestore converters
export const userConverter: FirestoreDataConverter<User> = {
  toFirestore: (user: User) => ({
    ...user,
    createdAt: user.createdAt ? Timestamp.fromDate(new Date(user.createdAt)) : Timestamp.now(),
    updatedAt: Timestamp.now(),
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return {
      uid: snapshot.id,
      email: data.email,
      displayName: data.displayName || null,
      photoURL: data.photoURL || null,
      createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
    };
  }
};

export const organizationConverter: FirestoreDataConverter<Organization> = {
  toFirestore: (org: Organization) => ({
    ...org,
    createdAt: org.createdAt ? Timestamp.fromDate(new Date(org.createdAt)) : Timestamp.now(),
    updatedAt: Timestamp.now(),
    archivedAt: org.archivedAt ? Timestamp.fromDate(new Date(org.archivedAt)) : null,
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name,
      ownerUid: data.ownerUid,
      createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
      archivedAt: data.archivedAt?.toDate().toISOString() || null,
    };
  }
};

export const membershipConverter: FirestoreDataConverter<Membership> = {
  toFirestore: (membership: Membership) => ({
    ...membership,
    createdAt: membership.createdAt ? Timestamp.fromDate(new Date(membership.createdAt)) : Timestamp.now(),
    updatedAt: Timestamp.now(),
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return {
      orgId: data.orgId,
      uid: data.uid,
      role: data.role,
      createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
    };
  }
};

// Collection references
export function getUsersCollection(db: Firestore) {
  return collection(db, COLLECTIONS.USERS).withConverter(userConverter);
}

export function getOrganizationsCollection(db: Firestore) {
  return collection(db, COLLECTIONS.ORGANIZATIONS).withConverter(organizationConverter);
}

export function getMembershipsCollection(db: Firestore) {
  return collection(db, COLLECTIONS.MEMBERSHIPS).withConverter(membershipConverter);
}

export function getOrgSlugsCollection(db: Firestore) {
  return collection(db, COLLECTIONS.ORG_SLUGS);
}

export function getOrgDomainsCollection(db: Firestore) {
  return collection(db, COLLECTIONS.ORG_DOMAINS);
}

export function getSubscriptionsCollection(db: Firestore) {
  return collection(db, COLLECTIONS.SUBSCRIPTIONS);
}

export function getInvoicesCollection(db: Firestore) {
  return collection(db, COLLECTIONS.INVOICES);
}

// Document references
export function getUserDoc(db: Firestore, uid: string) {
  return doc(getUsersCollection(db), uid);
}

export function getOrganizationDoc(db: Firestore, orgId: string) {
  return doc(getOrganizationsCollection(db), orgId);
}

// Helper functions
export async function findUserByEmail(db: Firestore, email: string): Promise<User | null> {
  const q = query(
    getUsersCollection(db),
    where('email', '==', email),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : snapshot.docs[0].data();
}

export async function findOrganizationsByUser(db: Firestore, uid: string): Promise<Organization[]> {
  // First get user's memberships
  const membershipsQuery = query(
    getMembershipsCollection(db),
    where('uid', '==', uid)
  );
  
  const membershipsSnapshot = await getDocs(membershipsQuery);
  const orgIds = membershipsSnapshot.docs.map(doc => doc.data().orgId);
  
  if (orgIds.length === 0) return [];
  
  // Get organizations (in chunks if needed for large numbers)
  const orgs: Organization[] = [];
  for (const orgId of orgIds) {
    const orgDoc = await getDoc(getOrganizationDoc(db, orgId));
    if (orgDoc.exists()) {
      orgs.push(orgDoc.data());
    }
  }
  
  return orgs;
}

export async function findOrgBySlug(db: Firestore, slug: string): Promise<{ org: Organization; slug: OrgSlug } | null> {
  const slugQuery = query(
    getOrgSlugsCollection(db),
    where('slug', '==', slug),
    where('isPrimary', '==', true),
    limit(1)
  );
  
  const slugSnapshot = await getDocs(slugQuery);
  if (slugSnapshot.empty) return null;
  
  const slugDoc = slugSnapshot.docs[0];
  const slugData = slugDoc.data() as OrgSlug;
  
  const orgDoc = await getDoc(getOrganizationDoc(db, slugData.orgId));
  if (!orgDoc.exists()) return null;
  
  return {
    org: orgDoc.data(),
    slug: slugData,
  };
}

export async function findOrgDomainByDomain(db: Firestore, domain: string): Promise<OrgDomain | null> {
  const domainQuery = query(
    getOrgDomainsCollection(db),
    where('domain', '==', domain),
    where('verified', '==', true),
    limit(1)
  );
  
  const snapshot = await getDocs(domainQuery);
  return snapshot.empty ? null : snapshot.docs[0].data() as OrgDomain;
}

export async function isSlugAvailable(db: Firestore, slug: string): Promise<boolean> {
  const slugQuery = query(
    getOrgSlugsCollection(db),
    where('slug', '==', slug),
    limit(1)
  );
  
  const snapshot = await getDocs(slugQuery);
  return snapshot.empty;
}

// Reserved slugs that cannot be used
export const RESERVED_SLUGS = [
  'admin', 'api', 'app', 'assets', 'auth', 'billing', 'blog', 'cdn', 'console',
  'dashboard', 'dev', 'docs', 'ftp', 'help', 'mail', 'support', 'www', 'status',
  'staging', 'test', 'beta', 'alpha', 'demo', 'sandbox', 'prod', 'production'
];

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}