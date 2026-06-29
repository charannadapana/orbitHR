import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, FileText, FolderOpen, Trash2, Upload, ChevronLeft } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import { ActionButton, AppSurface, EmptyState, Pill, SkeletonBlock, SurfaceHeader } from '../components/ui/saas';
import { useAuth } from '../contexts/AuthContext';
import { employeeService } from '../api/employeeService';
import { documentService } from '../api/documentService';

const roleBackLink = {
  admin: '/admin/employees',
  manager: '/manager/team',
  employee: '/employee/dashboard',
};

const roleShell = {
  admin: 'admin',
  manager: 'manager',
  employee: 'employee',
};

const formatBytes = (size = 0) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentsPage = () => {
  const { employeeId: routeEmployeeId } = useParams();
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState(routeEmployeeId || '');
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const resolveEmployeeId = async () => {
      if (routeEmployeeId) {
        setEmployeeId(routeEmployeeId);
        const employeeResult = await employeeService.getEmployee(routeEmployeeId);
        if (employeeResult.success) {
          setEmployee(employeeResult.data);
        }
        return;
      }

      if (!user?._id) return;

      const result = await employeeService.getEmployeeByUserId(user._id);
      if (result.success) {
        setEmployeeId(result.data._id);
        setEmployee(result.data);
      }
    };

    resolveEmployeeId().catch(() => setError('Unable to resolve the employee profile for documents.'));
  }, [routeEmployeeId, user]);

  useEffect(() => {
    if (!employeeId) return;

    const load = async () => {
      try {
        setLoading(true);
        const result = await documentService.getEmployeeDocuments(employeeId);
        if (result.success) {
          setDocuments(result.data || []);
        }
      } catch (err) {
        setError('Documents could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [employeeId]);

  const shellRole = useMemo(() => roleShell[user?.role] || 'employee', [user]);
  const backTarget = useMemo(() => roleBackLink[user?.role] || '/employee/dashboard', [user]);
  const canDelete = user?.role === 'admin' || user?.role === 'employee';
  const canUpload = user?.role === 'admin' || user?.role === 'employee';

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !employeeId) return;

    try {
      setUploading(true);
      setError('');
      const result = await documentService.uploadDocument({ employeeId, file });
      if (result.success) {
        setDocuments((prev) => [result.data, ...prev]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to upload document.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDownload = async (document) => {
    try {
      const response = await documentService.downloadDocument(document._id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.fileName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Unable to download this document.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      const result = await documentService.deleteDocument(id);
      if (result.success) {
        setDocuments((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete this document.');
    }
  };

  return (
    <AppShell userRole={shellRole}>
      <PageHeader
        eyebrow="Documents"
        title="Keep employee files accessible without burying them in admin-only corners."
        subtitle="This local-file document surface supports secure upload, download, and lightweight review flows."
      >
        <Link to={backTarget} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-body)]">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
      </PageHeader>

      {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <AppSurface className="p-6">
        <SurfaceHeader
          title={employee ? `${employee.userId?.firstName || ''} ${employee.userId?.lastName || ''}`.trim() || 'Employee documents' : 'Employee documents'}
          subtitle={employee ? `${employee.designation || 'Profile'} • ${employee.department || 'Documents workspace'}` : 'Upload and review employee files.'}
          extra={<Pill tone="blue">{documents.length} file(s)</Pill>}
        />

        {canUpload ? (
          <label className="mb-5 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#4dd8ff,#32ff9d)] px-5 py-3 text-sm font-bold text-slate-950">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload document'}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
          </label>
        ) : null}

        {loading ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
          </div>
        ) : documents.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No files uploaded yet" description="Once documents are added, this workspace becomes the local record shelf for the employee profile." />
        ) : (
          <div className="space-y-4">
            {documents.map((document) => (
              <div key={document._id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-white/8">
                      <FileText className="h-5 w-5 text-[var(--accent-2)]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-strong)]">{document.fileName}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {document.fileType} • {formatBytes(document.size)} • {new Date(document.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <ActionButton tone="secondary" onClick={() => handleDownload(document)} className="px-4">
                      <Download className="h-4 w-4" />
                    </ActionButton>
                    {canDelete ? (
                      <ActionButton tone="danger" onClick={() => handleDelete(document._id)} className="px-4">
                        <Trash2 className="h-4 w-4" />
                      </ActionButton>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AppSurface>
    </AppShell>
  );
};

export default DocumentsPage;
