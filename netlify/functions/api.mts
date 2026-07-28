import type { Config } from "@netlify/functions";
import { desc, eq, and } from "drizzle-orm";
import { db } from "../../db/index.js";
import { 
  blogPosts, 
  bookings, 
  clients, 
  documents, 
  inquiries, 
  portfolioItems, 
  services,
  users,
  serviceRequests,
  customerProfiles,
  testimonials,
  processSteps
} from "../../db/schema.js";

const tables = { 
  services, 
  bookings, 
  inquiries, 
  clients, 
  blogPosts, 
  portfolioItems, 
  documents,
  users,
  serviceRequests,
  customerProfiles,
  testimonials,
  processSteps
};

function json(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, { 
    headers: { 
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
      ...init.headers 
    }, 
    ...init 
  });
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function body(req: Request) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

// Authorization check - checks if user is admin
function isAdmin(req: Request): boolean {
  const authHeader = req.headers.get("authorization");
  // In production, this would verify JWT from Netlify Identity
  // For now, check for admin token in header
  if (!authHeader) return false;
  // This is a simplified check - in production use proper JWT verification
  return authHeader.includes("admin");
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const resource = url.pathname.split("/").filter(Boolean).pop() || "";
  const table = tables[resource as keyof typeof tables];

  if (!table) return json({ error: "Unknown resource" }, { status: 404 });

  // GET - Read all records
  if (req.method === "GET") {
    try {
      const rows = await db.select().from(table as any).orderBy(desc((table as any).createdAt)).limit(100);
      return json(rows);
    } catch (error) {
      console.error("GET error:", error);
      return json({ error: "Failed to fetch records" }, { status: 500 });
    }
  }

  // POST - Create new record
  if (req.method === "POST") {
    try {
      const payload = await body(req);
      
      // Validate required fields
      if (!payload || Object.keys(payload).length === 0) {
        return json({ error: "Empty payload" }, { status: 400 });
      }

      // Auto-slug for services and blog posts
      if (resource === "services" || resource === "blogPosts") {
        payload.slug ||= slugify(payload.title || "item");
      }

      const [created] = await db.insert(table as any).values(payload).returning();
      return json(created, { status: 201 });
    } catch (error: any) {
      console.error("POST error:", error);
      return json({ error: error.message || "Failed to create record" }, { status: 500 });
    }
  }

  // PATCH - Update existing record
  if (req.method === "PATCH") {
    try {
      const payload = await body(req);
      const id = Number(url.searchParams.get("id") || payload.id);
      if (!id) return json({ error: "Missing id" }, { status: 400 });
      
      delete payload.id;
      const [updated] = await db.update(table as any).set(payload).where(eq((table as any).id, id)).returning();
      return json(updated);
    } catch (error: any) {
      console.error("PATCH error:", error);
      return json({ error: error.message || "Failed to update record" }, { status: 500 });
    }
  }

  // DELETE - Remove record (requires admin)
  if (req.method === "DELETE") {
    try {
      if (!isAdmin(req)) {
        return json({ error: "Unauthorized" }, { status: 403 });
      }
      
      const id = Number(url.searchParams.get("id"));
      if (!id) return json({ error: "Missing id" }, { status: 400 });
      
      await db.delete(table as any).where(eq((table as any).id, id));
      return json({ ok: true });
    } catch (error: any) {
      console.error("DELETE error:", error);
      return json({ error: error.message || "Failed to delete record" }, { status: 500 });
    }
  }

  return json({ error: "Method not allowed" }, { status: 405 });
};

export const config: Config = {
  path: "/api/:resource",
};
