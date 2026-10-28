import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { AuthError, getUser, verifyRequestOrigin } from "@netlify/identity";
import { and, desc, eq, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  bookings,
  blogPosts,
  clients,
  customerProfiles,
  documents,
  inquiries,
  portfolioItems,
  processSteps,
  serviceRequests,
  services,
  testimonials,
  users
} from "../../db/schema.js";

const requestStatuses = ["Pending", "Received", "In Progress", "Awaiting Customer", "Completed", "Cancelled"] as const;
const allowedExtensions = new Set(["pdf", "doc", "docx", "xls", "xlsx", "csv", "txt", "jpg", "jpeg", "png"]);
const maxUploadBytes = 4 * 1024 * 1024;

function json(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
      ...init.headers
    }
  });
}

function text(value: unknown, maxLength = 5000) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function safeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120) || "document";
}

function isAdmin(user: Awaited<ReturnType<typeof getUser>>) {
  const roles = user?.roles ?? (Array.isArray(user?.appMetadata?.roles) ? user.appMetadata.roles as string[] : []);
  return roles.includes("admin") || user?.role === "admin";
}

function publicRequest(row: typeof serviceRequests.$inferSelect) {
  const { documentKeys: _, adminNotes: __, ...safe } = row;
  return safe;
}

async function jsonBody(req: Request) {
  try {
    const payload = await req.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error();
    return payload as Record<string, unknown>;
  } catch {
    throw json({ error: "A valid JSON object is required." }, { status: 400 });
  }
}

async function currentAccount() {
  const identity = await getUser();
  if (!identity?.id || !identity.email) return null;
  const name = text(identity.name || identity.userMetadata?.full_name || identity.email.split("@")[0], 255);
  const phone = text(identity.userMetadata?.phone, 20);
  const [existing] = await db.select().from(users).where(eq(users.netlifyIdentityId, identity.id)).limit(1);
  if (existing) {
    const [account] = await db.update(users).set({
      email: identity.email.toLowerCase(),
      role: isAdmin(identity) ? "admin" : "customer"
    }).where(eq(users.id, existing.id)).returning();
    return { identity, account };
  }
  const [account] = await db.insert(users).values({
    email: identity.email.toLowerCase(),
    name,
    phone,
    role: isAdmin(identity) ? "admin" : "customer",
    netlifyIdentityId: identity.id,
    updatedAt: new Date()
  }).onConflictDoUpdate({
    target: users.email,
    set: {
      role: isAdmin(identity) ? "admin" : "customer",
      netlifyIdentityId: identity.id,
      updatedAt: new Date()
    },
    setWhere: or(eq(users.netlifyIdentityId, ""), eq(users.netlifyIdentityId, identity.id))
  }).returning();
  if (!account) throw json({ error: "This email is linked to another account. Contact support." }, { status: 409 });
  return { identity, account };
}

async function requireAccount() {
  const current = await currentAccount();
  if (!current) throw new Response(JSON.stringify({ error: "Sign in is required." }), { status: 401, headers: { "Content-Type": "application/json" } });
  return current;
}

async function requireAdmin() {
  const current = await requireAccount();
  if (!isAdmin(current.identity)) throw new Response(JSON.stringify({ error: "Administrator access is required." }), { status: 403, headers: { "Content-Type": "application/json" } });
  return current;
}

