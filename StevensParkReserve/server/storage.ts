import {
  users, type User, type InsertUser,
  parkingLots, type ParkingLot, type InsertParkingLot,
  vehicles, type Vehicle, type InsertVehicle,
  parkingSpots, type ParkingSpot, type InsertParkingSpot,
  reservations, type Reservation, type InsertReservation,
  notifications, type Notification, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc } from "drizzle-orm";

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Parking Lot methods
  getParkingLots(): Promise<ParkingLot[]>;
  getParkingLot(id: number): Promise<ParkingLot | undefined>;
  createParkingLot(parkingLot: InsertParkingLot): Promise<ParkingLot>;
  
  // Vehicle methods
  getVehicles(userId: number): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  
  // Parking Spot methods
  getParkingSpots(lotId: number): Promise<ParkingSpot[]>;
  getParkingSpot(id: number): Promise<ParkingSpot | undefined>;
  createParkingSpot(parkingSpot: InsertParkingSpot): Promise<ParkingSpot>;
  updateParkingSpotAvailability(id: number, isAvailable: boolean): Promise<ParkingSpot | undefined>;
  
  // Reservation methods
  getReservations(userId: number): Promise<Reservation[]>;
  getActiveReservationsByLot(lotId: number): Promise<Reservation[]>;
  getReservation(id: number): Promise<Reservation | undefined>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservationStatus(id: number, status: string): Promise<Reservation | undefined>;
  
  // Notification methods
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotificationsCount(userId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private parkingLots: Map<number, ParkingLot>;
  private vehicles: Map<number, Vehicle>;
  private parkingSpots: Map<number, ParkingSpot>;
  private reservations: Map<number, Reservation>;
  private notifications: Map<number, Notification>;
  
  private userId: number;
  private parkingLotId: number;
  private vehicleId: number;
  private parkingSpotId: number;
  private reservationId: number;
  private notificationId: number;

  constructor() {
    this.users = new Map();
    this.parkingLots = new Map();
    this.vehicles = new Map();
    this.parkingSpots = new Map();
    this.reservations = new Map();
    this.notifications = new Map();
    
    this.userId = 1;
    this.parkingLotId = 1;
    this.vehicleId = 1;
    this.parkingSpotId = 1;
    this.reservationId = 1;
    this.notificationId = 1;
    
    // Initialize with demo data
    this.initDemoData();
  }

  private initDemoData() {
    // Create demo user
    const demoUser: InsertUser = {
      username: "demo_user",
      password: "password123",
      fullName: "Alex Johnson",
      email: "alex.johnson@stevens.edu"
    };
    this.createUser(demoUser);
    
    // Create parking lots
    const parkingLots: InsertParkingLot[] = [
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
    
    parkingLots.forEach(lot => this.createParkingLot(lot));
    
    // Create parking spots for each lot
    const spotTypes = ["regular", "student", "faculty", "handicap"];
    
    for (let lotId = 1; lotId <= 3; lotId++) {
      const lot = this.parkingLots.get(lotId)!;
      const totalSpots = lot.totalSpots;
      
      for (let i = 1; i <= totalSpots; i++) {
        const spotNumber = `${String.fromCharCode(64 + Math.ceil(i / 10))}${i % 10 || 10}`;
        const type = spotTypes[Math.floor(Math.random() * 3)]; // Random type (excluding handicap for simplicity)
        const isAvailable = Math.random() > 0.3; // 70% chance of being available
        
        this.createParkingSpot({
          lotId,
          spotNumber,
          type,
          isAvailable
        });
      }
    }
    
    // Create vehicles for demo user
    const vehicles: InsertVehicle[] = [
      {
        userId: 1,
        make: "Honda",
        model: "Civic",
        licensePlate: "123-ABC",
        state: "NJ"
      },
      {
        userId: 1,
        make: "Toyota",
        model: "Corolla",
        licensePlate: "456-DEF",
        state: "NJ"
      }
    ];
    
    vehicles.forEach(vehicle => this.createVehicle(vehicle));
    
    // Create demo reservations
    const now = new Date();
    const today4pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0);
    const today8pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0);
    const tomorrow8am = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0, 0);
    const tomorrow12pm = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0);
    
    const reservations: InsertReservation[] = [
      {
        userId: 1,
        spotId: 53, // South Garage, Spot B12
        vehicleId: 1,
        startTime: today4pm,
        endTime: today8pm,
        status: "active",
        confirmationCode: "PW-2023-11-15-B12"
      },
      {
        userId: 1,
        spotId: 5, // North Lot, Spot A05
        vehicleId: 2,
        startTime: tomorrow8am,
        endTime: tomorrow12pm,
        status: "upcoming",
        confirmationCode: "PW-2023-11-16-A05"
      }
    ];
    
    reservations.forEach(reservation => this.createReservation(reservation));
    
    // Create notifications
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const notifications: InsertNotification[] = [
      {
        userId: 1,
        message: "Your reservation for South Garage has been confirmed for today from 4:00 PM to 8:00 PM.",
        type: "success",
        isRead: false,
        createdAt: thirtyMinAgo
      },
      {
        userId: 1,
        message: "Your parking reservation at North Lot begins in 1 hour. Don't forget to check in upon arrival.",
        type: "info",
        isRead: false,
        createdAt: oneHourAgo
      }
    ];
    
    notifications.forEach(notification => this.createNotification(notification));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Parking Lot methods
  async getParkingLots(): Promise<ParkingLot[]> {
    return Array.from(this.parkingLots.values());
  }
  
  async getParkingLot(id: number): Promise<ParkingLot | undefined> {
    return this.parkingLots.get(id);
  }
  
  async createParkingLot(insertParkingLot: InsertParkingLot): Promise<ParkingLot> {
    const id = this.parkingLotId++;
    const parkingLot: ParkingLot = { ...insertParkingLot, id };
    this.parkingLots.set(id, parkingLot);
    return parkingLot;
  }
  
  // Vehicle methods
  async getVehicles(userId: number): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values())
      .filter(vehicle => vehicle.userId === userId);
  }
  
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }
  
  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.vehicleId++;
    const vehicle: Vehicle = { ...insertVehicle, id };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }
  
  // Parking Spot methods
  async getParkingSpots(lotId: number): Promise<ParkingSpot[]> {
    return Array.from(this.parkingSpots.values())
      .filter(spot => spot.lotId === lotId);
  }
  
  async getParkingSpot(id: number): Promise<ParkingSpot | undefined> {
    return this.parkingSpots.get(id);
  }
  
  async createParkingSpot(insertParkingSpot: InsertParkingSpot): Promise<ParkingSpot> {
    const id = this.parkingSpotId++;
    const parkingSpot: ParkingSpot = { ...insertParkingSpot, id };
    this.parkingSpots.set(id, parkingSpot);
    return parkingSpot;
  }
  
  async updateParkingSpotAvailability(id: number, isAvailable: boolean): Promise<ParkingSpot | undefined> {
    const spot = this.parkingSpots.get(id);
    if (!spot) return undefined;
    
    const updatedSpot: ParkingSpot = { ...spot, isAvailable };
    this.parkingSpots.set(id, updatedSpot);
    return updatedSpot;
  }
  
  // Reservation methods
  async getReservations(userId: number): Promise<Reservation[]> {
    return Array.from(this.reservations.values())
      .filter(reservation => reservation.userId === userId);
  }
  
  async getActiveReservationsByLot(lotId: number): Promise<Reservation[]> {
    // Get all spots in this lot
    const spotsInLot = Array.from(this.parkingSpots.values())
      .filter(spot => spot.lotId === lotId)
      .map(spot => spot.id);
    
    // Get active or upcoming reservations for these spots
    return Array.from(this.reservations.values())
      .filter(reservation => 
        spotsInLot.includes(reservation.spotId) && 
        (reservation.status === "active" || reservation.status === "upcoming")
      );
  }
  
  async getReservation(id: number): Promise<Reservation | undefined> {
    return this.reservations.get(id);
  }
  
  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    const id = this.reservationId++;
    const reservation: Reservation = { ...insertReservation, id };
    this.reservations.set(id, reservation);
    
    // Update parking spot availability
    await this.updateParkingSpotAvailability(reservation.spotId, false);
    
    return reservation;
  }
  
  async updateReservationStatus(id: number, status: string): Promise<Reservation | undefined> {
    const reservation = this.reservations.get(id);
    if (!reservation) return undefined;
    
    const updatedReservation: Reservation = { ...reservation, status };
    this.reservations.set(id, updatedReservation);
    
    // If cancelled, make the spot available again
    if (status === "cancelled") {
      await this.updateParkingSpotAvailability(reservation.spotId, true);
    }
    
    return updatedReservation;
  }
  
  // Notification methods
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  }
  
  async getUnreadNotificationsCount(userId: number): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.isRead)
      .length;
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const notification: Notification = { ...insertNotification, id };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification: Notification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
}



