import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchTasks, createTask, updateTask, deleteTask } from './taskSlice';
import { fetchEmployees } from '../employees/employeeSlice';
import TaskFormModal from './TaskFormModal';

const badgeClassForStatus = (status) => {
  if (status === 'Completed') return 'badge badge-completed';
  if (status === 'In Progress') return 'badge badge-progress';
  return 'badge badge-pending';
};

const badgeClassForPriority = (priority) => `badge badge-${priority.toLowerCase()}`;

const isOverdue = (task) => task.status !== 'Completed' && new Date(task.dueDate) < new Date(new Date().toDateString());

const TasksPage = () => {
  const dispatch = useDispatch();
  const { list, pagination, status, error } = useSelector((state) => state.tasks);
  const { list: employees } = useSelector((state) => state.employees);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'Admin';

  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAdmin) dispatch(fetchEmployees({ limit: 100 }));
  }, [dispatch, isAdmin]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchTasks({ status: statusFilter, priority: priorityFilter, search, page, limit: 10 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, statusFilter, priorityFilter, search, page]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const openAddModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    if (task.status === 'Completed') {
      toast.info('Completed tasks cannot be edited.');
      return;
    }
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    const action = editingTask
      ? await dispatch(updateTask({ id: editingTask.id, formData }))
      : await dispatch(createTask(formData));
    setSubmitting(false);

    if (action.type.endsWith('/fulfilled')) {
      toast.success(editingTask ? 'Task updated.' : 'Task created.');
      setModalOpen(false);
    } else {
      toast.error(action.payload || 'Something went wrong.');
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    const result = await dispatch(deleteTask(task.id));
    if (deleteTask.fulfilled.match(result)) {
      toast.success('Task deleted.');
    } else {
      toast.error(result.payload || 'Failed to delete task.');
    }
  };

  const handleQuickStatusChange = async (task, newStatus) => {
    const formData = new FormData();
    formData.append('title', task.title);
    formData.append('description', task.description || '');
    formData.append('priority', task.priority);
    formData.append('status', newStatus);
    formData.append('startDate', task.startDate);
    formData.append('dueDate', task.dueDate);
    formData.append('assignedEmployeeId', task.assignedEmployeeId);

    const result = await dispatch(updateTask({ id: task.id, formData }));
    if (updateTask.fulfilled.match(result)) {
      toast.success(`Task marked as ${newStatus}.`);
    } else {
      toast.error(result.payload || 'Failed to update status.');
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-filters">
          <input
            className="form-input"
            style={{ width: 220 }}
            placeholder="Search by title…"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          />
          <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select className="form-select" style={{ width: 150 }} value={priorityFilter} onChange={(e) => { setPage(1); setPriorityFilter(e.target.value); }}>
            <option value="">All priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={openAddModal}>+ New Task</button>}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                {isAdmin && <th>Assigned To</th>}
                <th>Priority</th>
                <th>Status</th>
                <th>Start</th>
                <th>Due</th>
                <th>File</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' && (
                <tr><td colSpan={8} className="text-muted" style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>
              )}
              {status !== 'loading' && list.length === 0 && (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <div className="title">No tasks found</div>
                    <div>{isAdmin ? 'Create your first task to get started.' : 'You have no tasks assigned yet.'}</div>
                  </div>
                </td></tr>
              )}
              {list.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  {isAdmin && <td>{task.employee?.name || '—'}</td>}
                  <td><span className={badgeClassForPriority(task.priority)}>{task.priority}</span></td>
                  <td>
                    <span className={badgeClassForStatus(task.status)}>{task.status}</span>
                    {isOverdue(task) && <span className="badge badge-overdue" style={{ marginLeft: 6 }}>Overdue</span>}
                  </td>
                  <td>{task.startDate}</td>
                  <td>{task.dueDate}</td>
                  <td>
                    {task.attachmentPath ? (
                      <a
                        href={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/uploads/${task.attachmentPath}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    ) : '—'}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {task.status !== 'Completed' && (
                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ marginRight: 6 }}
                        onClick={() => handleQuickStatusChange(task, 'Completed')}
                      >
                        Mark Complete
                      </button>
                    )}
                    {isAdmin && (
                      <>
                        <button
                          className="btn btn-sm btn-secondary"
                          style={{ marginRight: 6 }}
                          disabled={task.status === 'Completed'}
                          onClick={() => openEditModal(task)}
                        >
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(task)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-sm btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button className="btn btn-sm btn-secondary" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}

      {modalOpen && (
        <TaskFormModal
          initialData={editingTask}
          employees={employees}
          submitting={submitting}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default TasksPage;
