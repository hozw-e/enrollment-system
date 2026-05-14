import { useState, useEffect } from 'react';
import '../styles/adminReports.css';
import AdminSidebar from '../components/adminSidebar';
import { MdSearch } from 'react-icons/md';
import { getEnrollmentReport, getCoursePopularity } from '../utils/apiClient';

const tabs = [
  { key: 'enrollments',      label: 'Enrollments'       },
  { key: 'coursePopularity', label: 'Course Popularity'  },
];

function AdminReports() {
  const [activeTab, setActiveTab] = useState('enrollments');
  const [search, setSearch] = useState('');
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [popularityData, setPopularityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrollments, popularity] = await Promise.all([
        getEnrollmentReport(),
        getCoursePopularity(),
      ]);
      setEnrollmentData(Array.isArray(enrollments) ? enrollments : []);
      setPopularityData(Array.isArray(popularity) ? popularity : []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollmentData.filter(e => {
    const term = search.toLowerCase();
    return (
      (e.fld_studnum || '').toLowerCase().includes(term) ||
      (e.fld_fname || '').toLowerCase().includes(term) ||
      (e.fld_lname || '').toLowerCase().includes(term) ||
      (e.fld_course_code || '').toLowerCase().includes(term) ||
      (e.fld_course_name || '').toLowerCase().includes(term)
    );
  });

  const filteredPopularity = popularityData.filter(c => {
    const term = search.toLowerCase();
    return (
      (c.fld_course_code || '').toLowerCase().includes(term) ||
      (c.fld_course_name || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="layout">
      <AdminSidebar />

      <main className="main">
        <div className="content">

          <div className="pageHeader">
            <h1 className="pageTitle">Reports</h1>
            <hr className="divider" />
          </div>

          <div className="tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`tab ${activeTab === tab.key ? 'activeTab' : ''}`}
                onClick={() => { setActiveTab(tab.key); setSearch(''); }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="card">
            <div className="toolbar">
              <div className="searchWrapper">
                <input
                  type="text"
                  className="searchInput"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="searchBtn"><MdSearch /></button>
              </div>
            </div>

            {loading ? (
              <p style={{ padding: '1rem' }}>Loading reports...</p>
            ) : activeTab === 'enrollments' ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Student No.</th>
                    <th>Student Name</th>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Units</th>
                    <th>Status</th>
                    <th>Date Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.length > 0 ? filteredEnrollments.map(e => (
                    <tr key={e.fld_enrollment_id}>
                      <td>{e.fld_studnum}</td>
                      <td>{e.fld_fname} {e.fld_lname}</td>
                      <td>{e.fld_course_code}</td>
                      <td>{e.fld_course_name}</td>
                      <td>{e.fld_units}</td>
                      <td className={`status-${e.fld_status}`}>{e.fld_status}</td>
                      <td>{e.fld_enrollment_date ? new Date(e.fld_enrollment_date).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  )) : (
                    <tr className="emptyRow">
                      <td colSpan={7}>No enrollment records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Units</th>
                    <th>Enrolled</th>
                    <th>Dropped</th>
                    <th>Completed</th>
                    <th>Total</th>
                    <th>Fill Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPopularity.length > 0 ? filteredPopularity.map(c => (
                    <tr key={c.fld_course_id}>
                      <td>{c.fld_course_code}</td>
                      <td>{c.fld_course_name}</td>
                      <td>{c.fld_units}</td>
                      <td>{c.enrolled_count}</td>
                      <td>{c.dropped_count}</td>
                      <td>{c.completed_count}</td>
                      <td>{c.total_enrollments}</td>
                      <td>{c.fill_rate_percent}%</td>
                    </tr>
                  )) : (
                    <tr className="emptyRow">
                      <td colSpan={8}>No course data found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default AdminReports;
