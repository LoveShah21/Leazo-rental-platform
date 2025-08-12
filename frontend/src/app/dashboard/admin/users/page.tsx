"use client";
import { useEffect, useMemo, useState } from "react";
import { Protected } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchAdminUsers, updateAdminUser, type AdminUser } from "@/lib/admin";
import { Users, Search, Check, X } from "lucide-react";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchAdminUsers({
        page,
        limit: 20,
        search: search || undefined,
        role: role !== "all" ? role : undefined,
        isActive: status === "all" ? undefined : status === "active",
        sort: "createdAt",
      });
      setUsers(res.users);
      setTotalPages(res.pagination.pages);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page]);

  const filteredCount = useMemo(() => users.length, [users]);

  async function toggleActive(u: AdminUser) {
    const updated = await updateAdminUser(u._id, { isActive: !u.isActive });
    setUsers(prev => prev.map(p => (p._id === u._id ? { ...p, isActive: updated.isActive } : p)));
  }

  return (
    <Protected roles={["admin", "super_admin", "manager", "staff"]}>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-8">
          <PageHeader title="User Management" subtitle="Manage users, roles, and account status" />

          <Card className="p-6 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" placeholder="Name or email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="provider">Provider</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={() => { setPage(1); load(); }}>Apply</Button>
              </div>
            </div>
          </Card>

          {error && (
            <Card className="p-4 border-0 shadow-lg bg-red-50 text-red-700">{error}</Card>
          )}

          {loading ? (
            <Card className="p-6 border-0 shadow-lg">Loading...</Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {users.map((u) => (
                <Card key={u._id} className="p-4 border-0 shadow-lg bg-white/70 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                    <div className="text-sm text-gray-600">{u.email}</div>
                    <div className="text-xs text-gray-500 mt-1">Role: {u.role}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={u.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}>
                      {u.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => toggleActive(u)}>
                      {u.isActive ? <X className="h-4 w-4 mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                      {u.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </Card>
              ))}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">{filteredCount} users</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </Protected>
  );
}

