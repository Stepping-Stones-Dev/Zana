import type { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
	size?: number;
};

// User types
export interface AuthUser {
	uid: string;
	email: string;
	displayName?: string | null;
	photoURL?: string | null;
	emailVerified: boolean;
	createdAt: string;
}

export interface User {
	uid: string;
	email: string;
	displayName?: string | null;
	photoURL?: string | null;
	createdAt: string;
	updatedAt?: string;
}

// Organization types
export interface Organization {
	id: string;
	name: string;
	ownerUid: string;
	createdAt: string;
	updatedAt?: string;
	archivedAt?: string | null;
}

export interface Membership {
	orgId: string;
	uid: string;
	role: 'owner' | 'admin' | 'member';
	createdAt: string;
	updatedAt?: string;
}

export interface OrganizationWithRole extends Organization {
	role: 'owner' | 'admin' | 'member';
	memberCount?: number;
}

// Slug and domain types
export interface OrgSlug {
	orgId: string;
	slug: string;
	isPrimary: boolean;
	createdAt: string;
}

export interface OrgDomain {
	orgId: string;
	domain: string;
	verified: boolean;
	providerType?: 'saml' | 'oidc';
	providerConfigId?: string;
	createdAt: string;
	verifiedAt?: string;
}

// Subscription and billing types
export interface Subscription {
	id: string;
	orgId: string;
	planId: string;
	status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
	provider: 'stripe' | 'paypal' | 'pesapal';
	customerId: string;
	currentPeriodStart: string;
	currentPeriodEnd: string;
	cancelAtPeriodEnd?: boolean;
	createdAt: string;
	updatedAt?: string;
}

export interface Plan {
	id: string;
	name: string;
	description: string;
	price: number;
	currency: string;
	interval: 'month' | 'year';
	features: string[];
	maxUsers?: number;
	maxStorage?: number;
	popular?: boolean;
}

export interface Invoice {
	id: string;
	orgId: string;
	subscriptionId: string;
	amount: number;
	currency: string;
	status: 'draft' | 'paid' | 'failed' | 'refunded';
	dueDate: string;
	paidAt?: string;
	createdAt: string;
}

// API response types
export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	hasNext: boolean;
	hasPrev: boolean;
}

// Form types
export interface CreateOrganizationRequest {
	name: string;
	slug: string;
}

export interface UpdateOrganizationRequest {
	name?: string;
}

export interface CreateSlugRequest {
	slug: string;
	isPrimary?: boolean;
}

export interface InviteMemberRequest {
	email: string;
	role: 'admin' | 'member';
}

// Auth discovery types
export interface DiscoveryRequest {
	email: string;
}

export interface DiscoveryResponse {
	provider?: string;
	redirectUrl?: string;
	organization?: string;
	local?: boolean;
}
