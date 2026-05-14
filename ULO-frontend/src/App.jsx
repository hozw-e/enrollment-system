import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/studentDashboard';
import StudentCourses from './pages/studentCourses';
import StudentEnrollment from './pages/studentEnrollment';
import StudentProfile from './pages/studentProfile';
import AdminDashboard from './pages/adminDashboard';
import AdminRecords from './pages/adminRecords';
import AdminCourses from './pages/adminCourses';
import AdminReports from './pages/adminReports';

function ProtectedRoute({ element, role }) {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user || user.role !== role) return <Navigate to="/" />;
  return element;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/studentDashboard"  element={<ProtectedRoute element={<StudentDashboard />}  role="student" />} />
      <Route path="/studentCourses"    element={<ProtectedRoute element={<StudentCourses />}    role="student" />} />
      <Route path="/studentEnrollment" element={<ProtectedRoute element={<StudentEnrollment />} role="student" />} />
      <Route path="/studentProfile"    element={<ProtectedRoute element={<StudentProfile />}    role="student" />} />
      <Route path="/adminDashboard"    element={<ProtectedRoute element={<AdminDashboard />}    role="admin" />} />
      <Route path="/adminRecords"      element={<ProtectedRoute element={<AdminRecords />}      role="admin" />} />
      <Route path="/adminCourses"      element={<ProtectedRoute element={<AdminCourses />}      role="admin" />} />
      <Route path="/adminReports"      element={<ProtectedRoute element={<AdminReports />}      role="admin" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;