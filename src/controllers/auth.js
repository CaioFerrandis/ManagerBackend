import { registerServices, loginServices } from '../services/auth.js';

export async function registerController(req, res) {
  try {
    const { name, email, password, accountType, companyName, key } = req.body;

    const user = await registerServices({ 
      name, 
      email, 
      password, 
      accountType, 
      companyName, 
      key 
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function loginController(req, res) {
  try {
    const { email, password } = req.body;
    const data = await loginServices(email, password);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function logoutController(req, res) {
  return res.status(200).json({ message: 'Logged out successfully.' });
}

