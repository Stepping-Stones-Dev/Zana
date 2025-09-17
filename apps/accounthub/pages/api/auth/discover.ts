import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const discoverSchema = z.object({
  email: z.string().email(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = discoverSchema.parse(req.body);
    
    // Extract domain from email
    const domain = email.split('@')[1];
    
    // Check if domain has SSO configured
    // This would normally query the database
    const orgDomain = await findOrgDomainByDomain(domain);
    
    if (orgDomain && orgDomain.verified) {
      // Redirect to SSO provider
      const redirectUrl = `/api/auth/sso/${orgDomain.providerType}?domain=${domain}`;
      
      return res.json({
        provider: orgDomain.providerType,
        redirectUrl,
        organization: orgDomain.orgId,
      });
    }
    
    // No SSO configured, use regular auth
    return res.json({
      provider: null,
      local: true,
    });
    
  } catch (error) {
    console.error('Discovery error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: error.errors 
      });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Mock function - would be replaced with actual database query
async function findOrgDomainByDomain(domain: string) {
  // Skip public domains
  const publicDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  if (publicDomains.includes(domain.toLowerCase())) {
    return null;
  }
  
  // Mock data - replace with actual database query
  if (domain === 'example.com') {
    return {
      orgId: 'org_123',
      domain: 'example.com',
      verified: true,
      providerType: 'saml',
      providerConfigId: 'saml_config_123',
    };
  }
  
  return null;
}