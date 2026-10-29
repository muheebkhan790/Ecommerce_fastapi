"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { accountApi } from "../../../lib/api/account";
import { useAuth } from "../../../context/AuthContext";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("idle"); // idle, verifying, success, error
  const [message, setMessage] = useState("");

  const verifyToken = useCallback(async (tokenToVerify) => {
    if (!tokenToVerify) return;
    setStatus("verifying");
    try {
      const res = await accountApi.verifyEmail(tokenToVerify);
      setStatus("success");
      setMessage(res?.message || "Email verified successfully!");
      await refreshUser();
    } catch (err) {
      console.error("Verification error:", err);
      setStatus("error");
      setMessage(err.message || "Failed to verify email. Token may be expired.");
    }
  }, [refreshUser]);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
      verifyToken(urlToken);
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyToken(token);
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl text-center">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-xl mb-4">
        ✉️
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
        Email Verification
      </h1>

      {status === "verifying" && (
        <div className="py-8 space-y-3">
          <div className="w-8 h-8 mx-auto border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-300">Verifying your email token...</p>
        </div>
      )}

      {status === "success" && (
        <div className="py-6 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
            ✓
          </div>
          <h3 className="text-base font-semibold text-white">{message}</h3>
          <p className="text-xs text-slate-400">
            Your email is now verified. You have full access to all platform features.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push("/account")}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-500 transition-colors"
            >
              Go to Account →
            </button>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="py-6 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xl">
            ✕
          </div>
          <h3 className="text-base font-semibold text-white">Verification Failed</h3>
          <p className="text-xs text-red-300">{message}</p>
          <div className="pt-2">
            <Link
              href="/account"
              className="inline-block px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-medium text-xs hover:bg-slate-700 transition-colors"
            >
              Back to Account
            </Link>
          </div>
        </div>
      )}

      {status === "idle" && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <p className="text-xs text-slate-400 text-center mb-4">
            If you have a verification token from your email, paste it below:
          </p>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Verification Token
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token here"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-mono text-white placeholder-slate-600 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
          >
            Verify Now
          </button>
        </form>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
