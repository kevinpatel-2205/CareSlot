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

export default redisClient;
