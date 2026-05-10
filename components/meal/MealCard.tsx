'use client';

import React, { useState } from 'react';
import { MealCandidate } from '@/types/meal';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { MEAL_CATEGORY_LABELS, MEAL_CATEGORY_ICONS } from '@/config/meal-categories';

interface MealCardProps {
  candidate: MealCandidate;
  onAccept: (candidate: MealCandidate) => void;
  isAccepting?: boolean;
}

const FORM_LABELS: Record<string, string> = {
  cook: '自炊',
  eat_out: '外食',
  buy: '購入',
};

const COST_LABELS: Record<string, string> = {
  low: '〜500円',
  mid: '500〜1500円',
  high: '1500円〜',
};

const COST_COLORS: Record<string, 'green' | 'amber' | 'orange'> = {
  low: 'green',
  mid: 'amber',
  high: 'orange',
};

export function MealCard({ candidate, onAccept, isAccepting = false }: MealCardProps) {
  const [expanded, setExpanded] = useState(false);
  const icon = MEAL_CATEGORY_ICONS[candidate.category] ?? '🍽️';
  const categoryLabel = MEAL_CATEGORY_LABELS[candidate.category] ?? candidate.category;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none mt-0.5" aria-hidden="true">
            {icon}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 leading-snug">
              {candidate.name}
            </h3>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <Tag color="gray">{categoryLabel}</Tag>
              <Tag color="blue">{FORM_LABELS[candidate.form] ?? candidate.form}</Tag>
              <Tag color={COST_COLORS[candidate.cost_band] ?? 'amber'}>
                {COST_LABELS[candidate.cost_band] ?? candidate.cost_band}
              </Tag>
              <Tag color="purple">{candidate.time_min}分</Tag>
            </div>
          </div>
        </div>

        {/* Reason */}
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          {candidate.reason}
        </p>

        {/* Nutrition tags */}
        {candidate.nutrition_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {candidate.nutrition_tags.map((tag) => (
              <Tag key={tag} color="green">
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </div>

      {/* Expandable details */}
      {candidate.form === 'cook' && (
        <div className="border-t border-amber-50">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-5 py-3 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
          >
            <span className="font-medium">
              {expanded ? 'レシピを閉じる' : 'レシピを見る'}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expanded && (
            <div className="px-5 pb-4 space-y-4">
              {candidate.ingredients.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    材料
                  </h4>
                  <ul className="space-y-1">
                    {candidate.ingredients.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {candidate.steps.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    手順
                  </h4>
                  <ol className="space-y-2">
                    {candidate.steps.map((step, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {candidate.shopping_list.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    買い物リスト
                  </h4>
                  <ul className="space-y-1">
                    {candidate.shopping_list.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5">□</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Accept button */}
      <div className="px-5 pb-5 pt-3">
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={() => onAccept(candidate)}
          isLoading={isAccepting}
        >
          これにする
        </Button>
      </div>
    </div>
  );
}
