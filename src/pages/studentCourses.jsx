import { useState } from 'react';
import '../styles/studentCourses.css';
import StudentSidebar from '../components/studentSidebar';

const tabs = [
  { key: 'all',      label: 'All'               },
  { key: 'enrolled', label: 'Currently Enrolled' },
  { key: 'finished', label: 'Finished'           },
];

function StudentCourses() {
  const [activeTab, setActiveTab] = useState('all');

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

          <div className="card" />

        </div>
      </main>
    </div>
  );
}

export default StudentCourses;