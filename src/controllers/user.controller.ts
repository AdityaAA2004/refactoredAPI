import { Request, Response, NextFunction } from 'express';
import { IUserService } from '../contracts/user.service.contract.js';
import { validateUserCreate, validateUserUpdate } from '../validators/user.validator.js';
import { parseListQuery, buildPaginatedResponse } from '../lib/pagination.js';
import { AppError } from '../lib/errors.js';
import { IPostService } from '../contracts/post.service.contract.js';
import { validatePostCreate } from '../validators/post.validator.js';
import { ICommentService } from '../contracts/comment.service.contract.js';
import { validateCommentCreate, validateCommentCreateNested } from '../validators/comment.validator.js';

export class UserController {
  constructor(
    private readonly service: IUserService,    private readonly postService: IPostService,    private readonly commentService: ICommentService  ) {}

  private readonly ALLOWED_FILTER_FIELDS = ['email', 'name', 'bio'] as const;
  private readonly ALLOWED_SORT_FIELDS = ['id', 'email', 'name', 'bio'] as const;

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = parseListQuery(req, this.ALLOWED_FILTER_FIELDS, this.ALLOWED_SORT_FIELDS);
      const { data, total } = await this.service.list(params);
      res.json(buildPaginatedResponse(data, total, params));
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = this._parseId(req.params.id);
      const record = await this.service.getById(id);
      res.json(record);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateUserCreate(req.body);
      const record = await this.service.create(data, req.user?.id);
      res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = this._parseId(req.params.id);
      const data = validateUserUpdate(req.body);
      const record = await this.service.update(id, data, req.user?.id);
      res.json(record);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = this._parseId(req.params.id);
      await this.service.remove(id, req.user?.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  // --- Nested: Post under User ---

  async getPostsForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = this._parseId(req.params.id);
      const nestedFilterFields = ['title', 'content', 'published', 'authorId'] as const;
      const nestedSortFields = ['id', 'title', 'content', 'published', 'authorId'] as const;
      const params = parseListQuery(req, nestedFilterFields, nestedSortFields);
      const { data, total } = await this.postService.listByAuthorId(parentId, params);
      res.json(buildPaginatedResponse(data, total, params));
    } catch (err) {
      next(err);
    }
  }

  async createPostForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Parent ID comes from the authenticated user's token, not the URL
      const parentId = req.user!.id;
      const data = validatePostCreate(req.body);
      const record = await this.postService.createForUser(parentId, data, req.user?.id);
      res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  }


  // --- Nested: Comment under User ---

  async getCommentsForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = this._parseId(req.params.id);
      const nestedFilterFields = ['body', 'authorId', 'postId'] as const;
      const nestedSortFields = ['id', 'body', 'authorId', 'postId'] as const;
      const params = parseListQuery(req, nestedFilterFields, nestedSortFields);
      const { data, total } = await this.commentService.listByAuthorId(parentId, params);
      res.json(buildPaginatedResponse(data, total, params));
    } catch (err) {
      next(err);
    }
  }


  private _parseId(raw: string): number {
    if (!/^\d+$/.test(raw)) {
      throw new AppError(400, 'Invalid ID format');
    }
    const id = Number(raw);
    if (id > Number.MAX_SAFE_INTEGER) {
      throw new AppError(400, 'ID out of range');
    }
    return id;
  }
}
