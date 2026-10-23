CREATE TABLE `slayer_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`read_hash` text NOT NULL,
	`write_hash` text NOT NULL,
	`snapshot` text,
	`captured_at` integer DEFAULT 0 NOT NULL,
	`received_at` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
