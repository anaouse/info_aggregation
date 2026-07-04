package migrations

type Migration struct {
	Version int
	Name    string
	Up      string
}

var All = []Migration{
	{
		Version: 1,
		Name:    "create_info_sources",
		Up: `
CREATE TABLE IF NOT EXISTS info_sources (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    source_name TEXT    NOT NULL,
    url         TEXT    NOT NULL UNIQUE,
    create_at   TEXT    NOT NULL
);

INSERT OR IGNORE INTO info_sources (source_name, url, create_at) VALUES
('Hacker News',       'https://news.ycombinator.com', '2025-01-15T12:00:00Z'),
('GitHub Trending',   'https://github.com/trending',   '2025-01-15T12:00:00Z'),
('React Blog',        'https://react.dev/blog',        '2025-01-15T12:00:00Z'),
('Vite',              'https://vitejs.dev',            '2025-01-15T12:00:00Z'),
('MDN Web Docs',      'https://developer.mozilla.org', '2025-01-15T12:00:00Z');
`,
	},
	{
		Version: 2,
		Name:    "fix_create_at_iso8601",
		Up: `
UPDATE info_sources
SET create_at = REPLACE(create_at, ' ', 'T') || 'Z'
WHERE create_at NOT LIKE '%T%';
`,
	},
	{
		Version: 3,
		Name:    "create_predictions",
		Up: `
CREATE TABLE IF NOT EXISTS predictions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    text       TEXT    NOT NULL,
    done       INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT    NOT NULL,
    created_at TEXT    NOT NULL
);
`,
	},
	{
		Version: 4,
		Name:    "create_assets_snapshots",
		Up: `
CREATE TABLE IF NOT EXISTS assets_snapshots (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    assets_snapshot_date TEXT    NOT NULL UNIQUE,
    assets               TEXT    NOT NULL,
    created_at           TEXT    NOT NULL,
    updated_at           TEXT    NOT NULL
);
`,
	},
	{
		Version: 5,
		Name:    "assets_snapshots_add_total",
		Up: `
ALTER TABLE assets_snapshots ADD COLUMN total REAL;
`,
	},
}
