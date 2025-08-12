"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  fetchAdminUsers,
  fetchAdminProducts,
  fetchAdminDashboard,
} from "@/lib/admin";
import { authFetch } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";

export default function AdminDebugPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testEndpoint = async (name: string, testFn: () => Promise<any>) => {
    setLoading((prev) => ({ ...prev, [name]: true }));
    try {
      const result = await testFn();
      setResults((prev) => ({
        ...prev,
        [name]: { success: true, data: result },
      }));
    } catch (error: any) {
      setResults((prev) => ({
        ...prev,
        [name]: { success: false, error: error.message },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [name]: false }));
    }
  };

  const tests = [
    {
      name: "Auth Check",
      test: async () => {
        const res = await authFetch(`${API_BASE_URL}/auth/me`);
        if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
        return await res.json();
      },
    },
    {
      name: "Admin Dashboard",
      test: () => fetchAdminDashboard("30d"),
    },
    {
      name: "Admin Users",
      test: () => fetchAdminUsers({ page: 1, limit: 5 }),
    },
    {
      name: "Admin Products",
      test: () => fetchAdminProducts({ page: 1, limit: 5 }),
    },
    {
      name: "Direct Admin Users API",
      test: async () => {
        const res = await authFetch(
          `${API_BASE_URL}/admin/users?page=1&limit=5`
        );
        if (!res.ok)
          throw new Error(`API failed: ${res.status} ${res.statusText}`);
        return await res.json();
      },
    },
    {
      name: "Direct Admin Products API",
      test: async () => {
        const res = await authFetch(
          `${API_BASE_URL}/admin/products?page=1&limit=5`
        );
        if (!res.ok)
          throw new Error(`API failed: ${res.status} ${res.statusText}`);
        return await res.json();
      },
    },
  ];

  return (
    <Protected roles={["admin", "super_admin", "manager", "staff"]}>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <h1 className="text-2xl font-bold">Admin API Debug</h1>

          <div className="grid gap-4">
            {tests.map(({ name, test }) => (
              <Card key={name} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{name}</h3>
                  <Button
                    onClick={() => testEndpoint(name, test)}
                    disabled={loading[name]}
                    size="sm"
                  >
                    {loading[name] ? "Testing..." : "Test"}
                  </Button>
                </div>

                {results[name] && (
                  <div className="mt-4">
                    <div
                      className={`p-3 rounded text-sm ${
                        results[name].success
                          ? "bg-green-50 text-green-800"
                          : "bg-red-50 text-red-800"
                      }`}
                    >
                      <strong>Status:</strong>{" "}
                      {results[name].success ? "Success" : "Failed"}
                    </div>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(results[name], null, 2)}
                    </pre>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <Button
            onClick={() => {
              tests.forEach(({ name, test }) => testEndpoint(name, test));
            }}
            className="w-full"
          >
            Run All Tests
          </Button>
        </div>
      </DashboardLayout>
    </Protected>
  );
}
