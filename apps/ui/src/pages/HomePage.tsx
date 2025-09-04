import React from "react";
import { useAuth } from "../context/AuthContext";

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-brand-600" />
            <span className="font-semibold">Open File Sharing</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.username}</span>
            <button className="btn btn-primary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold">Welcome</h2>
          <p className="mt-2 text-gray-600">
            This is a protected area. Implement media features here per the
            architecture.
          </p>
        </div>
      </main>
    </div>
  );
};
