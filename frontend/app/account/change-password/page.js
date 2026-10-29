"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { accountApi } from "../../../lib/api/account";
import { useAuth } from "../../../context/AuthContext";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      await accountApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Change password error:", err);
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && !isAuthenticated) {
    router.push("/login");
    return null;
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-12 w-full">
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update your account password securely
            </p>
          </div>
          <Link
            href="/account"
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-white font-semibold transition-colors"
          >
            ← Back
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            ✓ Password updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters, Upper & Lower, Digit"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
