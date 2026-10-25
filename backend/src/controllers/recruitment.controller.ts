import { Response, NextFunction } from 'express';
import { RecruitmentService } from '../services/recruitment.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class RecruitmentController {
  static async getJobs(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await RecruitmentService.getJobs();
      return sendSuccess(res, 'Lấy danh sách tin tuyển dụng thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async createJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await RecruitmentService.createJob(req.body);
      return sendSuccess(res, 'Tạo tin tuyển dụng thành công', result, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getCandidates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const jobPostingId = req.query.jobPostingId as string;
      const result = await RecruitmentService.getCandidates(jobPostingId);
      return sendSuccess(res, 'Lấy danh sách ứng viên thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async createCandidate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await RecruitmentService.createCandidate(req.body);
      return sendSuccess(res, 'Thêm hồ sơ ứng viên thành công', result, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCandidateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, notes } = req.body;
      const result = await RecruitmentService.updateCandidateStatus(req.params.id, status, notes);
      return sendSuccess(res, 'Cập nhật trạng thái ứng viên thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async convertToEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await RecruitmentService.convertToEmployee(req.params.id, req.user?.userId);
      return sendSuccess(res, 'Đã chuyển ứng viên thành công sang hồ sơ nhân viên chính thức', result);
    } catch (error) {
      next(error);
    }
  }
}
