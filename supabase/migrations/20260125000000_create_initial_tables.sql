-- Create the users table
create table users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique
);

-- Create the games table
create table games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  game_date timestamptz not null
);

-- Create the game_settings table
create table game_settings (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) not null,
  cost_per_square int not null default 10
);

-- Add missing columns to the existing squares table
DO $$ BEGIN
  ALTER TABLE squares ADD COLUMN game_id uuid;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE squares ADD COLUMN user_id uuid;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE squares ADD COLUMN x_coord int;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE squares ADD COLUMN y_coord int;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE squares ADD COLUMN status text DEFAULT 'unclaimed';
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Add foreign key constraints to squares table
DO $$ BEGIN
  ALTER TABLE squares ADD CONSTRAINT fk_game FOREIGN KEY (game_id) REFERENCES games(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE squares ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add a unique constraint for game_id, x_coord, y_coord if it doesn't exist
DO $$ BEGIN
  ALTER TABLE squares ADD CONSTRAINT unique_game_coord UNIQUE (game_id, x_coord, y_coord);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;