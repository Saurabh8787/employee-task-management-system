import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const TaskFormModal = ({ initialData, employees, onSubmit, onClose, submitting }) => {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description || '',
          priority: initialData.priority,
          status: initialData.status,
          startDate: initialData.startDate,
          dueDate: initialData.dueDate,
          assignedEmployeeId: initialData.assignedEmployeeId,
        }
      : { priority: 'Medium', status: 'Pending' },
  });
  const [file, setFile] = useState(null);
  const startDate = watch('startDate');

  useEffect(() => {
    reset(
      initialData
        ? {
            title: initialData.title,
            description: initialData.description || '',
            priority: initialData.priority,
            status: initialData.status,
            startDate: initialData.startDate,
            dueDate: initialData.dueDate,
            assignedEmployeeId: initialData.assignedEmployeeId,
          }
        : { priority: 'Medium', status: 'Pending' }
    );
  }, [initialData, reset]);

  const submitForm = (values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, value));
    if (file) formData.append('attachment', file);
    onSubmit(formData);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(selected.type)) {
      alert('Only PDF, JPG, and PNG files are allowed.');
      e.target.value = '';
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      alert('File must be 5 MB or smaller.');
      e.target.value = '';
      return;
    }
    setFile(selected);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <strong>{initialData ? 'Edit Task' : 'New Task'}</strong>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit(submitForm)} noValidate>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" {...register('title', { required: 'Title is required.' })} />
            {errors.title && <div className="form-error">{errors.title.message}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={3} {...register('description')} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" {...register('priority', { required: true })}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" {...register('status', { required: true })}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input className="form-input" type="date" {...register('startDate', { required: 'Start Date is required.' })} />
              {errors.startDate && <div className="form-error">{errors.startDate.message}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                className="form-input"
                type="date"
                {...register('dueDate', {
                  required: 'Due Date is required.',
                  validate: (value) => !startDate || value >= startDate || 'Due Date must not be earlier than Start Date.',
                })}
              />
              {errors.dueDate && <div className="form-error">{errors.dueDate.message}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Employee</label>
            <select className="form-select" {...register('assignedEmployeeId', { required: 'Please assign an employee.' })}>
              <option value="">Select employee…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name} — {emp.department}</option>
              ))}
            </select>
            {errors.assignedEmployeeId && <div className="form-error">{errors.assignedEmployeeId.message}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Attachment (PDF, JPG, PNG — max 5 MB)</label>
            <input className="form-input" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
            {initialData?.attachmentOriginalName && !file && (
              <div className="text-muted" style={{ fontSize: '0.78rem', marginTop: 4 }}>
                Current file: {initialData.attachmentOriginalName}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
