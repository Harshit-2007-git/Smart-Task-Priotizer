create extension if not exists "uuid-ossp";

create table users (
  id uuid primary key default uuid_generate_v4(),
  email varchar(255) unique not null,
  password_hash text not null,
  created_at timestamp default current_timestamp
);

create table tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  title varchar(255) not null,
  description text,
  category varchar(50),
  priority varchar(20),
  deadline timestamp,
  completed boolean default false,
  created_at timestamp default current_timestamp
);

create index idx_tasks_user_id on tasks(user_id);
create index idx_tasks_deadline on tasks(deadline);
create index idx_tasks_category on tasks(category);
