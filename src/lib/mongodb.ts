import mongoose from "mongoose";

const DEFAULT_MONGODB_URI =
  "mongodb+srv://fitness_tracker:aR9xOqWD48JjLLQe@sajjadjim15.ac97xgz.mongodb.net/fitness_tracker?retryWrites=true&w=majority";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  if (!uri) {
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        console.log("Connected to MongoDB Atlas successfully!");
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("MongoDB Atlas connection error:", err.message);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch {
    cached.promise = null;
    return null;
  }
}
