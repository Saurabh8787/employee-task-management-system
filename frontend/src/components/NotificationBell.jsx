import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAllNotificationsRead } from '../features/notifications/notificationSlice';

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationBell = () => {
  const dispatch = useDispatch();
  const { list, unreadCount } = useSelector((state) => state.notifications);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    dispatch(fetchNotifications());
    const interval = setInterval(() => dispatch(fetchNotifications()), 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="notif-wrap" ref={wrapRef}>
      <button className="notif-bell" onClick={() => setOpen((o) => !o)} aria-label="Notifications">
        🔔
        {unreadCount > 0 && <span className="notif-dot">{unreadCount}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--paper-50)' }}>
            <strong style={{ fontSize: '0.85rem' }}>Notifications</strong>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => dispatch(markAllNotificationsRead())}
              >
                Mark all read
              </button>
            )}
          </div>
          {list.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>
              <div className="title">No notifications yet</div>
              <div>You'll see task updates here.</div>
            </div>
          ) : (
            list.map((n) => (
              <div key={n.id} className={`notif-item ${n.isRead ? '' : 'unread'}`}>
                <div>{n.message}</div>
                <div className="meta">{timeAgo(n.createdAt)}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
