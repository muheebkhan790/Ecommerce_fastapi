"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { accountApi } from "../../../lib/api/account";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await accountApi.register({
        email,
        password,
        is_active: true,
        is_admin: false,
        is_verified: false,
      });

      // Automatically log the user in after registration
      try {
        await login({ email, password });
        router.push("/account");
      } catch {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.message || "Registration failed. Email might already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-bold text-orange-600 dark:text-orange-400 text-xl mb-3">
            ⚡
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create an Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Join NEXSTORE to browse and purchase curated products
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
              ✓
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Account Created!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your account has been registered successfully.
            </p>
            <Link
              href="/login"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#EA580C] text-white font-bold text-xs hover:bg-[#C2410C] transition-all"
            >
              Proceed to Sign In →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
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
                "Create Account"
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-orange-600 dark:text-orange-400 hover:underline font-bold"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
