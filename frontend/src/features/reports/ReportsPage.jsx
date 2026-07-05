import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';
import { fetchEmployees } from '../employees/employeeSlice';

const REPORT_TYPES = [
  { value: 'completed', label: 'Completed Tasks' },
  { value: 'pending', label: 'Pending Tasks' },
  { value: 'employee-wise', label: 'Employee-wise Tasks' },
];

const ReportsPage = () => {
  const dispatch = useDispatch();
  const { list: employees } = useSelector((state) => state.employees);
  const [type, setType] = useState('completed');
  const [employeeId, setEmployeeId] = useState('');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    dispatch(fetchEmployees({ limit: 100 }));
  }, [dispatch]);

  const handleDownload = async (format) => {
    if (type === 'employee-wise' && !employeeId) {
      toast.error('Select an employee for the employee-wise report.');
      return;
    }
    setDownloading(format);
    try {
      const response = await axiosClient.get('/reports', {
        params: { type, employeeId: type === 'employee-wise' ? employeeId : undefined, format },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-tasks-report.${format === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded.');
    } catch (err) {
      toast.error('Failed to generate report.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <div className="card" style={{ maxWidth: 520 }}>
        <div className="section-title">Generate a report</div>

        <div className="form-group">
          <label className="form-label">Report Type</label>
          <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
            {REPORT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {type === 'employee-wise' && (
          <div className="form-group">
            <label className="form-label">Employee</label>
            <select className="form-select" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              <option value="">Select employee…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name} — {emp.department}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn btn-primary" disabled={downloading} onClick={() => handleDownload('excel')}>
            {downloading === 'excel' ? 'Preparing…' : 'Export to Excel'}
          </button>
          <button className="btn btn-secondary" disabled={downloading} onClick={() => handleDownload('csv')}>
            {downloading === 'csv' ? 'Preparing…' : 'Export to CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
