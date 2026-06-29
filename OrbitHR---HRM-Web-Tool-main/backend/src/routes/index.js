import { Router } from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/auth.controller.js';
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeByUserId,
  getEmployeeStats,
  getMyTeam,
} from '../controllers/employee.controller.js';
import {
  markAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  getEmployeeAttendanceSummary,
  getOrganizationAttendanceSummary,
  getTodayAttendance,
  getTeamAttendance,
  getMyTodayAttendance,
  checkInAttendance,
  checkOutAttendance,
} from '../controllers/attendance.controller.js';
import {
  requestLeave,
  getLeaves,
  getLeaveById,
  reviewLeave,
  deleteLeave,
  getTeamLeaves,
} from '../controllers/leave.controller.js';
import {
  createSkill,
  getSkills,
  updateSkill,
  deleteSkill,
  assignSkillToEmployee,
  updateEmployeeSkill,
  getEmployeeSkills,
  getMySkills,
  deleteEmployeeSkill,
  getSkillSuggestions,
} from '../controllers/skill.controller.js';
import {
  getAdminDashboardSummary,
  getEmployeeDashboardSummary,
} from '../controllers/dashboard.controller.js';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcement.controller.js';
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../controllers/notification.controller.js';
import {
  getAdminAnalytics,
  getManagerAnalytics,
  getTeamOverviewAnalytics,
  getTaskPerformanceAnalytics,
  getAttendanceTrendAnalytics,
  getPerformanceRankingAnalytics,
  getWorkloadAnalytics,
} from '../controllers/analytics.controller.js';
import { getEmployeeActivityTimeline } from '../controllers/activity.controller.js';
import {
  deleteDocument,
  downloadDocument,
  getEmployeeDocuments,
  uploadDocument,
} from '../controllers/document.controller.js';
import { globalSearch } from '../controllers/search.controller.js';
import { getMyPayslip, getTeamPayslips } from '../controllers/payroll.controller.js';
import {
  createTask,
  getTasks,
  getManagerTasks,
  getEmployeeTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/task.controller.js';
import {
  createJoinRequest,
  getAllTeams,
  getEmployeeTeamInfo,
  getManagerJoinRequests,
  getMyManagedTeam,
  getPredefinedTeams,
  reviewJoinRequest,
} from '../controllers/team.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { documentUpload } from '../middlewares/upload.middleware.js';

const router = Router();

// ─── Health check ────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'OrbitHR API is running',
    data: { uptime: process.uptime(), timestamp: new Date().toISOString() },
  });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getCurrentUser);
router.post('/auth/logout', protect, logout);
router.get('/teams/options', getPredefinedTeams);

// Team routes
router.get('/teams', protect, authorize('admin'), getAllTeams);
router.get('/team/my-team', protect, authorize('manager'), getMyManagedTeam);
router.get('/employee/team', protect, authorize('employee'), getEmployeeTeamInfo);
router.post('/join-request', protect, authorize('employee'), createJoinRequest);
router.get('/join-requests', protect, authorize('manager'), getManagerJoinRequests);
router.patch('/join-request/:id', protect, authorize('admin', 'manager'), reviewJoinRequest);

// ─── Employee routes ──────────────────────────────────────────────────────────
// IMPORTANT: static sub-paths MUST come before /:id to avoid route shadowing
router.get('/employees/my-team',      protect, authorize('manager'), getMyTeam);
router.get('/employees/stats',        protect, authorize('admin'), getEmployeeStats);
router.get('/employees/user/:userId', protect, getEmployeeByUserId);
router.post('/employees',             protect, authorize('admin'), createEmployee);
router.get('/employees',              protect, authorize('admin', 'manager'), getAllEmployees);
router.get('/employees/:id',          protect, authorize('admin', 'manager'), getEmployeeById);
router.put('/employees/:id',          protect, authorize('admin'), updateEmployee);
router.delete('/employees/:id',       protect, authorize('admin'), deleteEmployee);

// ─── Attendance routes ────────────────────────────────────────────────────────
// Static sub-paths before /:id
router.get('/attendance/team',                    protect, authorize('manager'), getTeamAttendance);
router.get('/attendance/my-today',                protect, authorize('employee'), getMyTodayAttendance);
router.get('/attendance/today',                   protect, authorize('admin'), getTodayAttendance);
router.get('/attendance/summary/employee',        protect, getEmployeeAttendanceSummary);
router.get('/attendance/summary/organization',    protect, authorize('admin'), getOrganizationAttendanceSummary);
router.post('/attendance/check-in',               protect, authorize('employee'), checkInAttendance);
router.post('/attendance/check-out',              protect, authorize('employee'), checkOutAttendance);
router.post('/attendance',                        protect, authorize('admin'), markAttendance);
router.get('/attendance',                         protect, getAttendance);
router.get('/attendance/:id',                     protect, getAttendanceById);
router.put('/attendance/:id',                     protect, authorize('admin'), updateAttendance);
router.delete('/attendance/:id',                  protect, authorize('admin'), deleteAttendance);

