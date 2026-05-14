import { useState } from 'react';
import '../styles/studentEnrollment.css';
import StudentSidebar from '../components/studentSidebar';

const tabs = [
  { key: 'profile',   label: 'Profile'    },
  { key: 'category1', label: 'Category 1' },
  { key: 'category2', label: 'Category 2' },
  { key: 'category3', label: 'Category 3' },
];

function StudentEnrollment() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="layout">
      <StudentSidebar />

      <main className="main">
        <div className="content">

          <div className="pageHeader">
            <h1 className="pageTitle">Enrollment</h1>
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

export default StudentEnrollment;