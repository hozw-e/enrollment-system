import { useState } from 'react';
import '../styles/adminReports.css';
import AdminSidebar from '../components/adminSidebar';
import { MdSearch } from 'react-icons/md';
import { TbFilter } from 'react-icons/tb';

const tabs = [
  { key: 'enrollments',      label: 'Enrollments'       },
  { key: 'coursePopularity', label: 'Course Popularity'  },
];

function AdminReports() {
  const [activeTab, setActiveTab] = useState('enrollments');
  const [search, setSearch]       = useState('');

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
                onClick={() => setActiveTab(tab.key)}
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
                  <th>Student Number</th>
                  <th>Name</th>
                  <th>College</th>
                  <th>Program</th>
                  <th>Year</th>
                  <th>Block</th>
                </tr>
              </thead>
              <tbody>
                <tr className="emptyRow">
                  <td colSpan={6}>No records found</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}

export default AdminReports;