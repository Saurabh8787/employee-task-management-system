import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

const EmployeeFormModal = ({ initialData, onSubmit, onClose, submitting }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initialData || { name: '', email: '', department: '', designation: '' },
  });

  useEffect(() => {
    reset(initialData || { name: '', email: '', department: '', designation: '' });
  }, [initialData, reset]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <strong>{initialData ? 'Edit Employee' : 'Add Employee'}</strong>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" {...register('name', { required: 'Name is required.' })} />
            {errors.name && <div className="form-error">{errors.name.message}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" {...register('email', { required: 'Email is required.' })} />
            {errors.email && <div className="form-error">{errors.email.message}</div>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" {...register('department', { required: 'Department is required.' })} />
              {errors.department && <div className="form-error">{errors.department.message}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <input className="form-input" {...register('designation', { required: 'Designation is required.' })} />
              {errors.designation && <div className="form-error">{errors.designation.message}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeFormModal;
