import { useState, useEffect } from 'react';
import '../styles/studentDashboard.css';
import StudentSidebar from '../components/studentSidebar';
import { MdCampaign } from 'react-icons/md';
import { getEnrollments } from '../utils/apiClient';

function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await getEnrollments(user.studnum);
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalUnits = enrollments
    .filter(e => e.fld_status === 'enrolled')
    .reduce((sum, e) => sum + (e.fld_units || 0), 0);

  return (
    <div className="layout">
      <StudentSidebar />

      <main className="main">
        <div className="content">

          {/* Page Header */}
          <div className="pageHeader">
            <h1 className="pageTitle">Dashboard</h1>
            <hr className="divider" />
          </div>

          {/* Welcome */}
          <div className="welcomeCard">
            <h2>Welcome, {user.fname || user.username}!</h2>
            <p>Student Number: {user.studnum}</p>
          </div>

          {/* Two Columns */}
          <div className="topRow">

            {/* Left Column - Announcement */}
            <div className="card">
              <h2 className="cardTitle">Announcement</h2>
              <hr className="cardDivider" />
              <div className="emptyState">
                <MdCampaign className="emptyIcon" />
                <p>No announcements yet</p>
              </div>
            </div>

            {/* Right Column - Enrollment Summary */}
            <div className="rightColumn">

              <div className="card">
                <h2 className="cardTitle">Enrollment Summary</h2>
                <div className="statsRow">
                  <div className="statBox">
                    <span className="statNumber">{enrollments.filter(e => e.fld_status === 'enrolled').length}</span>
                    <span className="statLabel">Enrolled Courses</span>
                  </div>
                  <div className="statBox">
                    <span className="statNumber">{totalUnits}</span>
                    <span className="statLabel">Total Units</span>
                  </div>
                  <div className="statBox">
                    <span className="statNumber">{enrollments.filter(e => e.fld_status === 'completed').length}</span>
                    <span className="statLabel">Completed</span>
                  </div>
                </div>
              </div>

              {/* Current Enrollments */}
              <div className="card">
                <h2 className="cardTitle">Current Enrollments</h2>
                {loading ? (
                  <p style={{ padding: '0.5rem' }}>Loading...</p>
                ) : enrollments.filter(e => e.fld_status === 'enrolled').length > 0 ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Units</th>
                        <th>Date Enrolled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.filter(e => e.fld_status === 'enrolled').map(e => (
                        <tr key={e.fld_enrollment_id}>
                          <td>{e.fld_course_code}</td>
                          <td>{e.fld_course_name}</td>
                          <td>{e.fld_units}</td>
                          <td>{new Date(e.fld_enrollment_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ padding: '0.5rem', color: '#666' }}>No current enrollments</p>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
