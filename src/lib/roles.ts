export function hasOrgRole(
  user: any | null | undefined,
  roleKey: string,
  organizationId?: string | null
): boolean {
  if (!user?.memberships) return false;
  if (user.globalRole === 'superadmin') return true;
  const memberships = user.memberships as Array<{ organizationId: string; roles: string[] }>;
  if (organizationId) {
    const m = memberships.find(m => m.organizationId === organizationId);
    return !!m && m.roles?.includes(roleKey);
  }
  // if no org provided, check any membership
  return memberships.some(m => m.roles?.includes(roleKey));
}
