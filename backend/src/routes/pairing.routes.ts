import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { 
  sendPairingRequest, 
  getPairingRequests, 
  respondToPairingRequest,
  unpair,
  sendPairingRequestValidation 
} from '../controllers/pairing.controller';

const router = Router();

router.post('/request', authenticate, sendPairingRequestValidation, sendPairingRequest);
router.get('/requests', authenticate, getPairingRequests);
router.post('/respond/:id', authenticate, respondToPairingRequest);
router.post('/unpair', authenticate, unpair);

export default router;
