import { useNavigate, useLocation } from 'react-router-dom';
import { MdGroups, MdBarChart, MdArchive } from 'react-icons/md';
import { RiLogoutBoxFill } from 'react-icons/ri';
import '../styles/adminSidebar.css';

const navItems = [
  { path: '/adminRecords', icon: <MdGroups />,   title: 'Student Records' },
  { path: '/adminCourses',  icon: <MdBarChart />, title: 'Courses'         },
  { path: '/adminReports',  icon: <MdArchive />,  title: 'Reports'         },
];

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/');
  };

  return (
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
      <button className="logoutBtn" onClick={handleLogout} title="Logout">
        <RiLogoutBoxFill />
      </button>
    </aside>
  );
}

export default AdminSidebar;