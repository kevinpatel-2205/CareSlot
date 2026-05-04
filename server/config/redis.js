import { createClient } from "redis";
import { REDIS_HOST, REDIS_PORT } from "../utils/env.js";

const redisClient = createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});

redisClient.on("error", (err) => {
  console.log("Redis Error:", err);
});

await redisClient.connect();

export const deleteByPattern = async (pattern) => {
  try {
    const keys = [];

    for await (const key of redisClient.scanIterator({
      MATCH: pattern,
      COUNT: 100,
    })) {
      keys.push(key);
    }

    if (keys.length > 0) {
      await redisClient.del(...keys);
    }

    console.log(`Deleted ${keys.length} keys`);
    return keys.length;
  } catch (err) {
    console.error("Delete Pattern Error:", err);
  }
};

export default redisClient;