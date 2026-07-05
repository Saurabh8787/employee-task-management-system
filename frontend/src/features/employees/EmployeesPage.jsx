import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from './employeeSlice';
import EmployeeFormModal from './EmployeeFormModal';

const EmployeesPage = () => {
  const dispatch = useDispatch();
  const { list, pagination, status, error } = useSelector((state) => state.employees);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('DESC');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchEmployees({ search, sortBy, order, page, limit: 10 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, search, sortBy, order, page]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setOrder('ASC');
    }
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setModalOpen(true);
  };

  const handleSubmit = async (formValues) => {
    setSubmitting(true);
    const action = editingEmployee
      ? updateEmployee({ id: editingEmployee.id, payload: formValues })
      : createEmployee(formValues);

    const result = await dispatch(action);
    setSubmitting(false);

    if (action.type.endsWith('/fulfilled') || result.type.endsWith('/fulfilled')) {
      toast.success(editingEmployee ? 'Employee updated.' : 'Employee added.');
      setModalOpen(false);
    } else {
      toast.error(result.payload || 'Something went wrong.');
    }
  };

  const handleDelete = async (employee) => {
    if (!window.confirm(`Delete ${employee.name}? This cannot be undone.`)) return;
    const result = await dispatch(deleteEmployee(employee.id));
    if (deleteEmployee.fulfilled.match(result)) {
      toast.success('Employee deleted.');
    } else {
      toast.error(result.payload || 'Failed to delete employee.');
    }
  };

  const sortIndicator = (field) => (sortBy === field ? (order === 'ASC' ? ' ↑' : ' ↓') : '');

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-filters">
          <input
            className="form-input"
            style={{ width: 260 }}
            placeholder="Search by name, email, department…"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          />
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>+ Add Employee</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>Name{sortIndicator('name')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('email')}>Email{sortIndicator('email')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('department')}>Department{sortIndicator('department')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('designation')}>Designation{sortIndicator('designation')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' && (
                <tr><td colSpan={5} className="text-muted" style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>
              )}
              {status !== 'loading' && list.length === 0 && (
                <tr><td colSpan={5}>
                  <div className="empty-state">
                    <div className="title">No employees found</div>
                    <div>Try a different search, or add your first employee.</div>
                  </div>
                </td></tr>
              )}
              {list.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(emp)} style={{ marginRight: 6 }}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(emp)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-sm btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button
            className="btn btn-sm btn-secondary"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {modalOpen && (
        <EmployeeFormModal
          initialData={editingEmployee}
          submitting={submitting}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default EmployeesPage;
