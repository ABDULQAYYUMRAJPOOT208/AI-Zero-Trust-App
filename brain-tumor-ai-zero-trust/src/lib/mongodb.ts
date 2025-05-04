import mongooseLib from 'mongoose';

const MONGODB_URI: string = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Extend the global object type
declare global {
  // This ensures proper typing for the global mongoose object
  var mongoose: {
    conn: typeof mongooseLib | null;
    promise: Promise<typeof mongooseLib> | null;
  } | undefined;
}

// Use existing global object or initialize it
global.mongoose ||= { conn: null, promise: null };

// This is now guaranteed to be defined
const cached = global.mongoose!;

async function dbConnect(): Promise<typeof mongooseLib> {
  console.log('Connecting to MongoDB...', MONGODB_URI);
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongooseLib.connect(MONGODB_URI).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  console.log('Connected to MongoDB', MONGODB_URI);
  return cached.conn;
}

export default dbConnect;
