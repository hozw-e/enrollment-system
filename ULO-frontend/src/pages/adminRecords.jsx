import { useState, useEffect, useMemo } from 'react';
import '../styles/adminRecords.css';
import AdminSidebar from '../components/adminSidebar';
import Pagination from '../components/Pagination';
import { MdSearch } from 'react-icons/md';
import { TbFilter } from 'react-icons/tb';
import { getAdminStudents, getFullProfile } from '../utils/apiClient';

function AdminRecords() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Filter & Sort
  const [filterCollege, setFilterCollege] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // name, college, program, year

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getAdminStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    setProfileLoading(true);
    try {
      const profile = await getFullProfile(student.fld_studnum);
      setStudentProfile(profile);
    } catch (err) {
      console.error('Failed to load student profile:', err);
      setStudentProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  // Get unique colleges and programs for filter dropdowns
  const colleges = useMemo(() => [...new Set(students.map(s => s.fld_college_code).filter(Boolean))].sort(), [students]);
  const programs = useMemo(() => {
    const list = students.filter(s => !filterCollege || s.fld_college_code === filterCollege).map(s => s.fld_program_code).filter(Boolean);
    return [...new Set(list)].sort();
  }, [students, filterCollege]);

  const filtered = useMemo(() => {
    let result = students.filter(s => {
      const term = search.toLowerCase();
      const matchesSearch = (
        (s.fld_studnum || '').toLowerCase().includes(term) ||
        (s.fld_fname || '').toLowerCase().includes(term) ||
        (s.fld_lname || '').toLowerCase().includes(term) ||
        (s.fld_username || '').toLowerCase().includes(term) ||
        (s.fld_college_code || '').toLowerCase().includes(term) ||
        (s.fld_college_name || '').toLowerCase().includes(term) ||
        (s.fld_program_code || '').toLowerCase().includes(term) ||
        (s.fld_program_name || '').toLowerCase().includes(term)
      );
      const matchesCollege = !filterCollege || s.fld_college_code === filterCollege;
      const matchesProgram = !filterProgram || s.fld_program_code === filterProgram;
      return matchesSearch && matchesCollege && matchesProgram;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'college': return (a.fld_college_code || '').localeCompare(b.fld_college_code || '');
        case 'program': return (a.fld_program_code || '').localeCompare(b.fld_program_code || '');
        default: return (a.fld_lname || '').localeCompare(b.fld_lname || '');
      }
    });

    return result;
  }, [students, search, filterCollege, filterProgram, sortBy]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [search, filterCollege, filterProgram, sortBy]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedStudents = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="adminLayout">
      <AdminSidebar />

      <main className="adminMain">
        <div className="adminContent">

          <div className="adminPageHeader">
            <h1 className="adminPageTitle">Student Records</h1>
            <hr className="adminDivider" />
          </div>

          <div className="adminCard">

            <div className="adminToolbar">
              <div className="adminSearchWrapper">
                <input
                  type="text"
                  className="adminSearchInput"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="adminSearchBtn"><MdSearch /></button>
              </div>
              <button className="adminFilterBtn" onClick={() => setShowFilters(!showFilters)}>
                Filter <TbFilter />
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="adminFilterPanel">
                <div className="adminFilterGroup">
                  <label>College</label>
                  <select value={filterCollege} onChange={(e) => { setFilterCollege(e.target.value); setFilterProgram(''); }}>
                    <option value="">All Colleges</option>
                    {colleges.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="adminFilterGroup">
                  <label>Program</label>
                  <select value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)}>
                    <option value="">All Programs</option>
                    {programs.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="adminFilterGroup">
                  <label>Sort By</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="name">Name</option>
                    <option value="college">College</option>
                    <option value="program">Program</option>
                  </select>
                </div>
                <button className="adminClearFilterBtn" onClick={() => { setFilterCollege(''); setFilterProgram(''); setSortBy('name'); }}>
                  Clear
                </button>
              </div>
            )}

            {loading ? (
              <p style={{ padding: '1rem' }}>Loading students...</p>
            ) : (
              <>
              <div className="adminTableWrapper">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>Student Number</th>
                      <th>Name</th>
                      <th>College</th>
                      <th>Program</th>
                      <th>Sex</th>
                      <th>Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.length > 0 ? paginatedStudents.map(student => (
                      <tr key={student.fld_studnum} onClick={() => handleStudentClick(student)}>
                        <td>{student.fld_studnum}</td>
                        <td>{student.fld_fname} {student.fld_lname}</td>
                        <td>{student.fld_college_code || 'N/A'}</td>
                        <td>{student.fld_program_code || 'N/A'}</td>
                        <td>{student.fld_sex || 'N/A'}</td>
                        <td>{student.fld_hasaccess === '1' ? 'Active' : 'Inactive'}</td>
                      </tr>
                    )) : (
                      <tr className="adminEmptyRow">
                        <td colSpan={6}>No students found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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

      {/* Student Full Profile Modal */}
      {selectedStudent && (
        <div className="adminModalOverlay" onClick={() => { setSelectedStudent(null); setStudentProfile(null); }}>
          <div className="adminProfileModal" onClick={(e) => e.stopPropagation()}>
            <h3 className="adminModalTitle">{selectedStudent.fld_fname} {selectedStudent.fld_lname} — Full Profile</h3>
            
            {profileLoading ? (
              <p>Loading profile...</p>
            ) : studentProfile ? (
              <div className="adminProfileSections">
                {/* Personal Info */}
                <div className="adminProfileSection">
                  <h4>Personal Information</h4>
                  <div className="adminProfileGrid">
                    <div><span>Student No.</span><strong>{studentProfile.personal?.fld_studnum}</strong></div>
                    <div><span>Username</span><strong>{studentProfile.personal?.fld_username}</strong></div>
                    <div><span>Name</span><strong>{studentProfile.personal?.fld_fname} {studentProfile.personal?.fld_mname || ''} {studentProfile.personal?.fld_lname} {studentProfile.personal?.fld_extname || ''}</strong></div>
                    <div><span>Date of Birth</span><strong>{studentProfile.personal?.fld_dob || 'N/A'}</strong></div>
                    <div><span>Sex</span><strong>{studentProfile.personal?.fld_sex || 'N/A'}</strong></div>
                    <div><span>College</span><strong>{studentProfile.personal?.fld_college_name || 'N/A'} ({studentProfile.personal?.fld_college_code || ''})</strong></div>
                    <div><span>Program</span><strong>{studentProfile.personal?.fld_program_name || 'N/A'} ({studentProfile.personal?.fld_program_code || ''})</strong></div>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="adminProfileSection">
                  <h4>Emergency Contacts</h4>
                  {studentProfile.emergency_contacts?.length > 0 ? (
                    <table className="adminMiniTable">
                      <thead><tr><th>Name</th><th>Relationship</th><th>Phone</th><th>Email</th></tr></thead>
                      <tbody>
                        {studentProfile.emergency_contacts.map(c => (
                          <tr key={c.fld_contact_id}>
                            <td>{c.fld_contact_name} {c.fld_is_primary ? '(Primary)' : ''}</td>
                            <td>{c.fld_relationship}</td>
                            <td>{c.fld_phone || 'N/A'}</td>
                            <td>{c.fld_email || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="adminEmptyText">No emergency contacts</p>}
                </div>

                {/* Family Background */}
                <div className="adminProfileSection">
                  <h4>Family Background</h4>
                  {studentProfile.family_background?.length > 0 ? (
                    <table className="adminMiniTable">
                      <thead><tr><th>Type</th><th>Name</th><th>Occupation</th><th>Contact</th></tr></thead>
                      <tbody>
                        {studentProfile.family_background.map(m => (
                          <tr key={m.fld_family_id}>
                            <td style={{textTransform:'capitalize'}}>{m.fld_member_type}</td>
                            <td>{m.fld_full_name}</td>
                            <td>{m.fld_occupation || 'N/A'}</td>
                            <td>{m.fld_contact_number || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="adminEmptyText">No family background</p>}
                </div>

                {/* Academic Background */}
                <div className="adminProfileSection">
                  <h4>Academic Background</h4>
                  {studentProfile.academic_background?.length > 0 ? (
                    <table className="adminMiniTable">
                      <thead><tr><th>Level</th><th>School</th><th>Years</th><th>Program</th><th>Honors</th></tr></thead>
                      <tbody>
                        {studentProfile.academic_background.map(r => (
                          <tr key={r.fld_academic_id}>
                            <td style={{textTransform:'capitalize'}}>{r.fld_level?.replace('_',' ')}</td>
                            <td>{r.fld_school_name}</td>
                            <td>{r.fld_year_started || '?'} - {r.fld_year_ended || 'Present'}</td>
                            <td>{r.fld_degree_program || 'N/A'}</td>
                            <td>{r.fld_honors || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="adminEmptyText">No academic records</p>}
                </div>
              </div>
            ) : <p>Failed to load profile.</p>}

            <button className="adminModalClose" onClick={() => { setSelectedStudent(null); setStudentProfile(null); }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRecords;