async function handleServices(req: Request) {
  if (req.method === "GET") {
    const rows = await db.select().from(services).where(eq(services.active, true)).orderBy(services.category, services.title);
    return json(rows);
  }
  if (!["POST", "PATCH", "DELETE"].includes(req.method)) return json({ error: "Method not allowed." }, { status: 405 });
  await requireAdmin();
  verifyRequestOrigin(req);
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (req.method === "DELETE") {
    if (!Number.isSafeInteger(id) || id < 1) return json({ error: "A valid service ID is required." }, { status: 400 });
    const [archived] = await db.update(services).set({ active: false, updatedAt: new Date() }).where(eq(services.id, id)).returning();
    return archived ? json(archived) : json({ error: "Service not found." }, { status: 404 });
  }
  const payload = await jsonBody(req);
  if (req.method === "POST") {
    const title = text(payload.title, 255);
    const shortDescription = text(payload.shortDescription || payload.description, 1000);
    const fullDescription = text(payload.fullDescription || payload.shortDescription, 5000);
    if (!title || !shortDescription || !text(payload.category, 100)) return json({ error: "Title, category and description are required." }, { status: 400 });
    const [created] = await db.insert(services).values({
      title,
      category: text(payload.category, 100),
      slug: slugify(text(payload.slug || title, 255)),
      shortDescription,
      fullDescription,
      features: Array.isArray(payload.features) ? payload.features.map(value => text(value, 255)).slice(0, 12) : [],
      benefits: Array.isArray(payload.benefits) ? payload.benefits.map(value => text(value, 255)).slice(0, 12) : [],
      suitableCustomer: text(payload.suitableCustomer, 2000),
      pricing: text(payload.pricing || "Custom quote", 255)
    }).returning();
    return json(created, { status: 201 });
  }
  if (req.method === "PATCH") {
    if (!Number.isSafeInteger(id) || id < 1) return json({ error: "A valid service ID is required." }, { status: 400 });
    const updates: Partial<typeof services.$inferInsert> = { updatedAt: new Date() };
    if (payload.title !== undefined) updates.title = text(payload.title, 255);
    if (payload.category !== undefined) updates.category = text(payload.category, 100);
    if (payload.shortDescription !== undefined) updates.shortDescription = text(payload.shortDescription, 1000);
    if (payload.fullDescription !== undefined) updates.fullDescription = text(payload.fullDescription);
    if (payload.suitableCustomer !== undefined) updates.suitableCustomer = text(payload.suitableCustomer, 2000);
    if (payload.pricing !== undefined) updates.pricing = text(payload.pricing, 255);
    if (typeof payload.active === "boolean") updates.active = payload.active;
    if (Object.values(updates).some(value => value === "")) return json({ error: "Service fields cannot be empty." }, { status: 400 });
    const [updated] = await db.update(services).set(updates).where(eq(services.id, id)).returning();
    return updated ? json(updated) : json({ error: "Service not found." }, { status: 404 });
  }
  return json({ error: "Method not allowed." }, { status: 405 });
}

async function handleInquiry(req: Request) {
  if (req.method !== "POST") return json({ error: "Method not allowed." }, { status: 405 });
  verifyRequestOrigin(req);
  const payload = await jsonBody(req);
  if (text(payload["bot-field"])) return json({ error: "Submission declined." }, { status: 400 });
  const name = text(payload.name, 255);
  const email = text(payload.email, 255).toLowerCase();
  const message = text(payload.message, 5000);
  if (!name || !email.includes("@") || !message) return json({ error: "Name, email and message are required." }, { status: 400 });
  const [created] = await db.insert(inquiries).values({
    name,
    email,
    phone: text(payload.phone, 20),
    service: text(payload.service || "General", 255),
    message
  }).returning({ id: inquiries.id });
  return json(created, { status: 201 });
}

async function handleLegacyBooking(req: Request) {
  if (req.method === "GET") {
    const { identity } = await requireAccount();
    const rows = await db.select().from(bookings).where(isAdmin(identity) ? undefined : eq(bookings.email, identity.email!.toLowerCase())).orderBy(desc(bookings.createdAt)).limit(250);
    return json(rows);
  }
  if (req.method === "PATCH") {
    await requireAdmin();
    verifyRequestOrigin(req);
    const id = Number(new URL(req.url).searchParams.get("id"));
    const payload = await jsonBody(req);
    const status = text(payload.status, 50) as typeof requestStatuses[number];
    if (!Number.isSafeInteger(id) || id < 1 || !requestStatuses.includes(status)) return json({ error: "A valid booking and status are required." }, { status: 400 });
    const [updated] = await db.update(bookings).set({ status }).where(eq(bookings.id, id)).returning();
    return updated ? json(updated) : json({ error: "Booking not found." }, { status: 404 });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed." }, { status: 405 });
  verifyRequestOrigin(req);
  const payload = await jsonBody(req);
  if (text(payload["bot-field"])) return json({ error: "Submission declined." }, { status: 400 });
  if (!text(payload.name, 255) || !text(payload.phone, 20) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(payload.email, 255)) || !text(payload.serviceRequired, 255) || !text(payload.projectDescription)) {
    return json({ error: "Name, phone, valid email, service and project description are required." }, { status: 400 });
  }
  const [created] = await db.insert(bookings).values({
    name: text(payload.name, 255),
    phone: text(payload.phone, 20),
    email: text(payload.email, 255).toLowerCase(),
    serviceRequired: text(payload.serviceRequired, 255),
    preferredDate: text(payload.preferredDate, 50),
    projectDescription: text(payload.projectDescription, 5000)
  }).returning({ id: bookings.id });
  return json(created, { status: 201 });
}

