import express from "express";
import multer from "multer";
import fs from "fs";
import csvParser from "csv-parser";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { emailQueue, worker } from "./queue";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const RESUME_PATH = path.join("uploads", "Mohamed-Al-Hamdhy-Full-Stack-Developer-Resume.pdf");

const csvUpload = multer({ dest: "data/" });

interface EmailRow {
  email: string;
  name?: string;
  company?: string;
}

app.post("/upload-csv", csvUpload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No CSV file uploaded" });
    return;
  }

  if (!fs.existsSync(RESUME_PATH)) {
    res.status(500).json({
      error: `Resume not found at "${RESUME_PATH}". Place your PDF in the uploads/ folder.`
    });
    return;
  }

  const filePath = req.file.path;
  const emails: EmailRow[] = [];

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (row: EmailRow) => emails.push(row))
    .on("end", async () => {
      fs.unlinkSync(filePath);

      let queued = 0;
      let skipped = 0;

      for (const e of emails) {
        if (!e.email || !e.email.trim()) {
          console.warn("Row missing email, skipping:", e);
          skipped++;
          continue;
        }

        await emailQueue.add("send-email", {
          to: e.email.trim(),
          subject: "Job Application – Full Stack Developer",
          html: `
            <p>Hello ${e.name ? e.name.trim() : "there"},</p>
            <p>I hope this message finds you well. I am reaching out to express my interest
            in a <strong>Full Stack Developer</strong> role${e.company ? ` at <strong>${e.company.trim()}</strong>` : ""
            }.</p>
            <p>Please find my resume attached. I would love the opportunity to connect
            and discuss how I can contribute to your team.</p>
            <br/>
            <p>Best regards,<br/>
            <strong>Mohamed Al Hamdhy</strong><br/>
            Full Stack Developer</p>
          `,
          attachment: RESUME_PATH
        });

        queued++;
      }

      console.log(`✅ Queued: ${queued} | Skipped: ${skipped}`);
      res.json({ success: true, queued, skipped });
    })
    .on("error", (err) => {
      console.error("CSV parse error:", err);
      res.status(500).json({ error: "Failed to parse CSV" });
    });
});

io.on("connection", () => {
  console.log("Dashboard client connected");
});

worker.on("completed", (job) => {
  io.emit("email-sent", { to: job.data.to });
});

worker.on("failed", (job, err) => {
  io.emit("email-failed", { to: job?.data?.to, error: err.message });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`Server running → http://localhost:${PORT}`)
);