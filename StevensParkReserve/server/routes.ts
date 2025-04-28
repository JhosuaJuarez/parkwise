import { Router, type Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertVehicleSchema,
  insertReservationSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const SessionStore = MemoryStore(session);
  
  // Set up session middleware
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new SessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      resave: false,
      secret: process.env.SESSION_SECRET || "parkwise-secret",
      saveUninitialized: false
    })
  );
  
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.session.userId) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };
  
  const apiRouter = Router();
  
  // User routes
  apiRouter.post("/auth/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set user in session
      (req.session as any).userId = user.id;
      
      return res.json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.post("/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      
      res.json({ message: "Logged out successfully" });
    });
  });
  
  apiRouter.post("/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      
      return res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.get("/user/current", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email
      });
    } catch (error) {
      console.error("Get current user error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Parking lot routes
  apiRouter.get("/parking-lots", async (req, res) => {
    try {
      const lots = await storage.getParkingLots();
      
      // For each lot, calculate available spots
      const lotsWithAvailability = await Promise.all(
        lots.map(async (lot) => {
          const spots = await storage.getParkingSpots(lot.id);
          const availableSpots = spots.filter(spot => spot.isAvailable).length;
          
          return {
            ...lot,
            availableSpots,
            totalSpots: lot.totalSpots
          };
        })
      );
      
      return res.json(lotsWithAvailability);
    } catch (error) {
      console.error("Get parking lots error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.get("/parking-lots/:id", async (req, res) => {
    try {
      const lotId = parseInt(req.params.id);
      
      if (isNaN(lotId)) {
        return res.status(400).json({ message: "Invalid parking lot ID" });
      }
      
      const lot = await storage.getParkingLot(lotId);
      
      if (!lot) {
        return res.status(404).json({ message: "Parking lot not found" });
      }
      
      // Get spots for this lot
      const spots = await storage.getParkingSpots(lotId);
      const availableSpots = spots.filter(spot => spot.isAvailable).length;
      
      return res.json({
        ...lot,
        availableSpots,
        totalSpots: lot.totalSpots,
        spots
      });
    } catch (error) {
      console.error("Get parking lot error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Vehicle routes
  apiRouter.get("/vehicles", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const vehicles = await storage.getVehicles(userId);
      
      return res.json(vehicles);
    } catch (error) {
      console.error("Get vehicles error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.post("/vehicles", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      
      const vehicleData = insertVehicleSchema.parse({
        ...req.body,
        userId
      });
      
      const newVehicle = await storage.createVehicle(vehicleData);
      
      return res.status(201).json(newVehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      
      console.error("Create vehicle error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Reservation routes
  apiRouter.get("/reservations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const reservations = await storage.getReservations(userId);
      
      // Enhance reservations with additional data
      const enhancedReservations = await Promise.all(
        reservations.map(async (reservation) => {
          const spot = await storage.getParkingSpot(reservation.spotId);
          const lot = spot ? await storage.getParkingLot(spot.lotId) : null;
          const vehicle = await storage.getVehicle(reservation.vehicleId);
          
          return {
            ...reservation,
            spot,
            lot,
            vehicle
          };
        })
      );
      
      return res.json(enhancedReservations);
    } catch (error) {
      console.error("Get reservations error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.post("/reservations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      
      // Validate required fields
      const { spotId, vehicleId, startTime, endTime } = req.body;
      
      if (!spotId || !vehicleId || !startTime || !endTime) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if spot exists and is available
      const spot = await storage.getParkingSpot(spotId);
      
      if (!spot) {
        return res.status(404).json({ message: "Parking spot not found" });
      }
      
      if (!spot.isAvailable) {
        return res.status(400).json({ message: "Parking spot is not available" });
      }
      
      // Check if vehicle belongs to user
      const vehicle = await storage.getVehicle(vehicleId);
      
      if (!vehicle || vehicle.userId !== userId) {
        return res.status(403).json({ message: "Vehicle does not belong to you" });
      }
      
      // Generate confirmation code
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const lot = await storage.getParkingLot(spot.lotId);
      const confirmationCode = `PW-${dateStr}-${spot.spotNumber}`;
      
      // Determine status based on start time
      const currentTime = new Date();
      const startDateTime = new Date(startTime);
      const status = startDateTime <= currentTime ? "active" : "upcoming";
      
      const reservationData: any = {
        userId,
        spotId,
        vehicleId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status,
        confirmationCode
      };
      
      const newReservation = await storage.createReservation(reservationData);
      
      // Create notification for the user
      const lotName = lot ? lot.name : "Unknown";
      const startTimeStr = new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endTimeStr = new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      await storage.createNotification({
        userId,
        message: `Your reservation for ${lotName} has been confirmed from ${startTimeStr} to ${endTimeStr}.`,
        type: "success",
        isRead: false,
        createdAt: new Date()
      });
      
      // Return enhanced reservation data
      const enhancedReservation = {
        ...newReservation,
        spot,
        lot,
        vehicle
      };
      
      return res.status(201).json(enhancedReservation);
    } catch (error) {
      console.error("Create reservation error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.put("/reservations/:id/cancel", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const reservationId = parseInt(req.params.id);
      
      if (isNaN(reservationId)) {
        return res.status(400).json({ message: "Invalid reservation ID" });
      }
      
      const reservation = await storage.getReservation(reservationId);
      
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }
      
      if (reservation.userId !== userId) {
        return res.status(403).json({ message: "You cannot cancel reservations you don't own" });
      }
      
      if (reservation.status === "cancelled" || reservation.status === "completed") {
        return res.status(400).json({ message: `Reservation is already ${reservation.status}` });
      }
      
      const updatedReservation = await storage.updateReservationStatus(reservationId, "cancelled");
      
      // Create notification
      await storage.createNotification({
        userId,
        message: "Your reservation has been cancelled successfully.",
        type: "info",
        isRead: false,
        createdAt: new Date()
      });
      
      return res.json(updatedReservation);
    } catch (error) {
      console.error("Cancel reservation error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Notification routes
  apiRouter.get("/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const notifications = await storage.getNotifications(userId);
      
      return res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.get("/notifications/unread-count", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const count = await storage.getUnreadNotificationsCount(userId);
      
      return res.json({ count });
    } catch (error) {
      console.error("Get unread notifications count error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.put("/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      return res.json(updatedNotification);
    } catch (error) {
      console.error("Mark notification as read error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Mount API routes
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);

  return httpServer;
}