async function handleMe(req: Request) {
  if (req.method !== "GET") return json({ error: "Method not allowed." }, { status: 405 });
  const { identity, account } = await requireAccount();
  const [profile] = await db.select().from(customerProfiles).where(eq(customerProfiles.userId, account.id)).limit(1);
  return json({
    identity: { id: identity.id, email: identity.email, name: identity.name, roles: identity.roles ?? identity.appMetadata?.roles ?? [] },
    account: { id: account.id, email: account.email, name: account.name, phone: account.phone, company: account.company },
    profile: profile ?? null
  });
}

async function handleProfile(req: Request) {
  if (req.method !== "PATCH") return json({ error: "Method not allowed." }, { status: 405 });
  verifyRequestOrigin(req);
  const { account } = await requireAccount();
  const payload = await jsonBody(req);
  const name = text(payload.name, 255);
  const phone = text(payload.phone, 20);
  const company = text(payload.company, 255);
  if (!name) return json({ error: "Name is required." }, { status: 400 });
  await db.update(users).set({ name, phone, company, updatedAt: new Date() }).where(eq(users.id, account.id));
  const [profile] = await db.insert(customerProfiles).values({
    userId: account.id,
    company,
    industry: text(payload.industry, 100),
    businessType: text(payload.businessType, 100),
    location: text(payload.location, 255),
    profileComplete: Boolean(phone && text(payload.location, 255)),
    updatedAt: new Date()
  }).onConflictDoUpdate({
    target: customerProfiles.userId,
    set: {
      company,
      industry: text(payload.industry, 100),
      businessType: text(payload.businessType, 100),
      location: text(payload.location, 255),
      profileComplete: Boolean(phone && text(payload.location, 255)),
      updatedAt: new Date()
    }
  }).returning();
  return json(profile);
}

async function handleServiceRequests(req: Request) {
  const { identity, account } = await requireAccount();
  if (req.method === "GET") {
    const rows = await db.select().from(serviceRequests).where(eq(serviceRequests.userId, account.id)).orderBy(desc(serviceRequests.createdAt));
    return json(rows.map(publicRequest));
  }
  if (req.method !== "POST") return json({ error: "Method not allowed." }, { status: 405 });
  verifyRequestOrigin(req);
  let form: FormData;
  try { form = await req.formData(); } catch { return json({ error: "A valid request form is required." }, { status: 400 }); }
  const serviceTitle = text(form.get("serviceTitle"), 255);
  const description = text(form.get("description"), 5000);
  const phone = text(form.get("phone"), 20);
  if (!serviceTitle || !description || !phone) return json({ error: "Service, phone and description are required." }, { status: 400 });
  const files = form.getAll("documents").filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length > 5 || files.reduce((total, file) => total + file.size, 0) > maxUploadBytes) return json({ error: "Attach up to 5 documents with a combined size of 4 MB or less." }, { status: 413 });
  if (files.some(file => !allowedExtensions.has(file.name.split(".").pop()?.toLowerCase() || ""))) return json({ error: "An attachment type is not supported. Use PDF, Office, text, CSV, JPEG or PNG." }, { status: 400 });
  const uploads = files.length ? getStore("service-request-documents") : null;
  const [created] = await db.insert(serviceRequests).values({
    userId: account.id,
    email: identity.email || account.email,
    name: text(form.get("name") || account.name, 255),
    phone,
    serviceTitle,
    description,
    preferredDate: text(form.get("preferredDate"), 50),
    budget: text(form.get("budget"), 100),
    status: "Pending"
  }).returning();

  const documentNames: string[] = [];
  const documentKeys: string[] = [];
  try {
    for (const file of files) {
      const name = safeFileName(file.name);
      const key = `${identity.id}/${created.id}/${crypto.randomUUID()}-${name}`;
      documentKeys.push(key);
      await uploads!.set(key, file);
      documentNames.push(name);
    }
    if (documentKeys.length) {
      const [updated] = await db.update(serviceRequests).set({ documentNames, documentKeys, updatedAt: new Date() }).where(eq(serviceRequests.id, created.id)).returning();
      return json(publicRequest(updated), { status: 201 });
    }
    return json(publicRequest(created), { status: 201 });
  } catch {
    await Promise.allSettled(documentKeys.map(key => uploads!.delete(key)));
    await db.delete(serviceRequests).where(eq(serviceRequests.id, created.id));
    return json({ error: "Your attachments could not be saved. No request was submitted; please retry." }, { status: 503 });
  }
}

