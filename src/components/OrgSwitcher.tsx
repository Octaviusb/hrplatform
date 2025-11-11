import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

type Org = { id: string; name: string };

export default function OrgSwitcher() {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = user?.globalRole === 'superadmin';

  useEffect(() => {
    if (!isSuperAdmin) return;
    setLoading(true);
    api
      .get('/admin/superadmin/organizations')
      .then((res) => {
        const items = (res as any[]).map((o) => ({ id: o.id, name: o.name }));
        setOrgs(items);
      })
      .finally(() => setLoading(false));
  }, [isSuperAdmin]);

  if (!user) return null;

  // For demo, mostramos switcher solamente a superadmin
  if (!isSuperAdmin) return null;

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const orgId = e.target.value || null;
    api.setOrganizationId(orgId);
  };

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm text-gray-600">Organización:</label>
      <select
        className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={loading}
        onChange={handleChange}
        defaultValue={localStorage.getItem('organizationId') || ''}
      >
        <option value="">— Ninguna —</option>
        {orgs.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}