// ─── Leave routes ─────────────────────────────────────────────────────────────
router.get('/leaves/team',          protect, authorize('manager'), getTeamLeaves);
router.post('/leaves',              protect, requestLeave);
router.get('/leaves',               protect, getLeaves);
router.get('/leaves/:id',           protect, getLeaveById);
router.patch('/leaves/:id/status',  protect, authorize('admin', 'manager'), reviewLeave);
router.delete('/leaves/:id',        protect, deleteLeave);

// ─── Task routes ──────────────────────────────────────────────────────────────
router.post('/tasks',               protect, authorize('admin', 'manager'), createTask);
router.get('/tasks',                protect, getTasks);
router.get('/tasks/manager',        protect, authorize('manager'), getManagerTasks);
router.get('/tasks/employee',       protect, getEmployeeTasks);
router.put('/tasks/:id',            protect, updateTask);
router.patch('/tasks/:id/status',   protect, updateTaskStatus);
router.delete('/tasks/:id',         protect, authorize('admin', 'manager'), deleteTask);

// ─── Skill routes ─────────────────────────────────────────────────────────────
// Static sub-paths before /:id
router.get('/skills/my',                protect, getMySkills);
router.get('/skills/suggestions',       protect, getSkillSuggestions);
router.post('/skills/assign',           protect, authorize('admin', 'employee'), assignSkillToEmployee);
router.get('/skills/employee/:employeeId', protect, getEmployeeSkills);
router.put('/skills/assign/:id',        protect, authorize('admin', 'employee'), updateEmployeeSkill);
router.delete('/skills/assign/:id',     protect, authorize('admin', 'employee'), deleteEmployeeSkill);
router.post('/skills',                  protect, authorize('admin'), createSkill);
router.get('/skills',                   protect, getSkills);
router.put('/skills/:id',               protect, authorize('admin'), updateSkill);
router.delete('/skills/:id',            protect, authorize('admin'), deleteSkill);

// ─── Dashboard routes ─────────────────────────────────────────────────────────
router.get('/dashboard/admin-summary',    protect, authorize('admin'), getAdminDashboardSummary);
router.get('/dashboard/employee-summary', protect, getEmployeeDashboardSummary);
router.get('/analytics/admin',            protect, authorize('admin'), getAdminAnalytics);
router.get('/analytics/manager',          protect, authorize('manager'), getManagerAnalytics);
router.get('/analytics/team-overview',    protect, authorize('manager'), getTeamOverviewAnalytics);
router.get('/analytics/task-performance', protect, authorize('manager'), getTaskPerformanceAnalytics);
router.get('/analytics/attendance-trends',protect, authorize('manager'), getAttendanceTrendAnalytics);
router.get('/analytics/performance-ranking', protect, authorize('manager'), getPerformanceRankingAnalytics);
router.get('/analytics/workload',         protect, authorize('manager'), getWorkloadAnalytics);

router.get('/activity/:employeeId', protect, getEmployeeActivityTimeline);

// Search routes
router.get('/search/global', protect, globalSearch);

// ─── Announcement routes ──────────────────────────────────────────────────────
router.get('/announcements',       protect, getAnnouncements);
router.post('/announcements',      protect, authorize('admin'), createAnnouncement);
router.put('/announcements/:id',   protect, authorize('admin'), updateAnnouncement);
router.delete('/announcements/:id',protect, authorize('admin'), deleteAnnouncement);

// Notification routes
router.get('/notifications', protect, getMyNotifications);
router.patch('/notifications/read-all', protect, markAllNotificationsRead);
router.patch('/notifications/:id/read', protect, markNotificationRead);

// Document routes
router.post('/documents/upload', protect, documentUpload.single('file'), uploadDocument);
router.get('/documents/employee/:employeeId', protect, getEmployeeDocuments);
router.get('/documents/:id/download', protect, downloadDocument);
router.delete('/documents/:id', protect, deleteDocument);

// ─── Payroll routes ───────────────────────────────────────────────────────────
router.get('/payroll/my-slip', protect, getMyPayslip);
router.get('/payroll/team', protect, authorize('admin', 'manager'), getTeamPayslips);

export default router;
