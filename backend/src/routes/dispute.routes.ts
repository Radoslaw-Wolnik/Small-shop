// Route for creating a dispute by logged in user

// Then i want route to create dispiute to specific order by not logged in user using magic ling 
// (in link there will be a token or sth like that valid for 14days since recived)
// or valid until server switches it to invalid (based on shipment status automaticly or sth like that)
// router.post('/:orderID/:token/dispiute', createDispiute) or sth like that

// Route for updating dispute status (owner only)


// dispute.routes.ts
import express from 'express';
import { authenticateJWT, handleAnonymousAuth } from '../middleware/auth.middleware';
import { isOwner } from '../middleware/role.middleware';
import {
    getDisputeDetails,
    listDisputes,
    createDispute,
    updateDisputeStatus,
    deleteDispute,
    addAttachmentToDispute
  } from '../controllers/dispute.controller';
import { multerErrorHandler } from '../middleware/multer.middleware';
import { uploadDisputeAttachments } from '../middleware/upload.middleware';

const router = express.Router();

router.post('/:orderId/:token', handleAnonymousAuth, createDispute);
router.post('/upload/:orderId/:token', handleAnonymousAuth, multerErrorHandler(uploadDisputeAttachments), createDispute);
router.get('/:id/:token', handleAnonymousAuth, getDisputeDetails);

// for logged in users
router.use(authenticateJWT);
router.get('/:id', getDisputeDetails);
router.post('/:orderId', createDispute);
router.post('/upload/:id', multerErrorHandler(uploadDisputeAttachments), addAttachmentToDispute);
// Ensure all routes are protected and require owner privileges
router.use(isOwner); // idk if its enough or if do authenticatetoken agin
router.get('/', listDisputes);
// update-delete
router.put('/:id/status', updateDisputeStatus);
router.delete('/:id', deleteDispute); // can be automatic after its closed and some time passed

export default router;
