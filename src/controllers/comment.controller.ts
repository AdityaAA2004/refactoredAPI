import { Request, Response, NextFunction } from 'express';
import { ICommentService } from '../contracts/comment.service.contract.js';
import { validateCommentCreate, validateCommentUpdate } from '../validators/comment.validator.js';
import { parseListQuery, buildPaginatedResponse } from '../lib/pagination.js';
import { AppError } from '../lib/errors.js';

export class CommentController {
  constructor(
    private readonly service: ICommentService  ) {}

  private readonly ALLOWED_FILTER_FIELDS = ['body', 'authorId', 'postId'] as const;
  private readonly ALLOWED_SORT_FIELDS = ['id', 'body', 'authorId', 'postId'] as const;

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
      const data = validateCommentCreate(req.body);
      const record = await this.service.create(data, req.user?.id);
      res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = this._parseId(req.params.id);
      const data = validateCommentUpdate(req.body);
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
