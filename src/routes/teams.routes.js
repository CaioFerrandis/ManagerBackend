import { Router } from "express";
import { getTeams, createTeam, updateTeamName, deleteTeam } from "../controllers/teams.controllers.js";

const router = Router();

router.get("/", getTeams);
router.post("/", createTeam);
router.put("/:id", updateTeamName);
router.delete("/:id", deleteTeam);

export default router;
