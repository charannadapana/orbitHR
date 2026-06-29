import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  Clock3,
  CircleUserRound,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Sparkles,
  SunMedium,
  Users2,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { notificationService } from '../../api/notificationService';
import { searchService } from '../../api/searchService';
import { cn, Pill } from '../ui/saas';

const navMap = {
  admin: [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/employees', label: 'Employees', icon: Users2 },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/attendance', label: 'Attendance', icon: CalendarDays },
    { to: '/admin/leaves', label: 'Leaves', icon: ClipboardList },
    { to: '/admin/skills', label: 'Skills', icon: Sparkles },
  ],
  manager: [
    { to: '/manager/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/manager/team', label: 'Team', icon: Users2 },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/manager/attendance', label: 'Attendance', icon: CalendarDays },
    { to: '/manager/leaves', label: 'Leaves', icon: ClipboardList },
    { to: '/manager/skills', label: 'Skills', icon: Sparkles },
    { to: '/manager/tasks', label: 'Tasks', icon: BriefcaseBusiness },
    { to: '/manager/payroll', label: 'Payroll', icon: CreditCard },
  ],
  employee: [
    { to: '/employee/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/employee/team', label: 'Team', icon: Users2 },
    { to: '/employee/attendance', label: 'Attendance', icon: CalendarDays },
    { to: '/employee/leaves', label: 'Leaves', icon: ClipboardList },
    { to: '/employee/skills', label: 'Skills', icon: Sparkles },
    { to: '/employee/tasks', label: 'Tasks', icon: BriefcaseBusiness },
    { to: '/employee/timeline', label: 'Timeline', icon: Clock3 },
    { to: '/employee/documents', label: 'Documents', icon: FileText },
    { to: '/employee/payroll', label: 'Payroll', icon: CreditCard },
  ],
};

const notificationTone = {
  task: 'blue',
  leave: 'amber',
  attendance: 'green',
  announcement: 'dark',
  payroll: 'green',
  system: 'dark',
};

