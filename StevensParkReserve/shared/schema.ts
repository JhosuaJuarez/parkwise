import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
});

export const parkingLots = pgTable("parking_lots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  totalSpots: integer("total_spots").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
});

export const insertParkingLotSchema = createInsertSchema(parkingLots).pick({
  name: true,
  description: true,
  totalSpots: true,
  latitude: true,
  longitude: true,
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  licensePlate: text("license_plate").notNull(),
  state: text("state").notNull(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).pick({
  userId: true,
  make: true,
  model: true,
  licensePlate: true,
  state: true,
});

export const parkingSpots = pgTable("parking_spots", {
  id: serial("id").primaryKey(),
  lotId: integer("lot_id").notNull(),
  spotNumber: text("spot_number").notNull(),
  type: text("type").notNull(), // 'regular', 'student', 'faculty', 'handicap'
  isAvailable: boolean("is_available").notNull().default(true),
});

export const insertParkingSpotSchema = createInsertSchema(parkingSpots).pick({
  lotId: true,
  spotNumber: true,
  type: true,
  isAvailable: true,
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  spotId: integer("spot_id").notNull(),
  vehicleId: integer("vehicle_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull(), // 'active', 'upcoming', 'completed', 'cancelled'
  confirmationCode: text("confirmation_code").notNull(),
});

export const insertReservationSchema = createInsertSchema(reservations).pick({
  userId: true,
  spotId: true,
  vehicleId: true,
  startTime: true,
  endTime: true,
  status: true,
  confirmationCode: true,
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'success', 'info', 'warning', 'error'
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  message: true,
  type: true,
  isRead: true,
  createdAt: true,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  vehicles: many(vehicles),
  reservations: many(reservations),
  notifications: many(notifications),
}));

export const parkingLotsRelations = relations(parkingLots, ({ many }) => ({
  spots: many(parkingSpots),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  user: one(users, { fields: [vehicles.userId], references: [users.id] }),
  reservations: many(reservations),
}));

export const parkingSpotsRelations = relations(parkingSpots, ({ one, many }) => ({
  lot: one(parkingLots, { fields: [parkingSpots.lotId], references: [parkingLots.id] }),
  reservations: many(reservations),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(users, { fields: [reservations.userId], references: [users.id] }),
  spot: one(parkingSpots, { fields: [reservations.spotId], references: [parkingSpots.id] }),
  vehicle: one(vehicles, { fields: [reservations.vehicleId], references: [vehicles.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ParkingLot = typeof parkingLots.$inferSelect;
export type InsertParkingLot = z.infer<typeof insertParkingLotSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type ParkingSpot = typeof parkingSpots.$inferSelect;
export type InsertParkingSpot = z.infer<typeof insertParkingSpotSchema>;

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
