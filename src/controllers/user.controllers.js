import {
  getUsersService,
  updateUserTeamService,
  updateProfileService,
} from "../services/user.services.js";

export async function getUsers(req, res) {
  try {
    const { company_id } = req.query;
    const users = await getUsersService(company_id);
    return res.json(users);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function updateUserTeam(req, res) {
  try {
    const { userId, team_id } = req.body;
    const updated = await updateUserTeamService(userId, team_id);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user?.id || req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: "ID do usuário não fornecido." });
    }

    const updatedUser = await updateProfileService(userId, req.body);
    return res.json({
      message: "Perfil atualizado com sucesso!",
      user: updatedUser,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
