import '../styles/studentDashboard.css';
import StudentSidebar from '../components/studentSidebar';
import { MdCampaign } from 'react-icons/md';

const enrollmentHistory = [
  { semester: '2023-2024, 1st Semester', status: 'Officially Enrolled', statusClass: 'statusEnrolled',    date: 'August 9, 2023' },
  { semester: '2023-2024, 2nd Semester', status: 'Officially Enrolled', statusClass: 'statusEnrolled',    date: 'January 20, 2024' },
  { semester: '2023-2024, Midyear',      status: 'Not Enlisted',        statusClass: 'statusNotEnlisted', date: '' },
  { semester: '2024-2025, 1st Semester', status: 'Officially Enrolled', statusClass: 'statusEnrolled',    date: 'July 30, 2024' },
  { semester: '2024-2025, 2nd Semester', status: 'Officially Enrolled', statusClass: 'statusEnrolled',    date: 'January 19, 2025' },
  { semester: '2024-2025, Midyear',      status: 'Officially Enrolled', statusClass: 'statusEnrolled',    date: 'June 15, 2025' },
  { semester: '2025-2026, 1st Semester', status: 'Officially Enrolled', statusClass: 'statusEnrolled',    date: 'August 10, 2025' },
  { semester: '2025-2026, 2nd Semester', status: 'Officially Enrolled', statusClass: 'statusEnrolled',    date: 'January 19, 2026' },
  { semester: '2025-2026, Midyear',      status: '', statusClass: '', date: '' },
  { semester: '2026-2027, 1st Semester', status: '', statusClass: '', date: '' },
  { semester: '2026-2027, 2nd Semester', status: '', statusClass: '', date: '' },
];

function StudentDashboard() {
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

            {/* Right Column - Enrollment History + Status Legend */}
            <div className="rightColumn">

              {/* Enrollment History */}
              <div className="card">
                <h2 className="cardTitle">Enrollment History</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Academic Year/Semester</th>
                      <th>Enrollment Status</th>
                      <th>Date of Enrollment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollmentHistory.map((row, i) => (
                      <tr key={i} className={i >= 0 && i <= 6 ? 'rowYellow' : 'rowWhite'}>
                        <td>{row.semester}</td>
                        <td className={row.statusClass}>{row.status}</td>
                        <td>{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enrollment Status Legend */}
              <div className="cardWide">
                <table className="legendTable">
                  <thead>
                    <tr>
                      <th style={{ width: '160px' }}>Enrollment Status</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="legendStatus statusNotEnlisted">Not Enlisted</td>
                      <td>You are not done with the Enlistment Process</td>
                    </tr>
                    <tr>
                      <td className="legendStatus statusWillNotEnroll">Will Not Enroll</td>
                      <td>You marked yourself as will not enroll for the semester OR you've been automatically mark as WILL NOT ENROLL because you have not done the enlistment process</td>
                    </tr>
                    <tr>
                      <td className="legendStatus statusEnrolled">Officially Enrolled</td>
                      <td>Your enrollment has been approved by the registrar.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;