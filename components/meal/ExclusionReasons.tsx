interface ExclusionReasonsProps {
  reasons: string[];
}

export function ExclusionReasons({ reasons }: ExclusionReasonsProps) {
  if (reasons.length === 0) return null;

  return (
    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
      <div className="flex items-start gap-2">
        <svg
          className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p className="text-sm font-medium text-orange-800 mb-1.5">
            以下の理由で一部の候補を除外しました
          </p>
          <ul className="space-y-1">
            {reasons.map((reason, i) => (
              <li key={i} className="text-xs text-orange-700 flex items-start gap-1.5">
                <span className="mt-0.5">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
