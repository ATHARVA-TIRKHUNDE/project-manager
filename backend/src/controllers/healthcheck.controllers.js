import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js"; // Import the wrapper
import { ApiResponse } from "../ApiResponse.js";      // Import the success response
import { ApiError } from "../utils/ApiError.js";        // Import the custom error


const healthcheck = asyncHandler(async (req, res) => {
  // 1. Check Database Connection Status
  // Mongoose readyState codes: 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const dbStatus = mongoose.connection.readyState;

  // Check if the connection state is 'connected' (readyState === 1)
  if (dbStatus !== 1) {
    // Throw an ApiError if the database is not connected. 
    // asyncHandler will catch this and pass it to the global error middleware.
    throw new ApiError(
      503,
      "Service Unavailable: Database connection failed.",
      [{ database: "disconnected", state: dbStatus }]
    );
  }

  // 2. Prepare the successful response data
  const responseData = {
    status: "up",
    uptime: process.uptime(), // Node process uptime in seconds
    timestamp: new Date().toISOString(),
    database: "connected",
    db_state_code: dbStatus
  };

  const statusCode = 200;

  // 3. Respond with a 200 OK status using the ApiResponse class
  return res
    .status(statusCode)
    .json(
      new ApiResponse(
        statusCode,
        responseData,
        "Health check passed successfully"
      )
    );
});

export { healthcheck };