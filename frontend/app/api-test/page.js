"use client";

import { useState } from "react";
import { BACKEND_URL } from "../../lib/constants";
import { productsApi } from "../../lib/api/products";
import { categoriesApi } from "../../lib/api/categories";
import { accountApi } from "../../lib/api/account";

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState([]);
  const [running, setRunning] = useState(false);

  const endpoints = [
    {
      name: "List Categories",
      method: "GET",
      path: "/api/products-category/",
      action: () => categoriesApi.getAll(),
    },
    {
      name: "List Products (Default)",
      method: "GET",
      path: "/api/products/?limit=5&page=1",
      action: () => productsApi.getAll({ limit: 5, page: 1 }),
    },
    {
      name: "Get Current User Profile",
      method: "GET",
      path: "/api/account/me",
      action: () => accountApi.getMe(),
    },
    {
      name: "Check Admin Authorization",
      method: "GET",
      path: "/api/account/admin",
      action: () => accountApi.checkAdmin(),
    },
  ];

  const runAllTests = async () => {
    setRunning(true);
    setTestResults([]);

    const results = [];
    for (const ep of endpoints) {
      const start = performance.now();
      try {
        const data = await ep.action();
        const duration = Math.round(performance.now() - start);
        results.push({
          ...ep,
          status: "SUCCESS",
          duration,
          data,
        });
      } catch (err) {
        const duration = Math.round(performance.now() - start);
        results.push({
          ...ep,
          status: "ERROR",
          duration,
          error: err.message,
          statusCode: err.status || "Network Error",
        });
      }
      setTestResults([...results]);
    }
    setRunning(false);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            System Diagnostics
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Backend API Endpoint Tester
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Target Backend: <code className="text-orange-600 dark:text-orange-400 font-mono">{BACKEND_URL}</code>
          </p>
        </div>

        <button
          onClick={runAllTests}
          disabled={running}
          className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-600/30 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer active:scale-95"
        >
          {running ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Testing Endpoints...</span>
            </>
          ) : (
            <span>Run All Endpoint Tests</span>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {testResults.length === 0 && !running && (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs shadow-xs">
            Click "Run All Endpoint Tests" above to test all backend routes live.
          </div>
        )}

        {testResults.map((result, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-mono">
                  {result.method}
                </span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {result.name}
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  {result.path}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">
                  {result.duration}ms
                </span>
                {result.status === "SUCCESS" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                    200 OK
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                    {result.statusCode || "FAILED"}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 text-[11px] font-mono overflow-x-auto max-h-40 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
              {result.status === "SUCCESS" ? (
                <pre>{JSON.stringify(result.data, null, 2)}</pre>
              ) : (
                <span className="text-rose-500">
                  {result.error || "Request failed"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
