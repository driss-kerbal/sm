"use client";

import { useEffect, useState } from "react";

interface HealthStatus {
  status: string;
  database?: any;
  environment?: any;
  error?: string;
  timestamp?: string;
}

export default function DebugPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/health");
        const data = await response.json();
        setHealth(data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Debug - Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🐛 Application Debug</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h2 className="font-bold mb-2">Error:</h2>
            <pre className="whitespace-pre-wrap break-words">{error}</pre>
          </div>
        )}

        {health && (
          <>
            <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded">
              <h2 className="font-bold text-lg mb-2">Status: {health.status}</h2>
              <p className="text-sm text-gray-600">{health.timestamp}</p>
            </div>

            {health.database && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <h2 className="font-bold text-lg mb-4">Database</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Initialized:</span>
                    <span>{health.database.initialized ? "✅ Yes" : "❌ No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Users Table:</span>
                    <span>{health.database.tables.users ? "✅ Exists" : "❌ Missing"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Students Table:</span>
                    <span>{health.database.tables.students ? "✅ Exists" : "❌ Missing"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admin User:</span>
                    <span>{health.database.adminUserExists ? "✅ Exists" : "❌ Missing"}</span>
                  </div>
                </div>
              </div>
            )}

            {health.environment && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded">
                <h2 className="font-bold text-lg mb-4">Environment</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Node ENV:</span>
                    <span className="font-mono">{health.environment.nodeEnv}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>NEXTAUTH_SECRET:</span>
                    <span>{health.environment.hasNextAuthSecret ? "✅ Set" : "❌ Missing"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>NEXTAUTH_URL:</span>
                    <span className="font-mono text-sm">{health.environment.nextAuthUrl || "❌ Missing"}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h2 className="font-bold mb-2">Test Credentials</h2>
              <p className="text-sm">
                <strong>Email:</strong> admin@example.com<br />
                <strong>Password:</strong> admin123
              </p>
              <a 
                href="/login" 
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go to Login
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
