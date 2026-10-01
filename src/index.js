import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import keysRoutes from './routes/keys.routes.js';
import teamRoutes from './routes/teams.routes.js';
import userRoutes from './routes/user.routes.js';
import formRoutes from './routes/form.routes.js';
import atividadeRoutes from './routes/atividade.routes.js';
import clientRoutes from './routes/clientes.routes.js';
import equipamentoRoutes from './routes/equipamento.routes.js';
import companyRoutes from './routes/company.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/auth', authRoutes);
app.use('/invitation-keys', keysRoutes);

app.use('/teams', teamRoutes);
app.use('/users', userRoutes); 
app.use('/forms', formRoutes);
app.use('/atividade', atividadeRoutes);
app.use('/clients', clientRoutes);
app.use('/equipments', equipamentoRoutes);
app.use('/company', companyRoutes);

app.get('/', (req, res) => {
  res.send("Backend Up and Runnin'");
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