const AppTopNav = ({ userRole = 'employee' }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [openMobile, setOpenMobile] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ employees: [], tasks: [], departments: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navItems = useMemo(() => navMap[userRole] || navMap.employee, [userRole]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const result = await notificationService.getMyNotifications({ limit: 8 });
        if (result.success) {
          setNotifications(result.data || []);
          setUnreadCount(result.meta?.unreadCount || 0);
        }
      } catch (error) {
        setNotifications([]);
      }
    };

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(interval);
  }, [location.pathname]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ employees: [], tasks: [], departments: [] });
      setSearchLoading(false);
      return undefined;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setSearchLoading(true);
        const result = await searchService.globalSearch(searchQuery);
        if (result.success) {
          setSearchResults(result.data);
        }
      } catch (error) {
        setSearchResults({ employees: [], tasks: [], departments: [] });
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((notification) => ({ ...notification, readAt: notification.readAt || new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      // quiet failure for header utility action
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.readAt) {
        await notificationService.markAsRead(notification._id);
        setNotifications((prev) => prev.map((item) => (item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      // quiet failure
    }

    const taskTarget = userRole === 'manager' ? '/manager/tasks' : '/employee/tasks';
    const target =
      notification.type === 'leave'
        ? userRole === 'admin'
          ? '/admin/leaves'
          : userRole === 'manager'
            ? '/manager/leaves'
            : '/employee/leaves'
        : notification.type === 'task'
          ? taskTarget
          : notification.type === 'payroll'
            ? userRole === 'manager'
              ? '/manager/payroll'
              : userRole === 'employee'
                ? '/employee/payroll'
                : '/admin/dashboard'
          : userRole === 'admin'
            ? '/admin/dashboard'
            : userRole === 'manager'
              ? '/manager/dashboard'
              : '/employee/dashboard';

    setOpenNotif(false);
    navigate(target);
  };

  const handleSearchNavigation = (target) => {
    setSearchQuery('');
    setSearchResults({ employees: [], tasks: [], departments: [] });
    navigate(target);
    setOpenMobile(false);
  };

  const SidebarContent = (
    <>
      <div className="flex items-center gap-3">
        <div className="glass-panel flex h-12 w-12 items-center justify-center rounded-2xl">
          <img src="/orbithr.png" alt="OrbitHR" className="h-8 w-8 object-contain" />
        </div>
        <div>
          <p className="text-lg font-extrabold tracking-tight text-[var(--text-strong)]">OrbitHR</p>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">People OS</p>
        </div>
      </div>

      <div className="glass-panel mt-6 rounded-[24px] px-4 py-3">
        <div className="flex items-center gap-3">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search employees, tasks, departments"
            className="w-full bg-transparent text-sm text-[var(--text-strong)] outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>
        {searchQuery.trim() ? (
          <div className="mt-4 space-y-3 border-t border-white/8 pt-4">
            {searchLoading ? (
              <p className="text-xs text-[var(--text-muted)]">Searching...</p>
            ) : (
              <>
                {searchResults.employees.slice(0, 3).map((employee) => (
                  <button
                    key={employee._id}
                    onClick={() => handleSearchNavigation(userRole === 'admin' ? `/admin/employees/${employee._id}` : '/manager/team')}
                    className="flex w-full items-center justify-between rounded-[18px] bg-white/5 px-3 py-2 text-left text-sm text-[var(--text-body)]"
                  >
                    <span>{employee.userId?.firstName} {employee.userId?.lastName}</span>
                    <span className="text-xs text-[var(--text-muted)]">{employee.department}</span>
                  </button>
                ))}
                {searchResults.tasks.slice(0, 2).map((task) => (
                  <button
                    key={task._id}
                    onClick={() => handleSearchNavigation(userRole === 'manager' ? '/manager/tasks' : '/employee/tasks')}
                    className="flex w-full items-center justify-between rounded-[18px] bg-white/5 px-3 py-2 text-left text-sm text-[var(--text-body)]"
                  >
                    <span>{task.title}</span>
                    <span className="text-xs text-[var(--text-muted)]">{task.status}</span>
                  </button>
                ))}
                {searchResults.departments.slice(0, 2).map((department) => (
                  <button
                    key={department.name}
                    onClick={() => handleSearchNavigation(userRole === 'admin' ? '/admin/departments' : userRole === 'manager' ? '/manager/team' : '/employee/dashboard')}
                    className="flex w-full items-center justify-between rounded-[18px] bg-white/5 px-3 py-2 text-left text-sm text-[var(--text-body)]"
                  >
                    <span>{department.name}</span>
                    <span className="text-xs text-[var(--text-muted)]">{department.count}</span>
                  </button>
                ))}
                {!searchResults.employees.length && !searchResults.tasks.length && !searchResults.departments.length ? (
                  <p className="text-xs text-[var(--text-muted)]">No matching results found.</p>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpenMobile(false)}
              className={cn(
                'group flex items-center justify-between rounded-[22px] px-4 py-3 transition-all',
                active ? 'glass-panel-strong text-[var(--text-strong)]' : 'text-[var(--text-body)] hover:bg-white/6',
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn('rounded-2xl p-2 transition-colors', active ? 'bg-white/10' : 'bg-white/5 group-hover:bg-white/10')}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
              <ChevronRight className={cn('h-4 w-4 transition-transform', active ? 'translate-x-0 text-[var(--accent)]' : 'translate-x-[-4px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100')} />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="glass-panel rounded-[26px] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Theme</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-strong)]">{theme === 'dark' ? 'Midnight glass' : 'Soft daylight'}</p>
            </div>
            <button onClick={toggleTheme} className="rounded-2xl bg-white/8 p-3 text-[var(--text-strong)] transition hover:scale-105">
              {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-[26px] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(77,216,255,.24),rgba(50,255,157,.24))] text-sm font-bold text-[var(--text-strong)]">
              {(user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text-strong)]">{user?.firstName || 'Workspace user'} {user?.lastName || ''}</p>
              <p className="truncate text-xs text-[var(--text-muted)]">{user?.email || 'No email available'}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Pill tone="blue">{userRole}</Pill>
            <button
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/6 px-3 py-2 text-xs font-semibold text-[var(--text-body)] transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[300px] px-4 py-5 lg:block">
        <div className="glass-panel-strong flex h-full flex-col rounded-[34px] p-5">{SidebarContent}</div>
      </aside>

      <div className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 lg:hidden">
        <div className="glass-panel-strong flex items-center justify-between rounded-[26px] px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/orbithr.png" alt="OrbitHR" className="h-9 w-9" />
            <div>
              <p className="text-sm font-bold text-[var(--text-strong)]">OrbitHR</p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{userRole}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setOpenNotif((v) => !v)} className="relative rounded-2xl bg-white/8 p-2.5 text-[var(--text-strong)]">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--accent)]" /> : null}
            </button>
            <button onClick={() => setOpenMobile(true)} className="rounded-2xl bg-white/8 p-2.5 text-[var(--text-strong)]">
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="fixed right-4 top-4 z-50 hidden items-center gap-2 lg:flex">
        <button onClick={() => setOpenNotif((v) => !v)} className="relative glass-panel rounded-2xl p-3 text-[var(--text-strong)]">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[var(--accent)]" /> : null}
        </button>
        <button onClick={() => setOpenMenu((v) => !v)} className="glass-panel rounded-2xl p-3 text-[var(--text-strong)]">
          <CircleUserRound className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence>
        {openNotif ? (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed right-4 top-20 z-[60] w-[340px]">
            <div className="glass-panel-strong rounded-[28px] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[var(--text-strong)]">Notifications</p>
                  <p className="text-xs text-[var(--text-muted)]">Live workflow signals from tasks and leave.</p>
                </div>
                <button onClick={handleMarkAllRead} className="text-xs font-semibold text-[var(--accent-2)]">Mark all read</button>
              </div>
              <div className="space-y-3">
                {notifications.length ? notifications.map((item) => (
                  <button key={item._id} onClick={() => handleNotificationClick(item)} className="w-full rounded-[22px] border border-white/10 bg-white/6 p-4 text-left">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--text-strong)]">{item.title}</p>
                      <Pill tone={notificationTone[item.type] || 'dark'}>{item.type}</Pill>
                    </div>
                    <p className="text-xs leading-5 text-[var(--text-body)]">{item.message}</p>
                    <p className="mt-2 text-[11px] text-[var(--text-muted)]">{new Date(item.createdAt).toLocaleString()}</p>
                  </button>
                )) : (
                  <p className="text-sm text-[var(--text-body)]">No notifications yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {openMenu ? (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed right-4 top-20 z-[60] hidden w-[300px] lg:block">
            <div className="glass-panel-strong rounded-[28px] p-5">
              <p className="text-sm font-bold text-[var(--text-strong)]">{user?.firstName || 'Workspace user'} {user?.lastName || ''}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{user?.email}</p>
              <div className="mt-4 flex items-center justify-between">
                <Pill tone="green">{userRole}</Pill>
                <button onClick={toggleTheme} className="rounded-2xl bg-white/8 p-2.5 text-[var(--text-strong)]">
                  {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white/8 px-4 py-3 text-sm font-semibold text-[var(--text-strong)]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {openMobile ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setOpenMobile(false)} />
            <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} className="absolute inset-y-0 left-0 w-[88vw] max-w-[340px] p-4">
              <div className="glass-panel-strong flex h-full flex-col rounded-[34px] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-[var(--text-strong)]">Navigation</span>
                  <button onClick={() => setOpenMobile(false)} className="rounded-2xl bg-white/8 p-2.5 text-[var(--text-strong)]">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {SidebarContent}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default AppTopNav;
