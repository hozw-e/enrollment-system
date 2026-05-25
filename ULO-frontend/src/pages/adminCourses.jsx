import { useState, useEffect } from 'react';
import '../styles/adminCourses.css';
import AdminSidebar from '../components/adminSidebar';
import Pagination from '../components/Pagination';
import { MdSearch, MdAdd } from 'react-icons/md';
import { getAdminCourses, createCourse, updateCourseAdmin, deleteCourse } from '../utils/apiClient';
import { ConfirmModal, AlertModal } from '../components/Modal';

function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '', units: 3, max_students: 40 });
  const [saving, setSaving] = useState(false);

  // Modal states
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
  const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', variant: 'success' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getAdminCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load courses:', err);
      showAlert('Error', 'Failed to load courses. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (title, message, variant = 'success') => {
    setAlertModal({ show: true, title, message, variant });
  };

  const filtered = courses.filter(c => {
    const term = search.toLowerCase();
    return (
      (c.fld_course_code || '').toLowerCase().includes(term) ||
      (c.fld_course_name || '').toLowerCase().includes(term)
    );
  });

  // Reset page when search changes
  useEffect(() => { setCurrentPage(1); }, [search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedCourses = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCreate = async () => {
    if (!form.code || !form.name) {
      showAlert('Validation Error', 'Course code and name are required.', 'error');
      return;
    }
    try {
      setSaving(true);
      await createCourse(form);
      showAlert('Success', 'Course created successfully.', 'success');
      setShowCreateModal(false);
      setForm({ code: '', name: '', description: '', units: 3, max_students: 40 });
      fetchCourses();
    } catch (err) {
      showAlert('Error', 'Failed to create course. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (course) => {
    setForm({
      course_id: course.fld_course_id,
      code: course.fld_course_code,
      name: course.fld_course_name,
      description: course.fld_description || '',
      units: course.fld_units,
      max_students: course.fld_max_students,
    });
    setShowEditModal(true);
    setSelectedCourse(null);
  };

  const handleDeleteClick = (course) => {
    setSelectedCourse(null);
    setConfirmModal({
      show: true,
      title: 'Delete Course',
      message: `Are you sure you want to permanently delete "${course.fld_course_code} - ${course.fld_course_name}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(course),
    });
  };

  const confirmDelete = async (course) => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
    try {
      const result = await deleteCourse(course.fld_course_id);

      if (result && result.error) {
        showAlert('Error', result.error, 'error');
      } else {
        showAlert('Success', 'Course deleted successfully.', 'success');
        fetchCourses();
      }
    } catch (err) {
      console.error('Delete error:', err);
      showAlert('Error', err.message || 'Failed to delete course. Please try again.', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!form.code || !form.name) {
      showAlert('Validation Error', 'Course code and name are required.', 'error');
      return;
    }
    try {
      setSaving(true);
      await updateCourseAdmin(form);
      showAlert('Success', 'Course updated successfully.', 'success');
      setShowEditModal(false);
      fetchCourses();
    } catch (err) {
      showAlert('Error', 'Failed to update course. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="layout">
      <AdminSidebar />

      <main className="main">
        <div className="content">

          <div className="pageHeader">
            <h1 className="pageTitle">Courses</h1>
            <hr className="divider" />
          </div>

          <div className="card">
            <div className="toolbar">
              <div className="searchWrapper">
                <input
                  type="text"
                  className="searchInput"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="searchBtn"><MdSearch /></button>
              </div>
              <button className="addBtn" onClick={() => { setForm({ code: '', name: '', description: '', units: 3, max_students: 40 }); setShowCreateModal(true); }}>
                <MdAdd /> Add Course
              </button>
            </div>

            {loading ? (
              <p style={{ padding: '1rem' }}>Loading courses...</p>
            ) : (
              <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Units</th>
                    <th>Enrolled</th>
                    <th>Dropped</th>
                    <th>Completed</th>
                    <th>Max Cap</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCourses.length > 0 ? paginatedCourses.map(course => (
                    <tr key={course.fld_course_id} onClick={() => setSelectedCourse(course)}>
                      <td>{course.fld_course_code}</td>
                      <td>{course.fld_course_name}</td>
                      <td>{course.fld_units}</td>
                      <td>{course.enrolled_count}</td>
                      <td>{course.dropped_count}</td>
                      <td>{course.completed_count}</td>
                      <td>{course.fld_max_students}</td>
                    </tr>
                  )) : (
                    <tr className="emptyRow">
                      <td colSpan={7}>No courses found</td>
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

      {/* View Course Modal */}
      {selectedCourse && (
        <div className="modalOverlay" onClick={() => setSelectedCourse(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modalTitle">{selectedCourse.fld_course_code}</h3>
            <table className="modalTable">
              <tbody>
                <tr>
                  <td className="modalLabel">Course Name</td>
                  <td>{selectedCourse.fld_course_name}</td>
                </tr>
                <tr>
                  <td className="modalLabel">Description</td>
                  <td>{selectedCourse.fld_description || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="modalLabel">Units</td>
                  <td>{selectedCourse.fld_units}</td>
                </tr>
                <tr>
                  <td className="modalLabel">Max Capacity</td>
                  <td>{selectedCourse.fld_max_students} Students</td>
                </tr>
                <tr>
                  <td className="modalLabel">Enrolled</td>
                  <td>{selectedCourse.enrolled_count}</td>
                </tr>
                <tr>
                  <td className="modalLabel">Status</td>
                  <td>{selectedCourse.fld_is_active ? 'Active' : 'Inactive'}</td>
                </tr>
              </tbody>
            </table>
            <div className="modalActions">
              <button className="editBtn" onClick={() => handleEdit(selectedCourse)}>Edit</button>
              <button className="deleteBtn" onClick={() => handleDeleteClick(selectedCourse)}>Delete</button>
              <button className="closeBtn" onClick={() => setSelectedCourse(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="modalOverlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modalTitle">Create New Course</h3>
            <div className="modalForm">
              <div className="formGroup">
                <label>Course Code</label>
                <input value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} placeholder="e.g. CS101" />
              </div>
              <div className="formGroup">
                <label>Course Name</label>
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="e.g. Introduction to CS" />
              </div>
              <div className="formGroup">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} />
              </div>
              <div className="formRow">
                <div className="formGroup">
                  <label>Units</label>
                  <input type="number" value={form.units} onChange={(e) => setForm({...form, units: parseInt(e.target.value) || 0})} />
                </div>
                <div className="formGroup">
                  <label>Max Students</label>
                  <input type="number" value={form.max_students} onChange={(e) => setForm({...form, max_students: parseInt(e.target.value) || 0})} />
                </div>
              </div>
            </div>
            <div className="modalActions">
              <button className="saveBtn" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create'}</button>
              <button className="closeBtn" onClick={() => setShowCreateModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="modalOverlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modalTitle">Edit Course</h3>
            <div className="modalForm">
              <div className="formGroup">
                <label>Course Code</label>
                <input value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} />
              </div>
              <div className="formGroup">
                <label>Course Name</label>
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
              </div>
              <div className="formGroup">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} />
              </div>
              <div className="formRow">
                <div className="formGroup">
                  <label>Units</label>
                  <input type="number" value={form.units} onChange={(e) => setForm({...form, units: parseInt(e.target.value) || 0})} />
                </div>
                <div className="formGroup">
                  <label>Max Students</label>
                  <input type="number" value={form.max_students} onChange={(e) => setForm({...form, max_students: parseInt(e.target.value) || 0})} />
                </div>
              </div>
            </div>
            <div className="modalActions">
              <button className="saveBtn" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button className="closeBtn" onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null })}
        confirmText="Delete"
        variant="danger"
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

export default AdminCourses;
