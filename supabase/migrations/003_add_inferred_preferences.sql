alter table preferences
  add column inferred_likes      jsonb not null default '[]'::jsonb,
  add column inferred_categories jsonb not null default '[]'::jsonb,
  add column inferred_at         timestamptz default null;
