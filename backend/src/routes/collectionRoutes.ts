import express, { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getUserCollections,
  createCollection,
  addToCollection,
  deleteCollection,
  removeFromCollection,
  getCollectionById,
  updateCollection
} from '../controllers/collectionController';

const router: Router = express.Router();

// Get all collections for the authenticated user
router.get('/', authenticateToken, getUserCollections);

// Get a specific collection by ID
router.get('/:id', authenticateToken, getCollectionById);

// Create a new collection
router.post('/', authenticateToken, createCollection);

// Update a collection
router.put('/:id', authenticateToken, updateCollection);

// Delete a collection
router.delete('/:id', authenticateToken, deleteCollection);

// Add samples to a collection
router.post('/:id/add', authenticateToken, addToCollection);

// Remove a sample from a collection
router.delete('/:collectionId/samples/:sampleId', authenticateToken, removeFromCollection);

export default router;
