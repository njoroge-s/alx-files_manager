import { Express } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';


const router = router();

router.get('/status', getStatus);
router.get('/stats', getStats);
router.post('/users', UsersController.postNew);

export default router;
