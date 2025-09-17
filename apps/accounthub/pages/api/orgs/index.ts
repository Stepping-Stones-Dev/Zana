import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const createOrgSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
});

const updateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get user from session (mock for now)
    const userId = await getUserFromSession(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    switch (req.method) {
      case 'GET':
        return handleGetOrganizations(req, res, userId);
      case 'POST':
        return handleCreateOrganization(req, res, userId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Organizations API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetOrganizations(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  // Mock data - would query database
  const organizations = [
    {
      id: 'org_1',
      name: 'Acme Corp',
      slug: 'acme',
      ownerUid: userId,
      createdAt: new Date('2024-01-15').toISOString(),
      role: 'owner',
    },
  ];

  return res.json({ organizations });
}

async function handleCreateOrganization(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { name, slug } = createOrgSchema.parse(req.body);
    
    // Check slug availability (mock)
    const isSlugTaken = await checkSlugAvailability(slug);
    if (isSlugTaken) {
      return res.status(400).json({ error: 'Slug already taken' });
    }
    
    // Create organization (mock)
    const organization = {
      id: 'org_' + Date.now(),
      name,
      slug,
      ownerUid: userId,
      createdAt: new Date().toISOString(),
    };
    
    // Create owner membership (mock)
    const membership = {
      orgId: organization.id,
      uid: userId,
      role: 'owner',
      createdAt: new Date().toISOString(),
    };
    
    // Create primary slug record (mock)
    const orgSlug = {
      orgId: organization.id,
      slug,
      isPrimary: true,
      createdAt: new Date().toISOString(),
    };
    
    return res.status(201).json({ organization });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: error.errors 
      });
    }
    throw error;
  }
}

// Mock functions - would be replaced with actual database operations
async function getUserFromSession(req: NextApiRequest): Promise<string | null> {
  const sessionCookie = req.cookies.session;
  if (!sessionCookie || sessionCookie.startsWith('session_')) {
    return 'user_123'; // Mock user
  }
  return null;
}

async function checkSlugAvailability(slug: string): Promise<boolean> {
  const reservedSlugs = ['admin', 'api', 'www', 'mail', 'support', 'help'];
  return reservedSlugs.includes(slug.toLowerCase());
}