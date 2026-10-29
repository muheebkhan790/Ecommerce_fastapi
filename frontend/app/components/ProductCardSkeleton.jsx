"use client";

export default function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between h-[390px] shadow-xs">
      <div>
        {/* Image Skeleton with Shimmer */}
        <div className="w-full h-52 rounded-xl skeleton-shimmer mb-3.5" />

        {/* Categories Skeleton */}
        <div className="flex gap-1.5 mb-2.5">
          <div className="w-16 h-4 rounded-md skeleton-shimmer" />
          <div className="w-12 h-4 rounded-md skeleton-shimmer" />
        </div>

        {/* Title Skeleton */}
        <div className="w-3/4 h-5 rounded-lg skeleton-shimmer mb-2" />

        {/* Rating Skeleton */}
        <div className="w-1/3 h-4 rounded-md skeleton-shimmer mb-3" />

        {/* Price Skeleton */}
        <div className="w-1/2 h-6 rounded-lg skeleton-shimmer mb-4" />
      </div>

      {/* Action Buttons Skeleton */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="h-8 rounded-xl skeleton-shimmer" />
        <div className="h-8 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  );
}
