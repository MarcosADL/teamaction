// lib/auth.ts — users + sessões simples com JWT em cookie (HttpOnly)
import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.db.json");
const AUDIT_FILE = path.join(DATA_DIR, "audit.log.json");

const COOKIE_NAME = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "user";
  createdAt: string;
};

async function ensureFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try { await fs.access(USERS_FILE); } catch { await fs.writeFile(USERS_FILE, "[]", "utf8"); }
  try { await fs.access(AUDIT_FILE); } catch { await fs.writeFile(AUDIT_FILE, "[]", "utf8"); }
}

async function readRawUsers(): Promise<User[]> {
  await ensureFiles();
  const raw = await fs.readFile(USERS_FILE, "utf8").catch(() => "[]");
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as User[]) : [];
  } catch {
    return [];
  }
}

// Seed automático (opcional) — cria admin quando a store está vazia e existem ENV
async function seedDefaultAdminIfNeeded() {
  const list = await readRawUsers();
  if (list.length > 0) return;

  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!email || !password) return;

  const passwordHash = await bcrypt.hash(password, 10);
  const admin: User = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "admin",
    createdAt: new Date().toISOString(),
  };
  await fs.writeFile(USERS_FILE, JSON.stringify([admin], null, 2), "utf8");
  console.log("[auth] Admin seed criado:", admin.email);
}

async function readUsers(): Promise<User[]> {
  await ensureFiles();
  await seedDefaultAdminIfNeeded();
  return readRawUsers();
}

async function writeUsers(items: User[]) {
  await ensureFiles();
  await fs.writeFile(USERS_FILE, JSON.stringify(items, null, 2), "utf8");
}

async function appendAudit(event: any) {
  await ensureFiles();
  const raw = await fs.readFile(AUDIT_FILE, "utf8").catch(() => "[]");
  let list: any[] = [];
  try { list = JSON.parse(raw); } catch { list = []; }
  list.push({ ...event, ts: new Date().toISOString() });
  await fs.writeFile(AUDIT_FILE, JSON.stringify(list, null, 2), "utf8");
}

export async function findUserByEmail(email: string) {
  const list = await readUsers();
  return list.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}) {
  const { name, email, password } = input;
  const role = input.role ?? "user";

  const exists = await findUserByEmail(email);
  if (exists) throw new Error("Email já registado.");

  const passwordHash = await bcrypt.hash(password, 10);
  const user: User = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };
  const list = await readUsers();
  list.push(user);
  await writeUsers(list);
  return { ...user, passwordHash: "hidden" } as const;
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

function getSecret(): Uint8Array {
  const secret =
    process.env.APP_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret";
  return new TextEncoder().encode(secret);
}

// ---- Sessões ----
export type Session = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
};

export async function createSession(user: User) {
  const jwt = await new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());

  const c = await cookies();
  c.set({
    name: COOKIE_NAME,
    value: jwt,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const c = await cookies();
  c.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<Session | null> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
      role: (payload.role as any) === "admin" ? "admin" : "user",
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<Session> {
  const sess = await getSession();
  if (!sess || sess.role !== "admin") {
    throw new Error("Não autorizado.");
  }
  return sess;
}

// ---- Admin helpers seguros ----

// Lista de utilizadores (sem passwordHash)
export async function listUsers(): Promise<
  Array<Pick<User, "id" | "name" | "email" | "role" | "createdAt">>
> {
  const list = await readUsers();
  return list.map(({ id, name, email, role, createdAt }) => ({
    id, name, email, role, createdAt,
  }));
}

// Promover/downgrade de role por email (com auditoria)
export async function setUserRoleByEmail(params: {
  requesterId: string; // quem executa (admin atual)
  requesterEmail: string;
  targetEmail: string;
  role: "admin" | "user";
}) {
  const { requesterId, requesterEmail, targetEmail, role } = params;
  const list = await readUsers();
  const idx = list.findIndex(
    (u) => u.email.toLowerCase() === targetEmail.toLowerCase()
  );
  if (idx === -1) throw new Error("Utilizador não encontrado.");

  // aplica alteração
  list[idx].role = role;
  await writeUsers(list);

  // auditoria
  await appendAudit({
    type: "role_change",
    by: { id: requesterId, email: requesterEmail },
    user: { id: list[idx].id, email: list[idx].email },
    newRole: role,
  });

  return { id: list[idx].id, email: list[idx].email, role: list[idx].role };
}
