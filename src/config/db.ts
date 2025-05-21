import mongoose, { connect } from "mongoose";
import { logger } from "../utils/logger";
import { env } from "./env";

interface DatabaseConnection {
  connection: mongoose.Connection;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

const dbConfig: DatabaseConnection = {
  connection: mongoose.connection,
  connect: async () => {
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(env.DATABASE_URI, {
          dbName: env.DATABASE_NAME,
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
        });
      }
      logger.info("Database connection established");
    } catch (error) {
      logger.error("Database connection Failed");
      process.exit(1);
    }
  },
  disconnect: async()=>{
    try {
        await mongoose.disconnect();
        logger.info("Database connection closed");
    } catch (error) {
        logger.info("Database disconnection failed");
    }
  }
};

mongoose.connection.on('connected', () => {
    logger.info('Mongoose connected to DB');
  });
  
  mongoose.connection.on('error', (error) => {
    logger.error('Mongoose connection error:', error);
  });
  
  mongoose.connection.on('disconnected', () => {
    logger.warn('Mongoose disconnected from DB');
  });

export default dbConfig;