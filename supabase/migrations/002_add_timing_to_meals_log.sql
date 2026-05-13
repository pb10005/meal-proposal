alter table meals_log
  add column timing text check (timing in ('breakfast', 'lunch', 'snack', 'dinner', 'late_night')) default null;
