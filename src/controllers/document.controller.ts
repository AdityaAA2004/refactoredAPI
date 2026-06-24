import { Request, Response, NextFunction } from 'express';
import { IDocumentService } from '../contracts/document.service.contract.js';
import { validateDocumentCreate, validateDocumentUpdate } from '../validators/document.validator.js';
import { parseListQuery, buildPaginatedResponse } from '../lib/pagination.js';
import { AppError } from '../lib/errors.js';

export class DocumentController {
  constructor(
    private readonly service: IDocumentService  ) {}

  private readonly ALLOWED_FILTER_FIELDS = ['title', 'content'] as const;
  private readonly ALLOWED_SORT_FIELDS = ['id', 'title', 'content'] as const;

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
      const id = this._parseStringId(req.params.id);
      const record = await this.service.getById(id);
      res.json(record);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDocumentCreate(req.body);
      const record = await this.service.create(data, req.user?.id);
      res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = this._parseStringId(req.params.id);
      const data = validateDocumentUpdate(req.body);
      const record = await this.service.update(id, data, req.user?.id);
      res.json(record);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = this._parseStringId(req.params.id);
      await this.service.remove(id, req.user?.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  private _parseStringId(raw: string): string {
    if (!raw || raw.trim() !== raw || raw.length > 128) {
      throw new AppError(400, 'Invalid ID format');
    }
    // UUID v4 format validation
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw)) {
      throw new AppError(400, 'Invalid ID format');
    }
    return raw;
  }
}
