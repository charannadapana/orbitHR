import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import Document from '../models/Document.js';
import Employee from '../models/Employee.js';
import { documentUploadRoot } from '../middlewares/upload.middleware.js';
import { sendError, sendResponse } from '../utils/response.js';
import { getManagerVisibleEmployeeIds } from '../utils/managerScope.js';

const allowedExtensions = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx']);

async function resolveScopedEmployee(req, employeeId) {
  const employee = await Employee.findById(employeeId).populate('userId', 'firstName lastName email role');
  if (!employee) {
    return { error: 'Employee not found', status: 404 };
  }

  if (req.user.role === 'admin') {
    return { employee };
  }

  if (req.user.role === 'employee') {
    return employee.userId?._id?.toString() === req.user.id
      ? { employee }
      : { error: 'Not authorized to access this employee documents', status: 403 };
  }

  if (req.user.role === 'manager') {
    const visibleIds = await getManagerVisibleEmployeeIds(req.user.id, ['employee', 'manager']);
    const canAccess = visibleIds.some((id) => id.toString() === employeeId);
    return canAccess
      ? { employee }
      : { error: 'Not authorized to access this employee documents', status: 403 };
  }

  return { error: 'Not authorized', status: 403 };
}

function serializeDocument(document) {
  return {
    _id: document._id,
    employeeId: document.employeeId,
    uploadedBy: document.uploadedBy,
    fileName: document.fileName,
    fileType: document.fileType,
    size: document.size,
    uploadedAt: document.uploadedAt,
  };
}

export const uploadDocument = async (req, res, next) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return sendError(res, 400, 'Employee id is required');
    }

    if (!req.file) {
      return sendError(res, 400, 'Please attach a document file');
    }

    const scoped = await resolveScopedEmployee(req, employeeId);
    if (scoped.error) {
      return sendError(res, scoped.status, scoped.error);
    }

    const ext = path.extname(req.file.originalname || '').toLowerCase();
    if (!allowedExtensions.has(ext)) {
      return sendError(res, 400, 'Unsupported file extension');
    }

    const employeeDir = path.join(documentUploadRoot, employeeId);
    await fs.mkdir(employeeDir, { recursive: true });

    const serverFileName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    const storagePath = path.join(employeeDir, serverFileName);
    await fs.writeFile(storagePath, req.file.buffer);

    const document = await Document.create({
      employeeId,
      uploadedBy: req.user.id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      size: req.file.size,
      storagePath,
    });

    return sendResponse(res, 201, {
      success: true,
      message: 'Document uploaded successfully',
      data: serializeDocument(document),
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeDocuments = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const scoped = await resolveScopedEmployee(req, employeeId);
    if (scoped.error) {
      return sendError(res, scoped.status, scoped.error);
    }

    const documents = await Document.find({ employeeId })
      .sort({ uploadedAt: -1 })
      .select('-storagePath');

    return sendResponse(res, 200, {
      success: true,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return sendError(res, 404, 'Document not found');
    }

    const scoped = await resolveScopedEmployee(req, document.employeeId.toString());
    if (scoped.error) {
      return sendError(res, scoped.status, scoped.error);
    }

    await fs.access(document.storagePath);
    res.download(document.storagePath, document.fileName);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return sendError(res, 404, 'Stored file was not found');
    }
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return sendError(res, 404, 'Document not found');
    }

    const scoped = await resolveScopedEmployee(req, document.employeeId.toString());
    if (scoped.error) {
      return sendError(res, scoped.status, scoped.error);
    }

    if (req.user.role === 'manager') {
      return sendError(res, 403, 'Managers cannot delete employee documents');
    }

    if (req.user.role === 'employee') {
      const employee = scoped.employee;
      if (employee.userId?._id?.toString() !== req.user.id) {
        return sendError(res, 403, 'Not authorized to delete this document');
      }
    }

    await Document.deleteOne({ _id: document._id });
    await fs.rm(document.storagePath, { force: true });

    return sendResponse(res, 200, {
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
