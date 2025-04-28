import { db } from "./db";
import {
  users, insertUserSchema,
  parkingLots, insertParkingLotSchema,
  vehicles, insertVehicleSchema,
  parkingSpots, insertParkingSpotSchema,
  reservations, insertReservationSchema,
  notifications, insertNotificationSchema
} from "@shared/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

async function seedDatabase() {
  console.log("Seeding database...");

  // First check if data already exists to avoid duplicate seeding
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    console.log("Database already seeded. Skipping...");
    return;
  }

  try {
    // Create demo user
    const demoUser = {
      username: "demo_user",
      password: "password123",
      fullName: "Alex Johnson",
      email: "alex.johnson@stevens.edu"
    };
    
    const [user] = await db.insert(users).values(demoUser).returning();
    console.log(`Created demo user: ${user.username}`);
    
    // Create parking lots
    const parkingLotsData = [
      {
        name: "West Lot",
        description: "Located near the Babbio Center",
        totalSpots: 45,
        latitude: "40.745262",
        longitude: "-74.025506"
      },
      {
        name: "North Lot",
        description: "Located near the Howe Center",
        totalSpots: 30,
        latitude: "40.746782",
        longitude: "-74.024098"
      },
      {
        name: "South Garage",
        description: "Located near the Student Center",
        totalSpots: 75,
        latitude: "40.744213",
        longitude: "-74.024751"
      }
    ];
    
    // Insert all parking lots
    for (const lotData of parkingLotsData) {
      const [lot] = await db.insert(parkingLots).values(lotData).returning();
      console.log(`Created parking lot: ${lot.name}`);
      
      // Create parking spots for each lot
      const spotTypes = ["regular", "student", "faculty", "handicap"];
      const totalSpots = lot.totalSpots;
      
      for (let i = 1; i <= totalSpots; i++) {
        const spotNumber = `${String.fromCharCode(64 + Math.ceil(i / 10))}${i % 10 || 10}`;
        const type = spotTypes[Math.floor(Math.random() * 3)]; // Random type (excluding handicap for most spots)
        const isAvailable = Math.random() > 0.3; // 70% chance of being available
        
        await db.insert(parkingSpots).values({
          lotId: lot.id,
          spotNumber,
          type,
          isAvailable
        });
      }
      console.log(`Created ${totalSpots} parking spots for ${lot.name}`);
    }
    
    // Create vehicles for demo user
    const vehiclesData = [
      {
        userId: user.id,
        make: "Honda",
        model: "Civic",
        licensePlate: "123-ABC",
        state: "NJ"
      },
      {
        userId: user.id,
        make: "Toyota",
        model: "Corolla",
        licensePlate: "456-DEF",
        state: "NJ"
      }
    ];
    
    for (const vehicleData of vehiclesData) {
      const [vehicle] = await db.insert(vehicles).values(vehicleData).returning();
      console.log(`Created vehicle: ${vehicle.make} ${vehicle.model}`);
    }
    
    // Get some parking spots for reservations
    const [spotForActive] = await db
      .select()
      .from(parkingSpots)
      .where(eq(parkingSpots.lotId, 3)) // South Garage
      .limit(1);
    
    const [spotForUpcoming] = await db
      .select()
      .from(parkingSpots)
      .where(eq(parkingSpots.lotId, 1)) // West Lot
      .limit(1);
    
    // Create demo reservations
    const now = new Date();
    const today4pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0);
    const today8pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0);
    const tomorrow8am = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0, 0);
    const tomorrow12pm = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0);
    
    if (spotForActive && spotForUpcoming) {
      const reservationsData = [
        {
          userId: user.id,
          spotId: spotForActive.id,
          vehicleId: 1, // First vehicle
          startTime: today4pm,
          endTime: today8pm,
          status: "active",
          confirmationCode: `PW-${today4pm.toISOString().slice(0, 10)}-${spotForActive.spotNumber}`
        },
        {
          userId: user.id,
          spotId: spotForUpcoming.id,
          vehicleId: 2, // Second vehicle
          startTime: tomorrow8am,
          endTime: tomorrow12pm,
          status: "upcoming",
          confirmationCode: `PW-${tomorrow8am.toISOString().slice(0, 10)}-${spotForUpcoming.spotNumber}`
        }
      ];
      
      for (const reservationData of reservationsData) {
        const [reservation] = await db.insert(reservations).values(reservationData).returning();
        console.log(`Created reservation: ${reservation.confirmationCode}`);
        
        // Update spot availability for the active reservation
        if (reservation.status === "active") {
          await db
            .update(parkingSpots)
            .set({ isAvailable: false })
            .where(eq(parkingSpots.id, reservation.spotId));
        }
      }
    }
    
    // Create notifications
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const notificationsData = [
      {
        userId: user.id,
        message: "Your reservation for South Garage has been confirmed for today from 4:00 PM to 8:00 PM.",
        type: "success",
        isRead: false,
        createdAt: thirtyMinAgo
      },
      {
        userId: user.id,
        message: "Your parking reservation at West Lot begins tomorrow. Don't forget to check in upon arrival.",
        type: "info",
        isRead: false,
        createdAt: oneHourAgo
      }
    ];
    
    for (const notificationData of notificationsData) {
      const [notification] = await db.insert(notifications).values(notificationData).returning();
      console.log(`Created notification: ${notification.type}`);
    }
    
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase().catch(console.error);