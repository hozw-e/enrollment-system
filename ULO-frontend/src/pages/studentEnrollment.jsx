import { useState, useEffect } from 'react';
import '../styles/studentEnrollment.css';
import StudentSidebar from '../components/studentSidebar';
import Pagination from '../components/Pagination';
import { getCourses, getEnrollments, enrollCourse } from '../utils/apiClient';
import { ConfirmModal, AlertModal } from '../components/Modal';

function StudentEnrollment() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);

  // Modal states
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
  const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', variant: 'success' });

  // Pagination for available courses
  const [coursesPage, setCoursesPage] = useState(1);
  // Pagination for my enrollments
  const [enrollmentsPage, setEnrollmentsPage] = useState(1);
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
      console.error('Failed to load data:', err);
      setAlertModal({ show: true, title: 'Error', message: 'Failed to load enrollment data.', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const isEnrolled = (courseId) => {
    return enrollments.some(e => e.fld_course_id === courseId && e.fld_status === 'enrolled');
  };

  const coursesTotalPages = Math.ceil(courses.length / itemsPerPage);
  const paginatedCourses = courses.slice((coursesPage - 1) * itemsPerPage, coursesPage * itemsPerPage);

  const enrollmentsTotalPages = Math.ceil(enrollments.length / itemsPerPage);
  const paginatedEnrollments = enrollments.slice((enrollmentsPage - 1) * itemsPerPage, enrollmentsPage * itemsPerPage);

  const handleEnrollClick = (course) => {
    setConfirmModal({
      show: true,
      title: 'Confirm Enrollment',
      message: `Are you sure you want to enroll in "${course.fld_course_code} - ${course.fld_course_name}" (${course.fld_units} units)?`,
      onConfirm: () => confirmEnroll(course.fld_course_id),
    });
  };

  const confirmEnroll = async (courseId) => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
    try {
      setEnrolling(courseId);
      await enrollCourse(user.studnum, courseId);
      setAlertModal({ show: true, title: 'Success', message: 'You have been successfully enrolled in the course.', variant: 'success' });
      fetchData();
    } catch (err) {
      const errorMsg = err.message || 'Failed to enroll';
      setAlertModal({ show: true, title: 'Enrollment Failed', message: errorMsg, variant: 'error' });
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div className="layout">
      <StudentSidebar />

      <main className="main">
        <div className="content">

          <div className="pageHeader">
            <h1 className="pageTitle">Enrollment</h1>
            <hr className="divider" />
          </div>

          <div className="card">
            <h2 className="cardTitle">Available Courses</h2>
            {loading ? (
              <p className="loadingText">Loading available courses...</p>
            ) : (
              <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Units</th>
                    <th>Capacity</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCourses.length > 0 ? paginatedCourses.map(course => (
                    <tr key={course.fld_course_id}>
                      <td>{course.fld_course_code}</td>
                      <td>{course.fld_course_name}</td>
                      <td>{course.fld_units}</td>
                      <td>{course.enrolled_count}/{course.fld_max_students}</td>
                      <td>
                        {isEnrolled(course.fld_course_id) ? (
                          <span className="enrolledBadge">Enrolled</span>
                        ) : course.enrolled_count >= course.fld_max_students ? (
                          <span className="fullBadge">Full</span>
                        ) : (
                          <button
                            className="enrollBtn"
                            onClick={() => handleEnrollClick(course)}
                            disabled={enrolling === course.fld_course_id}
                          >
                            {enrolling === course.fld_course_id ? 'Enrolling...' : 'Enroll'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr className="emptyRow">
                      <td colSpan={5}>No courses available</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Pagination
                currentPage={coursesPage}
                totalPages={coursesTotalPages}
                onPageChange={setCoursesPage}
                totalItems={courses.length}
                itemsPerPage={itemsPerPage}
              />
              </>
            )}
          </div>

          {enrollments.length > 0 && (
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <h2 className="cardTitle">My Enrollments</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Units</th>
                    <th>Status</th>
                    <th>Date Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEnrollments.map(e => (
                    <tr key={e.fld_enrollment_id}>
                      <td>{e.fld_course_code}</td>
                      <td>{e.fld_course_name}</td>
                      <td>{e.fld_units}</td>
                      <td className={`status-${e.fld_status}`}>{e.fld_status}</td>
                      <td>{new Date(e.fld_enrollment_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={enrollmentsPage}
                totalPages={enrollmentsTotalPages}
                onPageChange={setEnrollmentsPage}
                totalItems={enrollments.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}

        </div>
      </main>

      {/* Confirm Modal */}
      <ConfirmModal
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null })}
        confirmText="Enroll"
        variant="info"
      />

      {/* Alert Modal */}
      <AlertModal
        show={alertModal.show}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
        onClose={() => setAlertModal({ show: false, title: '', message: '', variant: 'success' })}
      />
    </div>
  );
}

export default StudentEnrollment;
