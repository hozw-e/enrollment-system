import { useNavigate, useLocation } from 'react-router-dom';
import { MdDashboard, MdBarChart, MdMenuBook, MdPerson } from 'react-icons/md';
import { RiLogoutBoxFill } from 'react-icons/ri';
import '../styles/studentSidebar.css';

const navItems = [
  { path: '/studentDashboard',  icon: <MdDashboard />, title: 'Dashboard'  },
  { path: '/studentCourses',    icon: <MdBarChart />,  title: 'Courses'    },
  { path: '/studentEnrollment', icon: <MdMenuBook />,  title: 'Enrollment' },
  { path: '/studentProfile',    icon: <MdPerson />,    title: 'Profile'    },
];

function StudentSidebar() {
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

export default StudentSidebar;