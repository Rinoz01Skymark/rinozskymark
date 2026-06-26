import type { Config } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { blogPosts, bookings, clients, documents, inquiries, portfolioItems, services } from "../../db/schema.js";

const tables = { services, bookings, inquiries, clients, blogPosts, portfolioItems, documents };

function json(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, { headers: { "Cache-Control": "no-store", ...init.headers }, ...init });
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

export default async (req: Request) => {
  const url = new URL(req.url);
  const resource = url.pathname.split("/").filter(Boolean).pop() || "";
  const table = tables[resource as keyof typeof tables];

  if (!table) return json({ error: "Unknown resource" }, { status: 404 });

  if (req.method === "GET") {
    const rows = await db.select().from(table as any).orderBy(desc((table as any).createdAt)).limit(100);
    return json(rows);
  }

  if (req.method === "POST") {
    const payload = await body(req);
    if (resource === "services" || resource === "blogPosts") {
      payload.slug ||= slugify(payload.title || "item");
    }
    const [created] = await db.insert(table as any).values(payload).returning();
    return json(created, { status: 201 });
  }

  if (req.method === "PATCH") {
    const payload = await body(req);
    const id = Number(url.searchParams.get("id") || payload.id);
    if (!id) return json({ error: "Missing id" }, { status: 400 });
    delete payload.id;
    const [updated] = await db.update(table as any).set(payload).where(eq((table as any).id, id)).returning();
    return json(updated);
  }

  if (req.method === "DELETE") {
    const id = Number(url.searchParams.get("id"));
    if (!id) return json({ error: "Missing id" }, { status: 400 });
    await db.delete(table as any).where(eq((table as any).id, id));
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, { status: 405 });
};

export const config: Config = {
  path: "/api/:resource",
};
