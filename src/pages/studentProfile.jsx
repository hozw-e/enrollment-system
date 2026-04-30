import { useState } from 'react';
import '../styles/studentProfile.css';
import StudentSidebar from '../components/studentSidebar';
import { FaUserCircle } from 'react-icons/fa';

const tabs = [
  { key: 'profile',   label: 'Profile'    },
  { key: 'category1', label: 'Category 1' },
  { key: 'category2', label: 'Category 2' },
  { key: 'category3', label: 'Category 3' },
];

function StudentProfile() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="layout">
      <StudentSidebar />

      <main className="main">
        <div className="content">

          {/* Student Info Card */}
          <div className="infoCard">
            <div className="photoWrapper">
              <FaUserCircle className="photoPlaceholder" />
            </div>
            <table className="infoTable">
              <tbody>
                <tr>
                  <td className="infoLabel">Name</td>
                  <td className="infoValue">Juan Dela Cruz</td>
                </tr>
                <tr>
                  <td className="infoLabel">Student ID</td>
                  <td className="infoValue">2026123456</td>
                </tr>
                <tr>
                  <td className="infoLabel">Department</td>
                  <td className="infoValue">College of Allied Health and Sciences</td>
                </tr>
                <tr>
                  <td className="infoLabel">Program</td>
                  <td className="infoValue">Bachelor of Science in Nursing</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tabs */}
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

          {/* Content Card */}
          <div className="card" />

        </div>
      </main>
    </div>
  );
}

export default StudentProfile;