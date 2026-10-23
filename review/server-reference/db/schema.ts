import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const slayerConnections = sqliteTable('slayer_connections', {
 id: text('id').primaryKey(), username: text('username').notNull(),
 readHash: text('read_hash').notNull(), writeHash: text('write_hash').notNull(),
 snapshot: text('snapshot'), capturedAt: integer('captured_at').notNull().default(0),
 receivedAt: integer('received_at').notNull().default(0), createdAt: integer('created_at').notNull(),
 expiresAt: integer('expires_at').notNull(),
});
