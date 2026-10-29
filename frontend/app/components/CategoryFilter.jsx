"use client";

export default function CategoryFilter({ categories = [], selected = [], setSelected }) {
  const toggle = (name) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  const clearAll = () => setSelected([]);

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center gap-1.5 pl-2 pr-1 text-slate-500 dark:text-slate-400">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="text-[11px] font-bold uppercase tracking-wider">
          Filter:
        </span>
      </div>

      {/* "All" button */}
      <button
        type="button"
        onClick={clearAll}
        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
          selected.length === 0
            ? "bg-[#EA580C] text-white shadow-sm shadow-orange-600/30 font-bold"
            : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        All Products
      </button>

      {/* Dynamic category pills with smooth transition */}
      {categories.map((c) => {
        const isSelected = selected.includes(c.name);
        return (
          <button
            key={c.id || c.name}
            type="button"
            onClick={() => toggle(c.name)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95 border ${
              isSelected
                ? "bg-[#EA580C] text-white border-orange-500 shadow-sm shadow-orange-600/30 font-bold"
                : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {isSelected ? "✓ " : "+ "}
            {c.name}
          </button>
        );
      })}

      {selected.length > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-rose-500 hover:text-rose-600 font-medium px-2 py-1 underline cursor-pointer active:scale-95"
        >
          Reset ({selected.length})
        </button>
      )}
    </div>
  );
}
