import express, { Response } from "express";
import { AuthenticatedRequest, verifyFirebaseToken } from "../middleware/auth";

const router = express.Router();

router.get("/me", verifyFirebaseToken, (req: AuthenticatedRequest, res: Response) => {
  res.json(req.user);
});

export default router;
