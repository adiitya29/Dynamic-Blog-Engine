require("dotenv").config();

const express = require("express");
const cors = require("cors");
const slugify = require("slugify");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5007;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" || process.env.DATABASE_URL.includes("supabase")
    ? { rejectUnauthorized: false }
    : false,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

app.use(cors());
app.use(express.json());

function createSlug(title) {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });
}

async function getUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let suffix = 2;

  let result = await pool.query("SELECT id FROM posts WHERE slug = $1", [slug]);

  while (result.rowCount > 0) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
    result = await pool.query("SELECT id FROM posts WHERE slug = $1", [slug]);
  }

  return slug;
}

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/api/posts", async (req, res, next) => {
  try {
    const { title, image, description } = req.body;

    if (
      typeof title !== "string" ||
      typeof image !== "string" ||
      typeof description !== "string" ||
      !title.trim() ||
      !image.trim() ||
      !description.trim()
    ) {
      return res.status(400).json({
        error: "title, image, and description are required",
      });
    }

    const baseSlug = createSlug(title);

    if (!baseSlug) {
      return res.status(400).json({
        error: "Title must contain letters or numbers",
      });
    }

    const slug = await getUniqueSlug(baseSlug);
    const result = await pool.query(
      `INSERT INTO posts (title, slug, image, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, slug, image, description, "createdAt", "updatedAt"`,
      [title.trim(), slug, image.trim(), description.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "A post with this slug already exists",
      });
    }

    next(error);
  }
});

app.get("/api/posts/:slug", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, title, slug, image, description, "createdAt", "updatedAt"
       FROM posts
       WHERE slug = $1`,
      [req.params.slug]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);

  if (error.code && ["ECONNREFUSED", "ENOTFOUND", "28P01", "3D000", "42P01"].includes(error.code)) {
    return res.status(503).json({
      error: "Database is unavailable or the posts table has not been created",
    });
  }

  res.status(500).json({
    error: "Internal server error",
  });
});

const server = app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

async function shutdown() {
  await pool.end();

  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);