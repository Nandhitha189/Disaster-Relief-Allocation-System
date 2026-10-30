
import "server-only";
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB;

if (!uri || !databaseName) {
  throw new Error("MongoDB configuration is missing");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 5,
  serverSelectionTimeoutMS: 20000,
connectTimeoutMS: 10000,
});

const clientPromise = client.connect();

export async function getMongoDatabase() {
  const connectedClient = await clientPromise;
  return connectedClient.db(databaseName);
}
