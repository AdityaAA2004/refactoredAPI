import { Router } from 'express';
import { postController, authenticate } from '../bootstrap/container.js';

const router = Router();
const controller = postController;

// List all posts with pagination and filtering
router.get('/', controller.getAll.bind(controller));
// Get a single post by ID
router.get('/:id', controller.getById.bind(controller));
// Update an existing post (requires authentication + ownership)
router.put('/:id', authenticate, controller.update.bind(controller));
// Delete a post (requires authentication + ownership)
router.delete('/:id', authenticate, controller.remove.bind(controller));

// --- Nested routes: comments under Post ---
// List all comments for a post (always available)
router.get('/:id/comments', controller.getCommentsForPost.bind(controller));
// Create a comment — canonical create route (primary parent: Post)
router.post('/:id/comments', authenticate, controller.createCommentForPost.bind(controller));

export { router as postsRouter };
