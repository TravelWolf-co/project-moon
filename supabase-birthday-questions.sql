create table if not exists public.birthday_custom_questions (
  id uuid primary key default gen_random_uuid(),
  couple_id text not null,
  question text not null,
  category_id text not null,
  category_title text,
  author_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.birthday_question_responses (
  id uuid primary key default gen_random_uuid(),
  couple_id text not null default 'Project-Moon',
  question_key text not null,
  question_id uuid references public.birthday_custom_questions(id) on delete cascade,
  responder_name text not null,
  answer text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.birthday_question_responses
  add column if not exists couple_id text not null default 'Project-Moon';

alter table public.birthday_question_responses
  add column if not exists question_key text;

update public.birthday_question_responses
set question_key = 'custom:' || question_id::text
where question_key is null and question_id is not null;

alter table public.birthday_question_responses
  alter column question_id drop not null;

alter table public.birthday_question_responses
  alter column question_key set not null;

alter table public.birthday_custom_questions enable row level security;
alter table public.birthday_question_responses enable row level security;

drop policy if exists "Allow public birthday question reads" on public.birthday_custom_questions;
create policy "Allow public birthday question reads"
  on public.birthday_custom_questions
  for select
  using (true);

drop policy if exists "Allow public birthday question inserts" on public.birthday_custom_questions;
create policy "Allow public birthday question inserts"
  on public.birthday_custom_questions
  for insert
  with check (true);

drop policy if exists "Allow public birthday question updates" on public.birthday_custom_questions;
create policy "Allow public birthday question updates"
  on public.birthday_custom_questions
  for update
  using (true)
  with check (true);

drop policy if exists "Allow public birthday question deletes" on public.birthday_custom_questions;
create policy "Allow public birthday question deletes"
  on public.birthday_custom_questions
  for delete
  using (true);

drop policy if exists "Allow public birthday response reads" on public.birthday_question_responses;
create policy "Allow public birthday response reads"
  on public.birthday_question_responses
  for select
  using (true);

drop policy if exists "Allow public birthday response inserts" on public.birthday_question_responses;
create policy "Allow public birthday response inserts"
  on public.birthday_question_responses
  for insert
  with check (true);

drop policy if exists "Allow public birthday response updates" on public.birthday_question_responses;
create policy "Allow public birthday response updates"
  on public.birthday_question_responses
  for update
  using (true)
  with check (true);

drop policy if exists "Allow public birthday response deletes" on public.birthday_question_responses;
create policy "Allow public birthday response deletes"
  on public.birthday_question_responses
  for delete
  using (true);
