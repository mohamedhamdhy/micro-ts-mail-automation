import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
import { sendEmail } from "./emailService";

dotenv.config();

export const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null
});

export const emailQueue = new Queue("emailQueue", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 }
  }
});

export const worker = new Worker(
  "emailQueue",
  async (job) => {
    const { to, subject, html, attachment } = job.data;
    console.log(
      attachment
        ? `📎 Sending to ${to} WITH attachment`
        : `📧 Sending to ${to} (no attachment)`
    );
    await sendEmail(to, subject, html, attachment);
    return true;
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`✅ Sent → ${job.data.to}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Failed → ${job?.data?.to}: ${err.message}`);
});