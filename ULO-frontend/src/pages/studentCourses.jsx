import { useState, useEffect } from 'react';
import '../styles/studentCourses.css';
import StudentSidebar from '../components/studentSidebar';
import Pagination from '../components/Pagination';
import { getCourses, getEnrollments } from '../utils/apiClient';

const tabs = [
  { key: 'all',      label: 'All'               },
  { key: 'enrolled', label: 'Currently Enrolled' },
  { key: 'completed', label: 'Completed'         },
];

function StudentCourses() {
  const [activeTab, setActiveTab] = useState('all');
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, enrollmentsData] = await Promise.all([
        getCourses(),
        getEnrollments(user.studnum),
      ]);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    if (activeTab === 'all') return courses;
    if (activeTab === 'enrolled') return enrollments.filter(e => e.fld_status === 'enrolled');
    if (activeTab === 'completed') return enrollments.filter(e => e.fld_status === 'completed');
    return [];
  };

  const filtered = getFilteredData();

  // Reset page when tab changes
  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="layout">
      <StudentSidebar />

      <main className="main">
        <div className="content">

          <div className="pageHeader">
            <h1 className="pageTitle">Courses</h1>
            <hr className="divider" />
          </div>

          <div className="tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`tab ${activeTab === tab.key ? 'activeTab' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="card">
            {loading ? (
              <p className="loadingText">Loading courses...</p>
            ) : (
              <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Units</th>
                    {activeTab !== 'all' && <th>Status</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? paginatedData.map((item, i) => (
                    <tr key={i}>
                      <td>{item.fld_course_code}</td>
                      <td>{item.fld_course_name}</td>
                      <td>{item.fld_units}</td>
                      {activeTab !== 'all' && <td className={`status-${item.fld_status}`}>{item.fld_status}</td>}
                    </tr>
                  )) : (
                    <tr className="emptyRow">
                      <td colSpan={activeTab === 'all' ? 3 : 4}>No courses found</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
              />
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default StudentCourses;
