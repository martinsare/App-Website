import { Router, type IRouter } from "express";

const router: IRouter = Router();

const ADMIN_EMAIL = "admin@amkapps.com";
const ADMIN_PASSWORD = "admin123";

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  res.cookie("admin_session", "mock-session-token", {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "lax",
  });

  res.json({
    id: "admin-1",
    email: ADMIN_EMAIL,
    role: "admin",
  });
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.clearCookie("admin_session");
  res.sendStatus(204);
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const session = req.cookies?.admin_session;

  if (!session || session !== "mock-session-token") {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json({
    id: "admin-1",
    email: ADMIN_EMAIL,
    role: "admin",
  });
});

export default router;
