'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldOff, ShieldCheck } from 'lucide-react';
import { fetchAdminUsers, setUserActiveStatus } from '@/lib/admin';
import Button from '@/components/ui/Button';
import Pagination from '@/components/listings/Pagination';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended' | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, status, page],
    queryFn: () => fetchAdminUsers({ search: search || undefined, status, page }),
  });

  const handleToggle = async (userId: string, nextActive: boolean) => {
    setPendingId(userId);
    try {
      await setUserActiveStatus(userId, nextActive);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-primary">Users</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email…"
          className="flex-1 rounded-lg border border-white/10 bg-surface px-4 py-2 text-ink-primary placeholder:text-ink-faint focus:border-amber focus:outline-none"
        />
        <select
          value={status || ''}
          onChange={(e) => {
            setStatus((e.target.value || undefined) as 'active' | 'suspended' | undefined);
            setPage(1);
          }}
          className="rounded-lg border border-white/10 bg-surface px-4 py-2 text-ink-primary"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-card border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-surface-raised text-ink-muted">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-surface">
            {isLoading && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-ink-muted">
                  Loading…
                </td>
              </tr>
            )}
            {data?.users.map((u) => (
              <tr key={u._id}>
                <td className="p-3 text-ink-primary">{u.fullName}</td>
                <td className="p-3 text-ink-muted">{u.email}</td>
                <td className="p-3 font-mono text-xs uppercase text-ink-faint">{u.role}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      u.isActive ? 'bg-teal/10 text-teal-soft' : 'bg-danger/10 text-danger'
                    }`}
                  >
                    {u.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="p-3">
                  {u.role !== 'admin' && (
                    <Button
                      variant="secondary"
                      isLoading={pendingId === u._id}
                      onClick={() => handleToggle(u._id, !u.isActive)}
                    >
                      {u.isActive ? (
                        <>
                          <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" /> Suspend
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Reactivate
                        </>
                      )}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && <Pagination meta={data.pagination} onPageChange={setPage} />}
    </div>
  );
}
