import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  real,
  date,
} from 'drizzle-orm/pg-core';

// Enums
export const garmentCategory = pgEnum('garment_category', [
  'top',
  'bottom',
  'shoes',
  'outerwear',
  'accessory',
]);

export const outfitStatus = pgEnum('outfit_status', [
  'suggested',
  'saved',
  'worn',
  'discarded',
]);

// Usuarios
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Perfil de estilo (1:1 con users)
export const styleProfiles = pgTable('style_profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  sizes: jsonb('sizes'), // tallas aproximadas
  occasions: text('occasions').array(), // ocasiones frecuentes
  goals: text('goals'), // objetivos de imagen
  favoriteColors: text('favorite_colors').array(),
  defaultLat: real('default_lat'), // respaldo de ubicación si el navegador niega permiso
  defaultLon: real('default_lon'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Prendas del clóset
export const garments = pgTable('garments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  imageKey: text('image_key').notNull(), // key en MinIO (no la imagen)
  category: garmentCategory('category').notNull(),
  subcategory: text('subcategory'),
  primaryColor: text('primary_color'),
  secondaryColors: text('secondary_colors').array(),
  style: text('style'),
  season: text('season').array(),
  material: text('material'),
  aiConfidence: real('ai_confidence'),
  timesWorn: integer('times_worn').notNull().default(0),
  lastWornAt: timestamp('last_worn_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Outfits (combinaciones generadas / guardadas)
export const outfits = pgTable('outfits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  garmentIds: uuid('garment_ids').array().notNull(),
  occasion: text('occasion'),
  weatherContext: jsonb('weather_context'),
  status: outfitStatus('status').notNull().default('suggested'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Historial de uso
export const wearHistory = pgTable('wear_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  outfitId: uuid('outfit_id')
    .notNull()
    .references(() => outfits.id, { onDelete: 'cascade' }),
  wornOn: date('worn_on').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
