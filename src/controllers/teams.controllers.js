import * as teamService from '../services/teams.services.js';

export async function getTeams(req, res) {
  try {
    const { company_id } = req.query;
    const teams = await teamService.getTeamsService(company_id);
    return res.json(teams);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createTeam(req, res) {
  try {
    const { name, company_id } = req.body;
    const newTeam = await teamService.createTeamService({ name, company_id });
    return res.status(201).json(newTeam);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function updateTeamName(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updated = await teamService.updateTeamNameService(id, name);
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function deleteTeam(req, res) {
  try {
    const { id } = req.params;
    await teamService.deleteTeamService(id);
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
