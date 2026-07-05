import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from './dashboardSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { data, status } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (status === 'loading' || !data) {
    return <p className="text-muted">Loading dashboard…</p>;
  }

  const isAdmin = data.view === 'Admin';

  return (
    <div>
      <p className="text-muted" style={{ marginTop: -8, marginBottom: 20 }}>
        Welcome back, {user?.fullName.split(' ')[0]}.
      </p>

      <div className="stat-grid">
        {isAdmin ? (
          <>
            <StatCard label="Total Employees" value={data.totalEmployees} accent="ink" />
            <StatCard label="Total Tasks" value={data.totalTasks} accent="signal" />
            <StatCard label="Completed Tasks" value={data.completedTasks} accent="signal" />
            <StatCard label="Pending Tasks" value={data.pendingTasks} accent="amber" />
          </>
        ) : (
          <>
            <StatCard label="My Tasks" value={data.myTasks} accent="ink" />
            <StatCard label="Completed" value={data.completedTasks} accent="signal" />
            <StatCard label="Pending" value={data.pendingTasks} accent="amber" />
            <StatCard label="Overdue" value={data.overdueTasks} accent="red" />
          </>
        )}
      </div>

      <div className="card">
        <div className="section-title">
          {isAdmin ? 'Admin overview' : 'Your task snapshot'}
        </div>
        <p className="text-muted" style={{ margin: 0 }}>
          {isAdmin
            ? 'Head to Tasks to review work across the team, or Employees to manage your roster.'
            : 'Head to Tasks to see everything assigned to you and update statuses as you go.'}
        </p>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, accent }) => (
  <div className={`stat-card accent-${accent}`}>
    <div className="label">{label}</div>
    <div className="value">{value}</div>
  </div>
);

export default DashboardPage;
