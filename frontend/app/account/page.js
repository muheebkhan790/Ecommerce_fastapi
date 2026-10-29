"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { accountApi } from "../../lib/api/account";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();
  const [emailStatus, setEmailStatus] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  const handleSendVerification = async () => {
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await accountApi.sendVerificationEmail();
      setEmailStatus({
        type: "success",
        message: res?.message || "Verification email sent! Check your inbox.",
      });
    } catch (err) {
      console.error("Failed to send verification:", err);
      setEmailStatus({
        type: "error",
        message: err.message || "Failed to send verification email.",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading || !user) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 w-full animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded mb-8" />
        <div className="h-64 rounded-3xl bg-slate-900 border border-slate-800" />
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Account Management
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            My Profile
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all"
        >
          Sign Out
        </button>
      </div>

      {emailStatus && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between ${
            emailStatus.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border border-red-500/30 text-red-300"
          }`}
        >
          <span>{emailStatus.message}</span>
          <button
            onClick={() => setEmailStatus(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* User Details Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-md dark:shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-bold text-2xl text-white uppercase shadow-md shadow-orange-500/20">
            {user.email?.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.email}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Account ID: <span className="font-mono text-slate-700 dark:text-slate-300">#{user.id}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          {/* Email Verification Status */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
              Email Status
            </span>
            <div className="mt-2 flex items-center justify-between">
              {user.is_verified ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  ✓ Verified
                </span>
              ) : (
                <div className="flex flex-col gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                    ⚠ Unverified
                  </span>
                  <button
                    onClick={handleSendVerification}
                    disabled={sendingEmail}
                    className="text-left text-[11px] text-orange-600 dark:text-orange-400 hover:underline disabled:opacity-50"
                  >
                    {sendingEmail ? "Sending..." : "Send Verification"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Role Status */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
              Role
            </span>
            <div className="mt-2">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                  ★ Administrator
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Customer
                </span>
              )}
            </div>
          </div>

          {/* Account Activity */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
              Account Status
            </span>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                ● Active
              </span>
            </div>
          </div>
        </div>

        {/* Action shortcuts */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-3">
          <Link
            href="/account/change-password"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Change Password →
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-500/40 transition-colors"
            >
              Go to Admin Dashboard →
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
