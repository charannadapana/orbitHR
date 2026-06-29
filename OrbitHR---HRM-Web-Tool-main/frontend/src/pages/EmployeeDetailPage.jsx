import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import BorderGlow from '../components/ui/BorderGlow';
import GlassSelect from '../components/ui/GlassSelect';
import { employeeService } from '../api/employeeService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, MapPin, PhoneCall, Mail, Calendar,
  DollarSign, Pencil, Trash2, Clock, ArrowLeft,
  ClipboardCheck, CalendarOff, Award, AlertCircle, UserPlus, Users
} from 'lucide-react';

const STATUS_MAP = {
  active:     { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  inactive:   { bg: 'bg-red-500/10',     border: 'border-red-500/20',     text: 'text-red-400',     dot: 'bg-red-400'     },
  'on-leave': { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   dot: 'bg-amber-400'   },
};

const InfoRow = ({ Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-white/4 last:border-0">
    <div className="p-1.5 rounded-lg bg-white/5 mt-0.5 shrink-0">
      <Icon className="w-3.5 h-3.5 text-slate-500" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-0.5">{label}</p>
      <p className="text-sm text-slate-900 dark:text-white font-medium truncate">{value || <span className="text-slate-600 italic">Not provided</span>}</p>
    </div>
  </div>
);

const QuickAction = ({ Icon, label, color, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${color}`}
  >
    <Icon className="w-4 h-4 shrink-0" />{label}
  </motion.button>
);

const avatarColors = ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#fb923c', '#f472b6'];

const EmployeeDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [managedTeam, setManagedTeam] = useState([]);
  const [unassignedEmployees, setUnassignedEmployees] = useState([]);
  const [selectedUnassigned, setSelectedUnassigned] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { 
    fetchEmployee(); 
    fetchTeamAndUnassigned();
  }, [id]);

  const fetchTeamAndUnassigned = async () => {
    try {
      const [teamRes, unassignedRes] = await Promise.all([
        employeeService.getAllEmployees({ reportingTo: id, limit: 100 }),
        employeeService.getAllEmployees({ unassigned: 'true', limit: 100 })
      ]);
      if (teamRes.success) setManagedTeam(teamRes.data || []);
      if (unassignedRes.success) setUnassignedEmployees((unassignedRes.data || []).filter(e => String(e._id) !== String(id)));
    } catch (err) { console.error('Error fetching team or unassigned employees', err); }
  };

  const handleAssignEmployee = async () => {
    if (!selectedUnassigned) return;
    try {
      setAssigning(true);
      const res = await employeeService.updateEmployee(selectedUnassigned, { reportingTo: id });
      if (res.success) {
        setSelectedUnassigned('');
        fetchTeamAndUnassigned();
      }
    } catch (err) {
      console.error(err);
      setError('Error assigning employee');
    } finally {
      setAssigning(false);
    }
  };

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const result = await employeeService.getEmployee(id);
      if (result.success) setEmployee(result.data);
      else setError(result.message || 'Failed to fetch employee');
    } catch (err) {
      setError('Error fetching employee');
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this employee? This cannot be undone.')) return;
    try {
      const result = await employeeService.deleteEmployee(id);
      if (result.success) navigate('/admin/employees');
    } catch (err) { setError('Error deleting employee'); }
  };

  if (loading) {
    return (
      <AppShell userRole="admin">
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Loading employee…</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!employee) {
    return (
      <AppShell userRole="admin">
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <AlertCircle className="w-12 h-12 text-slate-700" />
          <p className="text-slate-400 text-sm">Employee not found.</p>
          <button onClick={() => navigate('/admin/employees')}
            className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all">
            Back to Employees
          </button>
        </div>
      </AppShell>
    );
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
  const initials = (employee.userId?.firstName?.[0] || employee.email?.[0] || 'E').toUpperCase();
  const accentColor = avatarColors[id.charCodeAt(id.length - 1) % avatarColors.length];
  const statusCfg = STATUS_MAP[employee.status] || STATUS_MAP.active;
  const fullName = [employee.userId?.firstName, employee.userId?.lastName].filter(Boolean).join(' ') || employee.email;

  return (
    <AppShell userRole="admin">
      {/* Back + Header */}
      <div className="mb-2">
        <button onClick={() => navigate('/admin/employees')}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> All Employees
        </button>
        <PageHeader title={fullName} subtitle={`${employee.designation} · ${employee.department}`}>
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/admin/employees/${id}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </motion.button>
          </div>
        </PageHeader>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Profile hero */}
        <div className="space-y-5">
          {/* Avatar Card */}
          <BorderGlow borderRadius={28}>
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg"
                style={{ background: `${accentColor}20`, color: accentColor, border: `2px solid ${accentColor}30`, boxShadow: `0 0 30px ${accentColor}15` }}>
                {initials}
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white mb-1">{fullName}</h2>
                <p className="text-xs text-slate-500">{employee.designation}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${statusCfg.dot}`} />{employee.status}
              </span>
              {/* Stats row */}
              <div className="w-full grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                {[
                  { label: 'Dept', value: employee.department?.slice(0, 6) || '—' },
                  { label: 'Type', value: employee.employmentType?.slice(0, 4) || '—' },
                  { label: 'Since', value: employee.dateOfJoining ? new Date(employee.dateOfJoining).getFullYear() : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-0.5">{label}</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white capitalize">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </BorderGlow>

          {/* Quick Actions */}
          <BorderGlow borderRadius={24}>
            <div className="p-5 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3">Quick Actions</p>
              <QuickAction Icon={Pencil} label="Edit Details"
                color="text-cyan-400 border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/15"
                onClick={() => navigate(`/admin/employees/${id}/edit`)} />
              <QuickAction Icon={ClipboardCheck} label="View Attendance"
                color="text-violet-400 border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/15"
                onClick={() => navigate(`/admin/attendance?employeeId=${id}`)} />
              <QuickAction Icon={CalendarOff} label="View Leave Requests"
                color="text-amber-400 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15"
                onClick={() => navigate(`/admin/leaves?employeeId=${id}`)} />
              <QuickAction Icon={Award} label="Assign Skills"
                color="text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15"
                onClick={() => navigate(`/admin/skills`)} />
              <QuickAction Icon={Clock} label="Open Timeline"
                color="text-sky-400 border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/15"
                onClick={() => navigate(`/admin/employees/${id}/timeline`)} />
              <QuickAction Icon={UserPlus} label="Open Documents"
                color="text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-500/5 hover:bg-fuchsia-500/15"
                onClick={() => navigate(`/admin/employees/${id}/documents`)} />
            </div>
          </BorderGlow>

          {/* Meta */}
          <BorderGlow borderRadius={24}>
            <div className="p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3">Record Info</p>
              <div className="space-y-3 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Employee ID</span>
                  <span className="text-slate-400 font-mono">{employee._id?.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Created</span>
                  <span className="text-slate-400">{formatDate(employee.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Last Updated</span>
                  <span className="text-slate-400">{formatDate(employee.updatedAt)}</span>
                </div>
              </div>
            </div>
          </BorderGlow>
        </div>

        {/* Right — Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal Info */}
          <BorderGlow borderRadius={28}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <User className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <InfoRow Icon={Mail}     label="Email"         value={employee.email} />
                <InfoRow Icon={PhoneCall} label="Phone"        value={employee.phoneNumber} />
                <InfoRow Icon={Calendar} label="Date of Birth" value={formatDate(employee.dateOfBirth)} />
                <InfoRow Icon={MapPin}   label="Address"       value={[employee.address, employee.city, employee.state, employee.zipCode].filter(Boolean).join(', ')} />
              </div>
            </div>
          </BorderGlow>

          {/* Employment Info */}
          <BorderGlow borderRadius={28}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <Briefcase className="w-4 h-4 text-violet-400" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Employment Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <InfoRow Icon={Briefcase}   label="Designation"      value={employee.designation} />
                <InfoRow Icon={Briefcase}   label="Department"       value={employee.department} />
                <InfoRow Icon={User}        label="Manager"          value={employee.reportingTo ? `${employee.reportingTo.userId?.firstName || ''} ${employee.reportingTo.userId?.lastName || ''}`.trim() || employee.reportingTo.email : 'None'} />
                <InfoRow Icon={Clock}       label="Employment Type"  value={employee.employmentType} />
                <InfoRow Icon={Calendar}    label="Date of Joining"  value={formatDate(employee.dateOfJoining)} />
                <InfoRow Icon={DollarSign}  label="Annual Salary"    value={employee.salary ? `$${employee.salary.toLocaleString()}` : null} />
              </div>
            </div>
          </BorderGlow>

          {/* Managed Team */}
          {employee.designation?.toLowerCase().includes('manager') || employee.designation?.toLowerCase().includes('lead') || employee.designation?.toLowerCase().includes('director') || employee.designation?.toLowerCase().includes('head') || managedTeam.length > 0 ? (
            <BorderGlow borderRadius={28}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Users className="w-4 h-4 text-orange-400" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Managed Team</h3>
                  <span className="ml-auto text-[10px] text-slate-500 font-bold uppercase tracking-widest">{managedTeam.length} Members</span>
                </div>
                
                <div className="space-y-3 mb-6">
                  {managedTeam.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 text-[11px] italic">No employees currently report to this manager.</div>
                  ) : (
                    managedTeam.map(emp => (
                      <div key={emp._id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center text-[10px] font-black border border-orange-500/20">
                            {(emp.userId?.firstName?.[0] || emp.email?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{emp.email}</p>
                            <p className="text-[10px] text-slate-500">{emp.designation}</p>
                          </div>
                        </div>
                        <button onClick={() => navigate(`/admin/employees/${emp._id}`)} className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">View</button>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-5 border-t border-slate-200 dark:border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3">Add to Team</p>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <GlassSelect
                        value={selectedUnassigned}
                        onChange={setSelectedUnassigned}
                        options={unassignedEmployees.map(e => ({ value: e._id, label: `${e.email} — ${e.designation}` }))}
                        placeholder="Select an unassigned employee..."
                        dropdownPosition="top"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleAssignEmployee}
                      disabled={!selectedUnassigned || assigning}
                      className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 h-[46px]"
                    >
                      {assigning ? 'Adding...' : 'Add'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </BorderGlow>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
};

export default EmployeeDetailPage;
