import { createAuthenticate } from '../lib/auth.js';
import { JwtTokenService } from '../adapters/jwt-token.service.js';
import { AuthController } from '../controllers/auth.controller.js';
import { AuthService } from '../services/auth.service.js';
import { BcryptPasswordHasher } from '../adapters/bcrypt-password-hasher.js';
import { UserController } from '../controllers/user.controller.js';
import { UserService } from '../services/user.service.js';
import { UserRepository } from '../repositories/user.repository.js';
import { PostController } from '../controllers/post.controller.js';
import { PostService } from '../services/post.service.js';
import { PostRepository } from '../repositories/post.repository.js';
import { CommentController } from '../controllers/comment.controller.js';
import { CommentService } from '../services/comment.service.js';
import { CommentRepository } from '../repositories/comment.repository.js';
import { DocumentController } from '../controllers/document.controller.js';
import { DocumentService } from '../services/document.service.js';
import { DocumentRepository } from '../repositories/document.repository.js';

const tokenService = new JwtTokenService();
const passwordHasher = new BcryptPasswordHasher();
export const authenticate = createAuthenticate(tokenService);
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const postRepository = new PostRepository();
const postService = new PostService(postRepository);
const commentRepository = new CommentRepository();
const commentService = new CommentService(commentRepository);
const documentRepository = new DocumentRepository();
const documentService = new DocumentService(documentRepository);
export const userController = new UserController(
  userService,
  postService,
  commentService);
export const postController = new PostController(
  postService,
  commentService);
export const commentController = new CommentController(
  commentService);
export const documentController = new DocumentController(
  documentService);
export const authService = new AuthService(
  userRepository,
  passwordHasher,
  tokenService,
);
export const authController = new AuthController(authService);
