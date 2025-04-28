import { db } from "./db";
import { parkingSpots } from "@shared/schema";
import { eq } from "drizzle-orm";

async function updateParkingSpots() {
  console.log("Updating parking spots...");

  try {
    // Update spots in each lot
    for (let lotId = 1; lotId <= 3; lotId++) {
      // Get first 5 spots in each lot
      const spots = await db
        .select()
        .from(parkingSpots)
        .where(eq(parkingSpots.lotId, lotId))
        .limit(5);
      
      console.log(`Found ${spots.length} spots in lot ${lotId}`);
      
      // Update each spot to be a student spot and available
      for (const spot of spots) {
        await db
          .update(parkingSpots)
          .set({ 
            type: "student", 
            isAvailable: true 
          })
          .where(eq(parkingSpots.id, spot.id));
        
        console.log(`Updated spot #${spot.spotNumber} in lot ${lotId} to student type and available`);
      }
    }
    
    console.log("Successfully updated parking spots!");
  } catch (error) {
    console.error("Error updating parking spots:", error);
  }
}

updateParkingSpots().catch(console.error);