"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { accountApi } from "../../../lib/api/account";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword.toLowerCase() === newPassword || newPassword.toUpperCase() === newPassword) {
      setError("Password must contain both uppercase and lowercase letters.");
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError("Password must contain at least one digit.");
      return;
    }

    setLoading(true);

    try {
      await accountApi.verifyPasswordResetToken({
        token,
        new_password: newPassword,
      });
      setSuccess(true);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err.message || "Invalid or expired reset token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-8">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-xl mb-3">
          🔒
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Set New Password
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Provide your verification token and create a strong password
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}

      {success ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
            ✓
          </div>
          <h3 className="text-base font-semibold text-white">Password Reset Successful</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your password has been securely updated. You can now log in with your new credentials.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push("/login")}
              className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-500 transition-colors"
            >
              Sign In Now →
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Reset Token
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token received in email"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-mono text-white placeholder-slate-600 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters, Upper & Lower, Digit"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-600 outline-none transition-all"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Must contain upper & lower letters and at least 1 number.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-600 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      )}

      <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
        Return to{" "}
        <Link
          href="/login"
          className="text-indigo-400 hover:text-indigo-300 font-semibold"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}
