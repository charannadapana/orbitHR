import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import BorderGlow from '../components/ui/BorderGlow';
import Input from '../components/ui/Input';
import GlassSelect from '../components/ui/GlassSelect';
import { employeeService } from '../api/employeeService';
import { authService } from '../api/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Briefcase, MapPin, AlertCircle, CheckCircle, Save } from 'lucide-react';

const DEPARTMENTS = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Design',      label: 'Design'      },
  { value: 'Marketing',   label: 'Marketing'   },
  { value: 'HR',          label: 'HR'           },
  { value: 'Finance',     label: 'Finance'      },
  { value: 'Legal',       label: 'Legal'        },
  { value: 'Management',  label: 'Management'   },
  { value: 'Sales',       label: 'Sales'        },
];

const EMP_TYPES = [
  { value: 'full-time',   label: 'Full Time'   },
  { value: 'part-time',   label: 'Part Time'   },
  { value: 'contract',    label: 'Contract'    },
  { value: 'internship',  label: 'Internship'  },
];

const SectionHeader = ({ Icon, title, accent = 'cyan' }) => {
  const clr = {
    cyan:   { bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20',   icon: 'text-cyan-400'   },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: 'text-violet-400' },
    amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  icon: 'text-amber-400'  },
  }[accent] || clr.cyan;
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-2 rounded-lg ${clr.bg} border ${clr.border}`}>
        <Icon className={`w-4 h-4 ${clr.icon}`} />
      </div>
      <h3 className="text-xs font-black text-white uppercase tracking-widest">{title}</h3>
    </div>
  );
};

const EmployeeFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', password: '', userId: '',
    designation: '', department: '', email: '', phoneNumber: '',
    dateOfJoining: '', dateOfBirth: '', address: '', city: '',
    state: '', zipCode: '', employmentType: 'full-time', salary: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => { if (isEdit) fetchEmployee(); }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const result = await employeeService.getEmployee(id);
      if (result.success) {
        const emp = result.data;
        setFormData({
          firstName: emp.userId?.firstName || '', lastName: emp.userId?.lastName || '',
          password: '', userId: emp.userId?._id || '',
          designation: emp.designation || '', department: emp.department || '',
          email: emp.email || '', phoneNumber: emp.phoneNumber || '',
          dateOfJoining: emp.dateOfJoining?.split('T')[0] || '',
          dateOfBirth: emp.dateOfBirth?.split('T')[0] || '',
          address: emp.address || '', city: emp.city || '',
          state: emp.state || '', zipCode: emp.zipCode || '',
          employmentType: emp.employmentType || 'full-time',
          salary: emp.salary || '',
        });
      }
    } catch (err) { setServerError('Failed to load employee'); }
    finally { setLoading(false); }
  };

  const handle = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const set = (field, value) => {
    setFormData(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.designation) e.designation = 'Required';
    if (!formData.department) e.department = 'Required';
    if (!formData.email) e.email = 'Required';
    if (!formData.dateOfJoining) e.dateOfJoining = 'Required';
    if (!isEdit && !formData.firstName) e.firstName = 'Required';
    if (!isEdit && !formData.lastName) e.lastName = 'Required';
    if (!isEdit && !formData.password) e.password = 'Required';
    if (!isEdit && formData.password && formData.password.length < 6) e.password = 'Min 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    try {
      setLoading(true);
      setServerError('');
      let result;

      if (isEdit) {
        result = await employeeService.updateEmployee(id, {
          designation: formData.designation, department: formData.department,
          email: formData.email, phoneNumber: formData.phoneNumber,
          dateOfJoining: formData.dateOfJoining, dateOfBirth: formData.dateOfBirth,
          address: formData.address, city: formData.city,
          state: formData.state, zipCode: formData.zipCode,
          employmentType: formData.employmentType, salary: formData.salary,
        });
      } else {
        const registerResult = await authService.register({
          email: formData.email, firstName: formData.firstName,
          lastName: formData.lastName, password: formData.password, role: 'employee',
        });
        if (!registerResult.success) {
          setServerError(registerResult.message || 'Failed to create user account');
          setLoading(false); return;
        }
        result = await employeeService.createEmployee({
          userId: registerResult.data.user._id,
          designation: formData.designation, department: formData.department,
          email: formData.email, phoneNumber: formData.phoneNumber,
          dateOfJoining: formData.dateOfJoining, dateOfBirth: formData.dateOfBirth,
          address: formData.address, city: formData.city,
          state: formData.state, zipCode: formData.zipCode,
          employmentType: formData.employmentType, salary: formData.salary,
        });
      }

      if (result.success) {
        if (isEdit) {
          setSuccessMsg('Employee updated successfully!');
          setTimeout(() => navigate('/admin/employees'), 1200);
        } else {
          navigate('/admin/employees');
        }
      } else {
        setServerError(result.message || 'Failed to save employee');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Error saving employee');
    } finally { setLoading(false); }
  };

  if (loading && isEdit) {
    return (
      <AppShell userRole="admin">
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell userRole="admin">
      <button onClick={() => navigate('/admin/employees')}
        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> All Employees
      </button>

      <PageHeader
        title={isEdit ? 'Edit Employee' : 'Add Employee'}
        subtitle={isEdit ? 'Update employee information' : 'Create a new employee record'}
      />

      {/* Alerts */}
      <AnimatePresence>
        {serverError && (
          <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />{serverError}
          </motion.div>
        )}
        {successMsg && (
          <motion.div key="ok" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-400">
            <CheckCircle className="w-4 h-4 shrink-0" />{successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identity — only shown for new employees */}
        {!isEdit && (
          <BorderGlow borderRadius={28}>
            <div className="p-6">
              <SectionHeader Icon={User} title="Account Identity" accent="cyan" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="First Name" name="firstName" value={formData.firstName} onChange={handle} error={errors.firstName} placeholder="John" required />
                <Input label="Last Name"  name="lastName"  value={formData.lastName}  onChange={handle} error={errors.lastName}  placeholder="Doe"  required />
                <Input label="Email"      type="email" name="email" value={formData.email} onChange={handle} error={errors.email} placeholder="john@company.com" required />
                <Input label="Initial Password" type="password" name="password" value={formData.password} onChange={handle} error={errors.password} placeholder="Min 6 characters" required />
              </div>
            </div>
          </BorderGlow>
        )}

        {/* Employment Details */}
        <BorderGlow borderRadius={28}>
          <div className="p-6">
            <SectionHeader Icon={Briefcase} title="Employment Details" accent="violet" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Designation" name="designation" value={formData.designation} onChange={handle} error={errors.designation} placeholder="e.g. Senior Developer" required />
              <GlassSelect label="Department" value={formData.department} onChange={v => set('department', v)}
                options={DEPARTMENTS.map(d => ({ value: d, label: d }))} 
                placeholder="Select Department" error={errors.department} required />
              {isEdit && (
                <Input label="Email" type="email" name="email" value={formData.email} onChange={handle} error={errors.email} placeholder="employee@company.com" required />
              )}
              <GlassSelect label="Employment Type" value={formData.employmentType} onChange={v => set('employmentType', v)} options={EMP_TYPES} />
              <Input label="Date of Joining" type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handle} error={errors.dateOfJoining} required />
              <Input label="Annual Salary" type="number" name="salary" value={formData.salary} onChange={handle} placeholder="e.g. 120000" />
            </div>
          </div>
        </BorderGlow>

        {/* Contact & Personal */}
        <BorderGlow borderRadius={28}>
          <div className="p-6">
            <SectionHeader Icon={MapPin} title="Contact & Personal" accent="amber" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Phone Number" type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handle} placeholder="+1 234 567 8901" />
              <Input label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handle} />
              <Input label="Street Address" name="address" value={formData.address} onChange={handle} placeholder="123 Main Street" />
              <Input label="City"     name="city"    value={formData.city}    onChange={handle} placeholder="San Francisco" />
              <Input label="State"    name="state"   value={formData.state}   onChange={handle} placeholder="California" />
              <Input label="Zip Code" name="zipCode" value={formData.zipCode} onChange={handle} placeholder="94105" />
            </div>
          </div>
        </BorderGlow>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-cyan-400 text-black text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="w-4 h-4" />
            {loading ? 'Saving…' : isEdit ? 'Update Employee' : 'Create Employee'}
          </motion.button>
          <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin/employees')}
            className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
            Cancel
          </motion.button>
        </div>
      </form>
    </AppShell>
  );
};

export default EmployeeFormPage;
