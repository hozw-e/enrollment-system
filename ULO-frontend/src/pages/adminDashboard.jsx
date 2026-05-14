import { useState, useEffect } from 'react';
import '../styles/adminDashboard.css';
import AdminSidebar from '../components/adminSidebar';
import { getAdminStudents, getAdminCourses, getEnrollmentReport } from '../utils/apiClient';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeEnrollments: 0,
  });
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [students, courses, enrollments] = await Promise.all([
        getAdminStudents(),
        getAdminCourses(),
        getEnrollmentReport(),
      ]);

      const studentList = Array.isArray(students) ? students : [];
      const courseList = Array.isArray(courses) ? courses : [];
      const enrollmentList = Array.isArray(enrollments) ? enrollments : [];

      setStats({
        totalStudents: studentList.length,
        totalCourses: courseList.length,
        totalEnrollments: enrollmentList.length,
        activeEnrollments: enrollmentList.filter(e => e.fld_status === 'enrolled').length,
      });

      setRecentEnrollments(enrollmentList.slice(0, 10));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adminDashLayout">
      <AdminSidebar />

      <main className="adminDashMain">
        <div className="adminDashContent">

          <div className="adminDashHeader">
            <h1 className="adminDashTitle">Dashboard</h1>
            <hr className="adminDashDivider" />
          </div>

          {/* Welcome */}
          <div className="adminWelcomeCard">
            <h2>Welcome, {user.fname || user.username}!</h2>
            <p>Admin Panel Overview</p>
          </div>

          {loading ? (
            <p style={{ padding: '1rem' }}>Loading dashboard...</p>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="adminStatsGrid">
                <div className="adminStatCard">
                  <span className="adminStatNumber">{stats.totalStudents}</span>
                  <span className="adminStatLabel">Total Students</span>
                </div>
                <div className="adminStatCard">
                  <span className="adminStatNumber">{stats.totalCourses}</span>
                  <span className="adminStatLabel">Total Courses</span>
                </div>
                <div className="adminStatCard">
                  <span className="adminStatNumber">{stats.activeEnrollments}</span>
                  <span className="adminStatLabel">Active Enrollments</span>
                </div>
                <div className="adminStatCard">
                  <span className="adminStatNumber">{stats.totalEnrollments}</span>
                  <span className="adminStatLabel">Total Enrollments</span>
                </div>
              </div>

              {/* Recent Enrollments */}
              <div className="adminDashCard">
                <h2 className="adminDashCardTitle">Recent Enrollments</h2>
                {recentEnrollments.length > 0 ? (
                  <table className="adminDashTable">
                    <thead>
                      <tr>
                        <th>Student No.</th>
                        <th>Student Name</th>
                        <th>Course</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEnrollments.map(e => (
                        <tr key={e.fld_enrollment_id}>
                          <td>{e.fld_studnum}</td>
                          <td>{e.fld_fname} {e.fld_lname}</td>
                          <td>{e.fld_course_code} - {e.fld_course_name}</td>
                          <td className={`status-${e.fld_status}`}>{e.fld_status}</td>
                          <td>{e.fld_enrollment_date ? new Date(e.fld_enrollment_date).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="adminDashEmpty">No enrollment records yet</p>
                )}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
