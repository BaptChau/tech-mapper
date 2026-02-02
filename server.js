import "dotenv/config";
import express from "express";
import fs from "fs/promises";
import path from "path";

const app = express();
const PORT = 5173;
const isDev = process.env.APP_ENV === "dev";
const TECH_PASSWORD =
  process.env.TECH_PASSWORD || (isDev ? "jenesuispaslevraimotdepasse" : "");
const TECH_USER = process.env.TECH_USER || "tech";
const dataPath = path.resolve("data", "techs.json");

app.use(express.json());
app.use(express.static("."));

function unauthorized(res) {
  res.set("WWW-Authenticate", "Basic realm=\"Tech Mapper\"");
  return res.status(401).json({ error: "Unauthorized" });
}

function checkAuth(req) {
  if (!TECH_PASSWORD) return false;
  const header = req.headers.authorization || "";
  if (!header.startsWith("Basic ")) return false;
  const raw = Buffer.from(header.slice(6), "base64").toString("utf8");
  const [user, pass] = raw.split(":");
  return user === TECH_USER && pass === TECH_PASSWORD;
}

async function readTechs() {
  const raw = await fs.readFile(dataPath, "utf8");
  return JSON.parse(raw);
}

async function writeTechs(list) {
  const payload = JSON.stringify(list, null, 2) + "\n";
  await fs.writeFile(dataPath, payload, "utf8");
}

function normalize(value) {
  return value.trim().toLowerCase();
}

app.get("/api/techs", async (_req, res) => {
  try {
    const data = await readTechs();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to read data" });
  }
});

app.post("/api/techs", async (req, res) => {
  if (!checkAuth(req)) return unauthorized(res);
  const tech = (req.body.tech || "").toString().trim();
  const language = (req.body.language || "").toString().trim();
  if (!tech || !language) {
    return res.status(400).json({ error: "Missing tech or language" });
  }

  try {
    const list = await readTechs();
    const exists = list.some(
      (item) => normalize(item.tech) === normalize(tech)
    );
    if (exists) {
      return res.status(409).json({ error: "Tech already exists" });
    }
    const item = { tech, language };
    list.push(item);
    await writeTechs(list);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to write data" });
  }
});

app.listen(PORT, () => {
  console.log(`Tech mapper running on http://localhost:${PORT}`);
});