async function handleAdminRequests(req: Request) {
  await requireAdmin();
  if (req.method === "GET") {
    const rows = await db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt)).limit(250);
    return json(rows.map(publicRequest));
  }
  if (req.method === "PATCH") {
    verifyRequestOrigin(req);
    const id = Number(new URL(req.url).searchParams.get("id"));
    const payload = await jsonBody(req);
    const status = text(payload.status, 50) as typeof requestStatuses[number];
    if (!id || !requestStatuses.includes(status)) return json({ error: "A valid request and status are required." }, { status: 400 });
    const [updated] = await db.update(serviceRequests).set({ status, updatedAt: new Date() }).where(eq(serviceRequests.id, id)).returning();
    if (!updated) return json({ error: "Request not found." }, { status: 404 });
    return json(publicRequest(updated));
  }
  return json({ error: "Method not allowed." }, { status: 405 });
}

async function handleDocument(req: Request) {
  if (req.method !== "GET") return json({ error: "Method not allowed." }, { status: 405 });
  const { account, identity } = await requireAccount();
  const url = new URL(req.url);
  const requestId = Number(url.searchParams.get("requestId"));
  const index = Number(url.searchParams.get("index"));
  if (!requestId || !Number.isInteger(index) || index < 0) return json({ error: "Invalid document reference." }, { status: 400 });
  const [request] = await db.select().from(serviceRequests).where(and(eq(serviceRequests.id, requestId), isAdmin(identity) ? eq(serviceRequests.id, requestId) : eq(serviceRequests.userId, account.id))).limit(1);
  const key = request?.documentKeys?.[index];
  const fileName = request?.documentNames?.[index];
  if (!key || !fileName) return json({ error: "Document not found." }, { status: 404 });
  const file = await getStore("service-request-documents").get(key, { type: "blob" });
  if (!(file instanceof Blob)) return json({ error: "Document not found." }, { status: 404 });
  return new Response(file, { headers: { "Content-Disposition": `attachment; filename="${safeFileName(fileName)}"`, "Content-Type": file.type || "application/octet-stream", "Cache-Control": "private, no-store" } });
}

async function handleLegacyDocuments(req: Request) {
  const { identity } = await requireAccount();
  if (req.method === "GET") {
    return json(await db.select().from(documents).where(isAdmin(identity) ? undefined : eq(documents.clientEmail, identity.email!.toLowerCase())).orderBy(desc(documents.createdAt)).limit(250));
  }
  if (req.method !== "POST") return json({ error: "Method not allowed." }, { status: 405 });
  verifyRequestOrigin(req);
  const payload = await jsonBody(req);
  const fileName = text(payload.fileName, 255);
  const bookingId = Number(payload.bookingId);
  if (!fileName || !Number.isSafeInteger(bookingId) || bookingId < 1) return json({ error: "A filename and a valid booking ID are required." }, { status: 400 });
  const [booking] = await db.select().from(bookings).where(and(eq(bookings.id, bookingId), isAdmin(identity) ? undefined : eq(bookings.email, identity.email!.toLowerCase()))).limit(1);
  if (!booking) return json({ error: "Booking not found." }, { status: 404 });
  const [created] = await db.insert(documents).values({ clientEmail: booking.email, bookingId, fileName, status: "Received" }).returning();
  return json(created, { status: 201 });
}

async function handleLegacyAdmin(resource: string, req: Request) {
  await requireAdmin();
  if (req.method !== "GET") return json({ error: "Method not allowed." }, { status: 405 });
  if (resource === "inquiries") return json(await db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(250));
  if (resource === "clients") return json(await db.select().from(clients).orderBy(desc(clients.createdAt)).limit(250));
  if (resource === "users") return json(await db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone, company: users.company, role: users.role, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt)).limit(250));
  if (resource === "analytics") {
    const requests = await db.select({ id: serviceRequests.id, status: serviceRequests.status }).from(serviceRequests);
    return json({ total: requests.length, statuses: Object.fromEntries(requestStatuses.map(status => [status, requests.filter(request => request.status === status).length])) });
  }
  return json({ error: "Unknown resource." }, { status: 404 });
}

