import { useState, useEffect } from 'react';
import '../styles/studentProfile.css';
import StudentSidebar from '../components/studentSidebar';
import { FaUserCircle } from 'react-icons/fa';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import {
  getFullProfile, updatePersonalInfo,
  addEmergencyContact, updateEmergencyContact, deleteEmergencyContact,
  addFamilyMember, updateFamilyMember, deleteFamilyMemberApi,
  addAcademicRecord, updateAcademicRecord, deleteAcademicRecord
} from '../utils/apiClient';
import { ConfirmModal, AlertModal } from '../components/Modal';

const tabs = [
  { key: 'personal', label: 'Personal Info' },
  { key: 'emergency', label: 'Emergency Contacts' },
  { key: 'family', label: 'Family Background' },
  { key: 'academic', label: 'Academic Background' },
];

function StudentProfile() {
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
  const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', variant: 'success' });

  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getFullProfile(user.studnum);
      setProfileData(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (title, message, variant) => setAlertModal({ show: true, title, message, variant });

  // ─── PERSONAL INFO ───
  const startEditPersonal = () => {
    const p = profileData.personal;
    setForm({ fname: p?.fld_fname || '', mname: p?.fld_mname || '', lname: p?.fld_lname || '', extname: p?.fld_extname || '', dob: p?.fld_dob || '', sex: p?.fld_sex || '' });
    setEditing(true);
  };

  const savePersonal = async () => {
    try {
      setSaving(true);
      await updatePersonalInfo({ studnum: user.studnum, ...form });
      showAlert('Success', 'Personal info updated.', 'success');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      showAlert('Error', 'Failed to update personal info.', 'error');
    } finally { setSaving(false); }
  };

  // ─── EMERGENCY CONTACTS ───
  const startAddEmergency = () => {
    setForm({ contact_name: '', relationship: '', phone: '', email: '', address: '', is_primary: 0 });
    setShowAddForm(true);
    setEditingItem(null);
  };

  const startEditEmergency = (item) => {
    setForm({ contact_id: item.fld_contact_id, contact_name: item.fld_contact_name, relationship: item.fld_relationship, phone: item.fld_phone || '', email: item.fld_email || '', address: item.fld_address || '', is_primary: item.fld_is_primary });
    setEditingItem(item.fld_contact_id);
    setShowAddForm(false);
  };

  const saveEmergency = async () => {
    try {
      setSaving(true);
      if (editingItem) {
        await updateEmergencyContact({ ...form, studnum: user.studnum });
      } else {
        await addEmergencyContact({ ...form, studnum: user.studnum });
      }
      showAlert('Success', editingItem ? 'Contact updated.' : 'Contact added.', 'success');
      setShowAddForm(false); setEditingItem(null);
      fetchProfile();
    } catch (err) {
      showAlert('Error', 'Failed to save contact.', 'error');
    } finally { setSaving(false); }
  };

  const confirmDeleteEmergency = (id) => {
    setConfirmModal({ show: true, title: 'Delete Contact', message: 'Are you sure you want to delete this emergency contact?', onConfirm: () => doDeleteEmergency(id) });
  };

  const doDeleteEmergency = async (id) => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
    try { await deleteEmergencyContact(id, user.studnum); fetchProfile(); showAlert('Success', 'Contact deleted.', 'success'); }
    catch { showAlert('Error', 'Failed to delete.', 'error'); }
  };

  // ─── FAMILY BACKGROUND ───
  const startAddFamily = () => {
    setForm({ member_type: 'father', full_name: '', occupation: '', contact_number: '', email: '', address: '', is_living: 1 });
    setShowAddForm(true); setEditingItem(null);
  };

  const startEditFamily = (item) => {
    setForm({ family_id: item.fld_family_id, member_type: item.fld_member_type, full_name: item.fld_full_name, occupation: item.fld_occupation || '', contact_number: item.fld_contact_number || '', email: item.fld_email || '', address: item.fld_address || '', is_living: item.fld_is_living });
    setEditingItem(item.fld_family_id); setShowAddForm(false);
  };

  const saveFamily = async () => {
    try {
      setSaving(true);
      if (editingItem) {
        await updateFamilyMember({ ...form, studnum: user.studnum });
      } else {
        await addFamilyMember({ ...form, studnum: user.studnum });
      }
      showAlert('Success', editingItem ? 'Family member updated.' : 'Family member added.', 'success');
      setShowAddForm(false); setEditingItem(null);
      fetchProfile();
    } catch (err) {
      showAlert('Error', 'Failed to save.', 'error');
    } finally { setSaving(false); }
  };

  const confirmDeleteFamily = (id) => {
    setConfirmModal({ show: true, title: 'Delete Family Member', message: 'Are you sure?', onConfirm: () => doDeleteFamily(id) });
  };

  const doDeleteFamily = async (id) => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
    try { await deleteFamilyMemberApi(id, user.studnum); fetchProfile(); showAlert('Success', 'Deleted.', 'success'); }
    catch { showAlert('Error', 'Failed to delete.', 'error'); }
  };

  // ─── ACADEMIC BACKGROUND ───
  const startAddAcademic = () => {
    setForm({ level: 'elementary', school_name: '', school_address: '', year_started: '', year_ended: '', degree_program: '', honors: '' });
    setShowAddForm(true); setEditingItem(null);
  };

  const startEditAcademic = (item) => {
    setForm({ academic_id: item.fld_academic_id, level: item.fld_level, school_name: item.fld_school_name, school_address: item.fld_school_address || '', year_started: item.fld_year_started || '', year_ended: item.fld_year_ended || '', degree_program: item.fld_degree_program || '', honors: item.fld_honors || '' });
    setEditingItem(item.fld_academic_id); setShowAddForm(false);
  };

  const saveAcademic = async () => {
    try {
      setSaving(true);
      if (editingItem) {
        await updateAcademicRecord({ ...form, studnum: user.studnum });
      } else {
        await addAcademicRecord({ ...form, studnum: user.studnum });
      }
      showAlert('Success', editingItem ? 'Record updated.' : 'Record added.', 'success');
      setShowAddForm(false); setEditingItem(null);
      fetchProfile();
    } catch (err) {
      showAlert('Error', 'Failed to save.', 'error');
    } finally { setSaving(false); }
  };

  const confirmDeleteAcademic = (id) => {
    setConfirmModal({ show: true, title: 'Delete Record', message: 'Are you sure?', onConfirm: () => doDeleteAcademic(id) });
  };

  const doDeleteAcademic = async (id) => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
    try { await deleteAcademicRecord(id, user.studnum); fetchProfile(); showAlert('Success', 'Deleted.', 'success'); }
    catch { showAlert('Error', 'Failed to delete.', 'error'); }
  };

  const cancelForm = () => { setShowAddForm(false); setEditingItem(null); setEditing(false); };

  // ─── RENDER ───
  const renderPersonal = () => {
    const p = profileData?.personal;
    if (!p) return <p>No personal info found.</p>;
    if (editing) {
      return (
        <div className="profileForm">
          <div className="formRow">
            <div className="formGroup"><label>First Name</label><input value={form.fname} onChange={e => setForm({...form, fname: e.target.value})} /></div>
            <div className="formGroup"><label>Middle Name</label><input value={form.mname} onChange={e => setForm({...form, mname: e.target.value})} /></div>
            <div className="formGroup"><label>Last Name</label><input value={form.lname} onChange={e => setForm({...form, lname: e.target.value})} /></div>
          </div>
          <div className="formRow">
            <div className="formGroup"><label>Extension</label><input value={form.extname} onChange={e => setForm({...form, extname: e.target.value})} placeholder="Jr., Sr." /></div>
            <div className="formGroup"><label>Date of Birth</label><input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} /></div>
            <div className="formGroup"><label>Sex</label>
              <select value={form.sex} onChange={e => setForm({...form, sex: e.target.value})}>
                <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option>
              </select>
            </div>
          </div>
          <div className="formActions">
            <button className="saveBtn" onClick={savePersonal} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button className="cancelBtn" onClick={cancelForm}>Cancel</button>
          </div>
        </div>
      );
    }
    return (
      <div className="profileSection">
        <div className="sectionHeader"><h3>Personal Information</h3><button className="iconBtn" onClick={startEditPersonal}><MdEdit /></button></div>
        <div className="infoGrid">
          <div className="infoItem"><span className="label">Student Number</span><span className="value">{p.fld_studnum}</span></div>
          <div className="infoItem"><span className="label">Username</span><span className="value">{p.fld_username}</span></div>
          <div className="infoItem"><span className="label">First Name</span><span className="value">{p.fld_fname}</span></div>
          <div className="infoItem"><span className="label">Middle Name</span><span className="value">{p.fld_mname || 'N/A'}</span></div>
          <div className="infoItem"><span className="label">Last Name</span><span className="value">{p.fld_lname}</span></div>
          <div className="infoItem"><span className="label">Extension</span><span className="value">{p.fld_extname || 'N/A'}</span></div>
          <div className="infoItem"><span className="label">Date of Birth</span><span className="value">{p.fld_dob || 'N/A'}</span></div>
          <div className="infoItem"><span className="label">Sex</span><span className="value">{p.fld_sex || 'N/A'}</span></div>
        </div>
      </div>
    );
  };

  const renderEmergency = () => {
    const contacts = profileData?.emergency_contacts || [];
    return (
      <div className="profileSection">
        <div className="sectionHeader"><h3>Emergency Contacts</h3><button className="addSectionBtn" onClick={startAddEmergency}><MdAdd /> Add</button></div>
        {(showAddForm || editingItem) && (
          <div className="profileForm">
            <div className="formRow">
              <div className="formGroup"><label>Contact Name</label><input value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} /></div>
              <div className="formGroup"><label>Relationship</label><input value={form.relationship} onChange={e => setForm({...form, relationship: e.target.value})} placeholder="e.g. Parent, Sibling" /></div>
            </div>
            <div className="formRow">
              <div className="formGroup"><label>Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div className="formGroup"><label>Email</label><input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            </div>
            <div className="formGroup"><label>Address</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
            <div className="formGroup"><label><input type="checkbox" checked={form.is_primary === 1} onChange={e => setForm({...form, is_primary: e.target.checked ? 1 : 0})} /> Primary Contact</label></div>
            <div className="formActions">
              <button className="saveBtn" onClick={saveEmergency} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button className="cancelBtn" onClick={cancelForm}>Cancel</button>
            </div>
          </div>
        )}
        {contacts.length > 0 ? (
          <div className="itemsList">
            {contacts.map(c => (
              <div key={c.fld_contact_id} className="itemCard">
                <div className="itemInfo">
                  <strong>{c.fld_contact_name}</strong> {c.fld_is_primary ? <span className="primaryBadge">Primary</span> : null}
                  <p>{c.fld_relationship} • {c.fld_phone || 'No phone'} • {c.fld_email || 'No email'}</p>
                  {c.fld_address && <p className="subtext">{c.fld_address}</p>}
                </div>
                <div className="itemActions">
                  <button className="iconBtn" onClick={() => startEditEmergency(c)}><MdEdit /></button>
                  <button className="iconBtn danger" onClick={() => confirmDeleteEmergency(c.fld_contact_id)}><MdDelete /></button>
                </div>
              </div>
            ))}
          </div>
        ) : !showAddForm && <p className="emptyText">No emergency contacts added yet.</p>}
      </div>
    );
  };

  const renderFamily = () => {
    const members = profileData?.family_background || [];
    return (
      <div className="profileSection">
        <div className="sectionHeader"><h3>Family Background</h3><button className="addSectionBtn" onClick={startAddFamily}><MdAdd /> Add</button></div>
        {(showAddForm || editingItem) && activeTab === 'family' && (
          <div className="profileForm">
            <div className="formRow">
              <div className="formGroup"><label>Member Type</label>
                <select value={form.member_type} onChange={e => setForm({...form, member_type: e.target.value})}>
                  <option value="father">Father</option><option value="mother">Mother</option><option value="guardian">Guardian</option><option value="spouse">Spouse</option><option value="sibling">Sibling</option>
                </select>
              </div>
              <div className="formGroup"><label>Full Name</label><input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} /></div>
            </div>
            <div className="formRow">
              <div className="formGroup"><label>Occupation</label><input value={form.occupation} onChange={e => setForm({...form, occupation: e.target.value})} /></div>
              <div className="formGroup"><label>Contact Number</label><input value={form.contact_number} onChange={e => setForm({...form, contact_number: e.target.value})} /></div>
            </div>
            <div className="formRow">
              <div className="formGroup"><label>Email</label><input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="formGroup"><label>Address</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
            </div>
            <div className="formGroup"><label><input type="checkbox" checked={form.is_living === 1} onChange={e => setForm({...form, is_living: e.target.checked ? 1 : 0})} /> Living</label></div>
            <div className="formActions">
              <button className="saveBtn" onClick={saveFamily} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button className="cancelBtn" onClick={cancelForm}>Cancel</button>
            </div>
          </div>
        )}
        {members.length > 0 ? (
          <div className="itemsList">
            {members.map(m => (
              <div key={m.fld_family_id} className="itemCard">
                <div className="itemInfo">
                  <strong>{m.fld_full_name}</strong> <span className="typeBadge">{m.fld_member_type}</span>
                  <p>{m.fld_occupation || 'No occupation'} • {m.fld_contact_number || 'No contact'}</p>
                  {!m.fld_is_living && <span className="deceasedBadge">Deceased</span>}
                </div>
                <div className="itemActions">
                  <button className="iconBtn" onClick={() => startEditFamily(m)}><MdEdit /></button>
                  <button className="iconBtn danger" onClick={() => confirmDeleteFamily(m.fld_family_id)}><MdDelete /></button>
                </div>
              </div>
            ))}
          </div>
        ) : !(showAddForm && activeTab === 'family') && <p className="emptyText">No family members added yet.</p>}
      </div>
    );
  };

  const renderAcademic = () => {
    const records = profileData?.academic_background || [];
    return (
      <div className="profileSection">
        <div className="sectionHeader"><h3>Academic Background</h3><button className="addSectionBtn" onClick={startAddAcademic}><MdAdd /> Add</button></div>
        {(showAddForm || editingItem) && activeTab === 'academic' && (
          <div className="profileForm">
            <div className="formRow">
              <div className="formGroup"><label>Level</label>
                <select value={form.level} onChange={e => setForm({...form, level: e.target.value})}>
                  <option value="elementary">Elementary</option><option value="secondary">Secondary</option><option value="senior_high">Senior High</option><option value="college">College</option><option value="graduate">Graduate</option>
                </select>
              </div>
              <div className="formGroup"><label>School Name</label><input value={form.school_name} onChange={e => setForm({...form, school_name: e.target.value})} /></div>
            </div>
            <div className="formGroup"><label>School Address</label><input value={form.school_address} onChange={e => setForm({...form, school_address: e.target.value})} /></div>
            <div className="formRow">
              <div className="formGroup"><label>Year Started</label><input type="number" value={form.year_started} onChange={e => setForm({...form, year_started: e.target.value})} placeholder="2018" /></div>
              <div className="formGroup"><label>Year Ended</label><input type="number" value={form.year_ended} onChange={e => setForm({...form, year_ended: e.target.value})} placeholder="2022" /></div>
            </div>
            <div className="formRow">
              <div className="formGroup"><label>Degree/Program</label><input value={form.degree_program} onChange={e => setForm({...form, degree_program: e.target.value})} /></div>
              <div className="formGroup"><label>Honors</label><input value={form.honors} onChange={e => setForm({...form, honors: e.target.value})} placeholder="e.g. Cum Laude" /></div>
            </div>
            <div className="formActions">
              <button className="saveBtn" onClick={saveAcademic} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button className="cancelBtn" onClick={cancelForm}>Cancel</button>
            </div>
          </div>
        )}
        {records.length > 0 ? (
          <div className="itemsList">
            {records.map(r => (
              <div key={r.fld_academic_id} className="itemCard">
                <div className="itemInfo">
                  <strong>{r.fld_school_name}</strong> <span className="typeBadge">{r.fld_level.replace('_', ' ')}</span>
                  <p>{r.fld_year_started || '?'} - {r.fld_year_ended || 'Present'} {r.fld_degree_program ? `• ${r.fld_degree_program}` : ''}</p>
                  {r.fld_honors && <p className="subtext">Honors: {r.fld_honors}</p>}
                </div>
                <div className="itemActions">
                  <button className="iconBtn" onClick={() => startEditAcademic(r)}><MdEdit /></button>
                  <button className="iconBtn danger" onClick={() => confirmDeleteAcademic(r.fld_academic_id)}><MdDelete /></button>
                </div>
              </div>
            ))}
          </div>
        ) : !(showAddForm && activeTab === 'academic') && <p className="emptyText">No academic records added yet.</p>}
      </div>
    );
  };

  return (
    <div className="layout">
      <StudentSidebar />
      <main className="main">
        <div className="content">
          <div className="pageHeader"><h1 className="pageTitle">Profile</h1><hr className="divider" /></div>

          {/* Profile Header */}
          {profileData?.personal && (
            <div className="profileHeader">
              <FaUserCircle className="profileAvatar" />
              <div>
                <h2>{profileData.personal.fld_fname} {profileData.personal.fld_lname}</h2>
                <p>{profileData.personal.fld_studnum} • {profileData.personal.fld_username}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="tabs">
            {tabs.map(tab => (
              <button key={tab.key} className={`tab ${activeTab === tab.key ? 'activeTab' : ''}`}
                onClick={() => { setActiveTab(tab.key); cancelForm(); }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="card">
            {loading ? <p style={{padding:'1rem'}}>Loading profile...</p> : (
              <>
                {activeTab === 'personal' && renderPersonal()}
                {activeTab === 'emergency' && renderEmergency()}
                {activeTab === 'family' && renderFamily()}
                {activeTab === 'academic' && renderAcademic()}
              </>
            )}
          </div>
        </div>
      </main>

      <ConfirmModal show={confirmModal.show} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal({show:false,title:'',message:'',onConfirm:null})} confirmText="Delete" variant="danger" />
      <AlertModal show={alertModal.show} title={alertModal.title} message={alertModal.message} variant={alertModal.variant} onClose={() => setAlertModal({show:false,title:'',message:'',variant:'success'})} />
    </div>
  );
}

export default StudentProfile;
