import { PrismaClient, Tenant } from "@prisma/client";

// Ensure single instance in dev
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	});

if (process.env.NODE_ENV === "development") globalForPrisma.prisma = prisma;

/**
 * Ensure a Tenant exists for a given user email based on its domain.
 * This is a minimal provisioning helper until full user/membership models exist.
 */
export async function ensureTenantForEmail(email: string): Promise<Tenant | null> {
	if (!email || !email.includes("@")) return null;
	const domain = email.split("@")[1]?.toLowerCase();
	if (!domain) return null;
	let tenant = await prisma.tenant.findUnique({ where: { domain } });
	if (!tenant) {
		tenant = await prisma.tenant.create({
			data: {
				domain,
				name: domain,
			},
		});
	}
	return tenant;
}
