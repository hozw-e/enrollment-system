import { useState } from 'react';
import '../styles/adminCourses.css';
import AdminSidebar from '../components/adminSidebar';
import { MdSearch } from 'react-icons/md';
import { TbFilter } from 'react-icons/tb';

const dummyCourses = [
  { id: 'CSP321', title: 'Automata Theory',       college: 'CCS', program: 'BSCS', year: '3rd', block: 'A', prerequisite: '3rd Year Standing', units: 3, maxCap: 30 },
  { id: 'CSP322', title: 'Software Engineering',  college: 'CCS', program: 'BSCS', year: '3rd', block: 'B', prerequisite: 'CSP301',            units: 3, maxCap: 35 },
  { id: 'CSP323', title: 'Database Systems',      college: 'CCS', program: 'BSIT', year: '2nd', block: 'A', prerequisite: 'None',              units: 3, maxCap: 40 },
];

function AdminCourses() {
  const [search, setSearch]             = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const filtered = dummyCourses.filter(c =>
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="layout">
      <AdminSidebar />

      <main className="main">
        <div className="content">

          <div className="pageHeader">
            <h1 className="pageTitle">Courses</h1>
            <hr className="divider" />
          </div>

          <div className="tabs">
            <button className="tab activeTab">All</button>
          </div>

          <div className="card">
            <div className="toolbar">
              <div className="searchWrapper">
                <input
                  type="text"
                  className="searchInput"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="searchBtn"><MdSearch /></button>
              </div>
              <button className="filterBtn">
                Filter <TbFilter />
              </button>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Course ID</th>
                  <th>Title</th>
                  <th>College</th>
                  <th>Program</th>
                  <th>Year</th>
                  <th>Block</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map(course => (
                  <tr key={course.id} onClick={() => setSelectedCourse(course)}>
                    <td>{course.id}</td>
                    <td>{course.title}</td>
                    <td>{course.college}</td>
                    <td>{course.program}</td>
                    <td>{course.year}</td>
                    <td>{course.block}</td>
                  </tr>
                )) : (
                  <tr className="emptyRow">
                    <td colSpan={6}>No courses found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>

      {/* Modal */}
      {selectedCourse && (
        <div className="modalOverlay" onClick={() => setSelectedCourse(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modalTitle">{selectedCourse.id}</h3>
            <table className="modalTable">
              <tbody>
                <tr>
                  <td className="modalLabel">Course Title</td>
                  <td>{selectedCourse.title}</td>
                </tr>
                <tr>
                  <td className="modalLabel">Prerequisite</td>
                  <td>{selectedCourse.prerequisite}</td>
                </tr>
                <tr>
                  <td className="modalLabel">Units</td>
                  <td>{selectedCourse.units}</td>
                </tr>
                <tr>
                  <td className="modalLabel">Max. Cap.</td>
                  <td>{selectedCourse.maxCap} Students</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminCourses;