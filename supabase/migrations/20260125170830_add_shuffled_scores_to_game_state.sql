-- Add home_shuffled_scores column to game_state table
ALTER TABLE game_state ADD COLUMN home_shuffled_scores JSONB;

-- Add away_shuffled_scores column to game_state table
ALTER TABLE game_state ADD COLUMN away_shuffled_scores JSONB;
