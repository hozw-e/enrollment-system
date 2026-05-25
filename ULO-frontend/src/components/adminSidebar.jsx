import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdDashboard, MdGroups, MdBarChart, MdArchive } from 'react-icons/md';
import { RiLogoutBoxFill } from 'react-icons/ri';
import { ConfirmModal } from './Modal';
import '../styles/adminSidebar.css';

const navItems = [
  { path: '/adminDashboard', icon: <MdDashboard />, title: 'Dashboard'       },
  { path: '/adminRecords',   icon: <MdGroups />,    title: 'Student Records' },
  { path: '/adminCourses',   icon: <MdBarChart />,  title: 'Courses'         },
  { path: '/adminReports',   icon: <MdArchive />,   title: 'Reports'         },
];

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/');
  };

  return (
    <>
      <aside className="sidebar">
        <div className="navIcons">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`navBtn ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={item.title}
            >
              {item.icon}
            </button>
          ))}
        </div>
        <button className="logoutBtn" onClick={() => setShowLogoutModal(true)} title="Logout">
          <RiLogoutBoxFill />
        </button>
      </aside>

      <ConfirmModal
        show={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access the system."
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        confirmText="Logout"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}

export default AdminSidebar;