export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getParkingLots(): Promise<ParkingLot[]> {
    return await db.query.parkingLots.findMany({
      with: {
        spots: true
      }
    });
  }

  async getParkingLot(id: number): Promise<ParkingLot | undefined> {
    const lot = await db.query.parkingLots.findFirst({
      where: eq(parkingLots.id, id),
      with: {
        spots: true
      }
    });
    return lot || undefined;
  }

  async createParkingLot(insertParkingLot: InsertParkingLot): Promise<ParkingLot> {
    const [parkingLot] = await db
      .insert(parkingLots)
      .values(insertParkingLot)
      .returning();
    return parkingLot;
  }

  async getVehicles(userId: number): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.userId, userId));
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db
      .insert(vehicles)
      .values(insertVehicle)
      .returning();
    return vehicle;
  }

  async getParkingSpots(lotId: number): Promise<ParkingSpot[]> {
    return await db.select().from(parkingSpots).where(eq(parkingSpots.lotId, lotId));
  }

  async getParkingSpot(id: number): Promise<ParkingSpot | undefined> {
    const [spot] = await db.select().from(parkingSpots).where(eq(parkingSpots.id, id));
    return spot || undefined;
  }

  async createParkingSpot(insertParkingSpot: InsertParkingSpot): Promise<ParkingSpot> {
    const [parkingSpot] = await db
      .insert(parkingSpots)
      .values(insertParkingSpot)
      .returning();
    return parkingSpot;
  }

  async updateParkingSpotAvailability(id: number, isAvailable: boolean): Promise<ParkingSpot | undefined> {
    const [spot] = await db
      .update(parkingSpots)
      .set({ isAvailable })
      .where(eq(parkingSpots.id, id))
      .returning();
    return spot || undefined;
  }

  async getReservations(userId: number): Promise<Reservation[]> {
    return await db.query.reservations.findMany({
      where: eq(reservations.userId, userId),
      with: {
        spot: {
          with: {
            lot: true
          }
        },
        vehicle: true
      }
    });
  }

  async getActiveReservationsByLot(lotId: number): Promise<Reservation[]> {
    return await db.query.reservations.findMany({
      where: and(
        eq(reservations.status, 'active'),
        sql`${reservations.spotId} IN (SELECT id FROM ${parkingSpots} WHERE ${parkingSpots.lotId} = ${lotId})`
      ),
      with: {
        spot: true,
        vehicle: true
      }
    });
  }

  async getReservation(id: number): Promise<Reservation | undefined> {
    const reservation = await db.query.reservations.findFirst({
      where: eq(reservations.id, id),
      with: {
        spot: {
          with: {
            lot: true
          }
        },
        vehicle: true
      }
    });
    return reservation || undefined;
  }

  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    const [reservation] = await db
      .insert(reservations)
      .values(insertReservation)
      .returning();
    
    // Update spot availability
    await this.updateParkingSpotAvailability(insertReservation.spotId, false);
    
    return reservation;
  }

  async updateReservationStatus(id: number, status: string): Promise<Reservation | undefined> {
    const [reservation] = await db
      .update(reservations)
      .set({ status })
      .where(eq(reservations.id, id))
      .returning();
    
    // If cancelling reservation, make spot available again
    if (status === 'cancelled' && reservation) {
      await this.updateParkingSpotAvailability(reservation.spotId, true);
    }
    
    return reservation || undefined;
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    return result[0]?.count || 0;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification || undefined;
  }
}

export const storage = new DatabaseStorage();