async function handleContent(resource: string, req: Request) {
  const tables = { blogPosts, portfolioItems, testimonials, processSteps };
  const table = tables[resource as keyof typeof tables];
  if (req.method === "GET") {
    const visibility = resource === "blogPosts" ? eq(blogPosts.published, true) : resource === "testimonials" ? eq(testimonials.published, true) : resource === "processSteps" ? eq(processSteps.active, true) : undefined;
    return json(await db.select().from(table).where(visibility).orderBy(desc(table.createdAt)).limit(100));
  }
  await requireAdmin();
  verifyRequestOrigin(req);
  const payload = await jsonBody(req);
  if (req.method === "POST" && resource === "blogPosts") {
    const title = text(payload.title, 255);
    const content = text(payload.content, 20000);
    if (!title || !content) return json({ error: "Title and content are required." }, { status: 400 });
    const [created] = await db.insert(blogPosts).values({ title, slug: slugify(text(payload.slug || title, 255)), excerpt: text(payload.excerpt || content, 1000), content, category: text(payload.category || "Business", 100), published: payload.published !== false }).returning();
    return json(created, { status: 201 });
  }
  if (req.method === "POST" && resource === "portfolioItems") {
    const title = text(payload.title, 255);
    const description = text(payload.description);
    if (!title || !description) return json({ error: "Title and description are required." }, { status: 400 });
    const [created] = await db.insert(portfolioItems).values({ title, category: text(payload.category || "Business", 100), description, outcome: text(payload.outcome || "Completed", 255) }).returning();
    return json(created, { status: 201 });
  }
  if (req.method === "POST" && resource === "testimonials") {
    const clientName = text(payload.clientName, 255);
    const testimonialText = text(payload.testimonialText);
    if (!clientName || !testimonialText) return json({ error: "Client name and approved testimonial text are required." }, { status: 400 });
    const [created] = await db.insert(testimonials).values({ clientName, testimonialText, clientCompany: text(payload.clientCompany, 255), published: payload.published === true }).returning();
    return json(created, { status: 201 });
  }
  if (req.method === "PATCH") {
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!Number.isSafeInteger(id) || id < 1) return json({ error: "A valid record ID is required." }, { status: 400 });
    if (resource === "blogPosts" && typeof payload.published === "boolean") {
      const [updated] = await db.update(blogPosts).set({ published: payload.published, updatedAt: new Date() }).where(eq(blogPosts.id, id)).returning();
      return updated ? json(updated) : json({ error: "Record not found." }, { status: 404 });
    }
    if (resource === "testimonials" && typeof payload.published === "boolean") {
      const [updated] = await db.update(testimonials).set({ published: payload.published }).where(eq(testimonials.id, id)).returning();
      return updated ? json(updated) : json({ error: "Record not found." }, { status: 404 });
    }
  }
  return json({ error: "Method not allowed." }, { status: 405 });
}

export default async (req: Request, _context: Context) => {
  const resource = new URL(req.url).pathname.split("/").filter(Boolean).pop() || "";
  try {
    if (resource === "services") return await handleServices(req);
    if (resource === "inquiries") return req.method === "GET" ? await handleLegacyAdmin(resource, req) : await handleInquiry(req);
    if (resource === "bookings") return await handleLegacyBooking(req);
    if (resource === "me") return await handleMe(req);
    if (resource === "profile") return await handleProfile(req);
    if (resource === "serviceRequests") return await handleServiceRequests(req);
    if (resource === "adminRequests") return await handleAdminRequests(req);
    if (resource === "document") return await handleDocument(req);
    if (resource === "documents") return await handleLegacyDocuments(req);
    if (["clients", "users", "analytics"].includes(resource)) return await handleLegacyAdmin(resource, req);
    if (["blogPosts", "portfolioItems", "testimonials", "processSteps"].includes(resource)) return await handleContent(resource, req);
    return json({ error: "Unknown API resource." }, { status: 404 });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof AuthError && error.status === 403) return json({ error: "Request origin is not allowed." }, { status: 403 });
    if (error && typeof error === "object" && "cause" in error && (error.cause as { code?: string })?.code === "23505") return json({ error: "This record already exists. Choose a unique title or email." }, { status: 409 });
    console.error("API request failed", { requestId: _context.requestId, resource });
    return json({ error: "The server could not complete this request." }, { status: 500 });
  }
};

export const config: Config = { path: "/api/:resource" };
