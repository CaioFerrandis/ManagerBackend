import { Router } from 'express';
import { FormController } from '../controllers/form.controllers.js';

const router = Router();
const formController = new FormController();

router.get('/', (req, res) => formController.index(req, res));
router.get('/:id', (req, res) => formController.show(req, res));
router.post('/', (req, res) => formController.store(req, res));
router.put('/:id', (req, res) => formController.update(req, res));
router.delete('/:id', (req, res) => formController.delete(req, res));

export default router;
