CREATE TABLE quarter_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id),
  quarter INT NOT NULL,
  winning_user_id UUID REFERENCES users(id),
  home_score_at_quarter_end INT NOT NULL,
  away_score_at_quarter_end INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, quarter)
);
