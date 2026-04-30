import { useState } from 'react';
import '../styles/adminRecords.css';
import AdminSidebar from '../components/adminSidebar';
import { MdSearch } from 'react-icons/md';
import { TbFilter } from 'react-icons/tb';

const tabs = [
  { key: 'all',      label: 'All'               },
  { key: 'enrolled', label: 'Currently Enrolled' },
];

function AdminRecords() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch]       = useState('');

  return (
    <div className="adminLayout">
      <AdminSidebar />

      <main className="adminMain">
        <div className="adminContent">

          <div className="adminPageHeader">
            <h1 className="adminPageTitle">Student Records</h1>
            <hr className="adminDivider" />
          </div>

          <div className="adminTabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`adminTab ${activeTab === tab.key ? 'adminActiveTab' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="adminCard">

            <div className="adminToolbar">
              <div className="adminSearchWrapper">
                <input
                  type="text"
                  className="adminSearchInput"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="adminSearchBtn"><MdSearch /></button>
              </div>
              <button className="adminFilterBtn">Filter <TbFilter /></button>
            </div>

            <div className="adminTableWrapper">
              <table className="adminTable">
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
                  <tr className="adminEmptyRow">
                    <td colSpan={6}>No records found</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default AdminRecords;