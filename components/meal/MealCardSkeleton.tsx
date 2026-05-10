export function MealCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden animate-pulse">
      <div className="p-5 pb-3">
        <div className="flex items-start gap-3">
          {/* Icon placeholder */}
          <div className="w-9 h-9 rounded-full bg-amber-100 flex-shrink-0" />

          <div className="flex-1 space-y-2">
            {/* Title */}
            <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
            {/* Tags */}
            <div className="flex gap-1.5">
              <div className="h-5 bg-gray-100 rounded-full w-16" />
              <div className="h-5 bg-gray-100 rounded-full w-12" />
              <div className="h-5 bg-gray-100 rounded-full w-20" />
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="mt-3 space-y-2">
          <div className="h-3.5 bg-gray-100 rounded w-full" />
          <div className="h-3.5 bg-gray-100 rounded w-5/6" />
        </div>

        {/* Nutrition tags */}
        <div className="flex gap-1 mt-2">
          <div className="h-5 bg-green-50 rounded-full w-14" />
          <div className="h-5 bg-green-50 rounded-full w-18" />
        </div>
      </div>

      {/* Button placeholder */}
      <div className="px-5 pb-5 pt-3">
        <div className="h-11 bg-amber-100 rounded-xl w-full" />
      </div>
    </div>
  );
}
