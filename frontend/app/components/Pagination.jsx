"use client";

export default function Pagination({ page, setPage, total = 0, limit = 6 }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-slate-200 dark:border-slate-800/80 mt-8">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing page <span className="font-semibold text-slate-900 dark:text-slate-200">{page}</span> of{" "}
        <span className="font-semibold text-slate-900 dark:text-slate-200">{totalPages}</span> ({total} products)
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          ← Prev
        </button>

        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          if (
            totalPages > 7 &&
            pageNum !== 1 &&
            pageNum !== totalPages &&
            Math.abs(pageNum - page) > 1
          ) {
            if (pageNum === 2 || pageNum === totalPages - 1) {
              return (
                <span key={pageNum} className="text-slate-400 px-1 text-xs">
                  ...
                </span>
              );
            }
            return null;
          }

          const isCurrent = page === pageNum;
          return (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95 ${
                isCurrent
                  ? "bg-[#EA580C] text-white shadow-sm shadow-orange-600/30 font-bold"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
