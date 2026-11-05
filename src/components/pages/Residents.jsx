import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { 
  Users, 
  Search, 
  RefreshCw, 
  Phone, 
  MapPin, 
  UserPlus, 
  Eye, 
  Calendar, 
  User, 
  Mail, 
  Home, 
  ArrowLeft, 
  Edit3, 
  Save, 
  X, 
  Heart, 
  Accessibility,
  ShieldCheck,
  Layers,
  Trash2
} from 'lucide-react'
import './Residents.css'

export default function Residents() {
  const [residentsList, setResidentsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLeaderOnly, setFilterLeaderOnly] = useState(false)

  // View States: 'list' | 'view_profile' | 'add_resident' | 'household_members'
  const [currentView, setCurrentView] = useState('list')
  const [selectedResident, setSelectedResident] = useState(null)
  const [householdMembers, setHouseholdMembers] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Resident Since Type State ('since_birth' or 'custom_date')
  const [sinceType, setSinceType] = useState('since_birth')

  // Form State para sa Add / Edit
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: '',
    contact_no: '',
    birth_date: '',
    purok: 'Purok 1',
    street_address: '',
    civil_status: 'Single',
    gender: 'Male',
    household_no: '',
    house_leader: '', 
    resident_since: '',
    life_status: 'Alive',
    is_pwd: 'No',
    role_type: 'Member' 
  })

  useEffect(() => {
    fetchResidents()
  }, [])

  const fetchResidents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching residents:', error)
    } else {
      setResidentsList(data || [])
    }
    setLoading(false)
  }

  // --- HELPER FUNCTION: Calculate Age ---
  const calculateAge = (birthdate) => {
    if (!birthdate) return 'N/A'
    const birthDateObj = new Date(birthdate)
    const today = new Date()
    let age = today.getFullYear() - birthDateObj.getFullYear()
    const m = today.getMonth() - birthDateObj.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--
    }
    return age >= 0 ? `${age} years old` : 'N/A'
  }

  // --- HELPER FUNCTION: Calculate Years as Resident ---
  const calculateYearsAsResident = (residentSinceDate, birthdate, isSinceBirth) => {
    const targetDate = isSinceBirth === 'Yes' || residentSinceDate === 'Since Birth' ? birthdate : residentSinceDate
    if (!targetDate) return 'N/A'
    
    const startDate = new Date(targetDate)
    const today = new Date()
    let years = today.getFullYear() - startDate.getFullYear()
    const m = today.getMonth() - startDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < startDate.getDate())) {
      years--
    }
    if (isNaN(years) || years < 0) return 'N/A'
    if (years === 0) return 'Less than a year in barangay'
    return `${years} ${years === 1 ? 'year' : 'years'} as resident`
  }

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'resident_since_option') {
      setSinceType(value)
      if (value === 'since_birth') {
        setFormData({ ...formData, resident_since: 'Since Birth' })
      } else {
        setFormData({ ...formData, resident_since: formData.birth_date || '' })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  // Open Full View Profile
  const handleOpenViewProfile = (resident) => {
    setSelectedResident(resident)
    const isBirth = resident.resident_since === 'Since Birth'
    setSinceType(isBirth ? 'since_birth' : 'custom_date')

    setFormData({
      first_name: resident.first_name || '',
      middle_name: resident.middle_name || '',
      last_name: resident.last_name || '',
      suffix: resident.suffix || '',
      email: resident.email || '',
      contact_no: resident.contact_no || '',
      birth_date: resident.birth_date || '',
      purok: resident.purok || 'Purok 1',
      street_address: resident.street_address || '',
      civil_status: resident.civil_status || 'Single',
      gender: resident.gender || 'Male',
      household_no: resident.household_no || '',
      house_leader: resident.house_leader || '',
      resident_since: resident.resident_since || '',
      life_status: resident.life_status || 'Alive',
      is_pwd: resident.is_pwd || 'No',
      role_type: resident.role_type || 'Member'
    })
    setIsEditing(false)
    setCurrentView('view_profile')
  }

  // View Household Members
  const handleViewHouseholdMembers = (resident) => {
    setSelectedResident(resident)
    if (!resident.household_no) {
      setHouseholdMembers([])
    } else {
      const members = residentsList.filter(
        r => r.household_no === resident.household_no && r.id !== resident.id
      )
      setHouseholdMembers(members)
    }
    setCurrentView('household_members')
  }

  // Open Add New Resident View
  const handleOpenAddView = () => {
    setSinceType('since_birth')
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      suffix: '',
      email: '',
      contact_no: '',
      birth_date: '',
      purok: 'Purok 1',
      street_address: '',
      civil_status: 'Single',
      gender: 'Male',
      household_no: '',
      house_leader: '',
      resident_since: 'Since Birth',
      life_status: 'Alive',
      is_pwd: 'No',
      role_type: 'Member'
    })
    setCurrentView('add_resident')
  }

  // Save New Resident
  const handleAddResident = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const full_name = `${formData.first_name} ${formData.middle_name ? formData.middle_name + ' ' : ''}${formData.last_name} ${formData.suffix}`.trim()
    const finalResidentSince = sinceType === 'since_birth' ? 'Since Birth' : formData.resident_since

    const { error } = await supabase
      .from('residents')
      .insert([{
        ...formData,
        resident_since: finalResidentSince,
        full_name,
        address: `${formData.street_address}, ${formData.purok}, San Nicolas, Castillejos, Zambales`
      }])

    if (error) {
      alert('Error adding resident: ' + error.message)
    } else {
      alert('New resident successfully added!')
      fetchResidents()
      setCurrentView('list')
    }
    setSubmitting(false)
  }

  // Update Existing Resident Profile
  const handleUpdateResident = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const full_name = `${formData.first_name} ${formData.middle_name ? formData.middle_name + ' ' : ''}${formData.last_name} ${formData.suffix}`.trim()
    const finalResidentSince = sinceType === 'since_birth' ? 'Since Birth' : formData.resident_since

    const { data, error } = await supabase
      .from('residents')
      .update({
        ...formData,
        resident_since: finalResidentSince,
        full_name,
        address: `${formData.street_address}, ${formData.purok}, San Nicolas, Castillejos, Zambales`
      })
      .eq('id', selectedResident.id)
      .select()

    if (error) {
      alert('Error updating profile: ' + error.message)
    } else {
      alert('Resident profile updated successfully!')
      if (data && data.length > 0) {
        setSelectedResident(data[0])
      }
      setIsEditing(false)
      fetchResidents()
    }
    setSubmitting(false)
  }

  // --- DELETE RESIDENT ACTION ---
  const handleDeleteResident = async () => {
    if (!selectedResident) return

    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedResident.full_name || 'this resident'}? This action cannot be undone.`)
    if (!confirmDelete) return

    setSubmitting(true)
    const { error } = await supabase
      .from('residents')
      .delete()
      .eq('id', selectedResident.id)

    if (error) {
      alert('Error deleting resident: ' + error.message)
      setSubmitting(false)
    } else {
      alert('Resident record successfully deleted.')
      fetchResidents()
      setCurrentView('list')
      setSubmitting(false)
    }
  }

  // Filter residents
  const filteredResidents = residentsList.filter(res => {
    const query = searchTerm.toLowerCase()
    const fullName = (res.full_name || `${res.first_name} ${res.last_name}`).toLowerCase()
    const purok = (res.purok || '').toLowerCase()
    const email = (res.email || '').toLowerCase()
    
    const matchesSearch = fullName.includes(query) || purok.includes(query) || email.includes(query)
    
    if (filterLeaderOnly) {
      return matchesSearch && res.role_type === 'House Leader'
    }
    return matchesSearch
  })

  // House Leaders List for dropdown selection
  const houseLeadersList = residentsList.filter(r => r.role_type === 'House Leader')

  return (
    <div className="admin-dashboard-wrapper">
      
      {/* ========================================== */}
      {/* VIEW 1: RESIDENTS DIRECTORY TABLE */}
      {/* ========================================== */}
      {currentView === 'list' && (
        <>
          <div className="dashboard-top-flex">
            <div>
              <h1 className="dash-title">Registered Residents</h1>
              <p className="dash-subtitle">Management and directory of official residents in Barangay San Nicolas.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={fetchResidents} className="btn-refresh-clean">
                <RefreshCw size={14} /> Refresh
              </button>
              <button onClick={handleOpenAddView} className="btn-add-resident">
                <UserPlus size={15} /> Add New Resident
              </button>
            </div>
          </div>

          <div className="admin-panel-card">
            <div className="panel-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} color="#2563eb" />
                  <h3 className="panel-heading-title" style={{ margin: 0 }}>Resident Directory ({filteredResidents.length})</h3>
                </div>

                {/* HOUSE LEADER FILTER BUTTON */}
                <button
                  onClick={() => setFilterLeaderOnly(!filterLeaderOnly)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: filterLeaderOnly ? '1px solid #16a34a' : '1px solid #cbd5e1',
                    backgroundColor: filterLeaderOnly ? '#f0fdf4' : '#ffffff',
                    color: filterLeaderOnly ? '#16a34a' : '#334155'
                  }}
                >
                  <ShieldCheck size={14} />
                  {filterLeaderOnly ? 'Showing House Leaders Only' : 'Filter House Leaders'}
                </button>
              </div>

              {/* STYLISH MODERN SEARCH BAR */}
              <div className="modern-search-wrapper">
                <Search size={16} className="search-bar-icon" />
                <input 
                  type="text" 
                  placeholder="Search by name, purok, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-search-input"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="search-clear-btn">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="panel-divider-line"></div>

            {loading ? (
              <div className="table-state-box">Loading residents...</div>
            ) : filteredResidents.length === 0 ? (
              <div className="table-state-box">No resident records found.</div>
            ) : (
              <table className="pro-admin-table">
                <thead>
                  <tr>
                    <th>Resident Name</th>
                    <th>Role / Status</th>
                    <th>Email / Contact</th>
                    <th>Purok & Address</th>
                    <th>Status / PWD</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResidents.map((res) => (
                    <tr key={res.id}>
                      <td>
                        <strong>{res.full_name || `${res.first_name || ''} ${res.last_name || ''}`.trim() || 'No Name'}</strong>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Household: {res.household_no || 'N/A'}</div>
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: res.role_type === 'House Leader' ? '#f0fdf4' : '#f1f5f9',
                          color: res.role_type === 'House Leader' ? '#16a34a' : '#475569',
                          border: res.role_type === 'House Leader' ? '1px solid #bbf7d0' : '1px solid #cbd5e1'
                        }}>
                          {res.role_type || 'Member'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{res.email || 'N/A'}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          <Phone size={11} /> {res.contact_no || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} color="#2563eb" /> {res.purok || 'Purok 1'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{res.street_address || 'San Nicolas, Castillejos'}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <span className={`status-pill ${res.life_status === 'Deceased' ? 'deceased' : 'alive'}`}>
                            {res.life_status || 'Alive'}
                          </span>
                          {res.is_pwd === 'Yes' && <span className="pwd-badge">PWD</span>}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Age: {calculateAge(res.birth_date)}</div>
                      </td>
                      <td>
                        <button onClick={() => handleOpenViewProfile(res)} className="btn-view-profile">
                          <Eye size={13} /> View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ========================================== */}
      {/* VIEW 2: FULL PAGE RESIDENT PROFILE & EDIT */}
      {/* ========================================== */}
      {currentView === 'view_profile' && selectedResident && (
        <div className="full-view-container">
          <div className="dashboard-top-flex">
            <button onClick={() => setCurrentView('list')} className="btn-back">
              <ArrowLeft size={16} /> Back to Residents Directory
            </button>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => handleViewHouseholdMembers(selectedResident)} 
                style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Layers size={14} /> View House Members ({selectedResident.household_no ? residentsList.filter(r => r.household_no === selectedResident.household_no).length : 1})
              </button>

              {!isEditing ? (
                <>
                  <button onClick={() => setIsEditing(true)} className="btn-edit-mode">
                    <Edit3 size={15} /> Edit Profile
                  </button>
                  <button onClick={handleDeleteResident} className="btn-delete-mode">
                    <Trash2 size={15} /> Delete Resident
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(false)} className="btn-cancel-mode">
                  <X size={15} /> Cancel Edit
                </button>
              )}
            </div>
          </div>

          <div className="admin-panel-card" style={{ marginTop: '16px' }}>
            <div className="panel-top-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={24} color="#2563eb" />
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>
                    {selectedResident.full_name || `${selectedResident.first_name} ${selectedResident.last_name}`}
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    Resident ID: #{selectedResident.id} | Recorded on {new Date(selectedResident.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  backgroundColor: formData.role_type === 'House Leader' ? '#f0fdf4' : '#f1f5f9',
                  color: formData.role_type === 'House Leader' ? '#16a34a' : '#475569',
                  border: formData.role_type === 'House Leader' ? '1px solid #bbf7d0' : '1px solid #cbd5e1'
                }}>
                  {formData.role_type || 'Member'}
                </span>
                <span className={`status-pill ${formData.life_status === 'Deceased' ? 'deceased' : 'alive'}`}>
                  {formData.life_status}
                </span>
                {formData.is_pwd === 'Yes' && <span className="pwd-badge">PWD Person</span>}
              </div>
            </div>

            <div className="panel-divider-line"></div>

            {!isEditing ? (
              /* --- VIEW ONLY MODE --- */
              <div className="profile-full-grid">
                <div className="profile-card-section">
                  <h4 className="section-title"><User size={14} /> Personal Information</h4>
                  <div className="info-row"><span className="info-label">Role / Status:</span> <span className="info-value" style={{ fontWeight: '700', color: selectedResident.role_type === 'House Leader' ? '#16a34a' : '#0f172a' }}>{selectedResident.role_type || 'Member'}</span></div>
                  <div className="info-row"><span className="info-label">First Name:</span> <span className="info-value">{selectedResident.first_name || 'N/A'}</span></div>
                  <div className="info-row"><span className="info-label">Middle Name:</span> <span className="info-value">{selectedResident.middle_name || 'N/A'}</span></div>
                  <div className="info-row"><span className="info-label">Last Name:</span> <span className="info-value">{selectedResident.last_name || 'N/A'}</span></div>
                  <div className="info-row"><span className="info-label">Suffix:</span> <span className="info-value">{selectedResident.suffix || 'None'}</span></div>
                  <div className="info-row"><span className="info-label">Birthdate:</span> <span className="info-value">{selectedResident.birth_date || 'N/A'}</span></div>
                  <div className="info-row"><span className="info-label">Current Age:</span> <span className="info-value" style={{ color: '#2563eb' }}>{calculateAge(selectedResident.birth_date)}</span></div>
                  <div className="info-row"><span className="info-label">Gender:</span> <span className="info-value">{selectedResident.gender || 'N/A'}</span></div>
                  <div className="info-row"><span className="info-label">Civil Status:</span> <span className="info-value">{selectedResident.civil_status || 'N/A'}</span></div>
                </div>

                <div className="profile-card-section">
                  <h4 className="section-title"><Home size={14} /> Address & Household</h4>
                  <div className="info-row"><span className="info-label">Household No.:</span> <span className="info-value">{selectedResident.household_no || 'N/A'}</span></div>
                  <div className="info-row"><span className="info-label">House Leader:</span> <span className="info-value" style={{ fontWeight: '700', color: '#2563eb' }}>{selectedResident.house_leader || 'N/A'}</span></div>
                  <div className="info-row"><span className="info-label">Email Address:</span> <span className="info-value">{selectedResident.email || 'N/A'}</span></div>
                  <div className="info-row"><span className="info-label">Contact Number:</span> <span className="info-value">{selectedResident.contact_no || 'N/A'}</span></div>
                  <div className="info-row"><span className="info-label">Purok:</span> <span className="info-value">{selectedResident.purok || 'Purok 1'}</span></div>
                  <div className="info-row"><span className="info-label">Street Address:</span> <span className="info-value">{selectedResident.street_address || 'N/A'}</span></div>
                </div>

                <div className="profile-card-section full-span">
                  <h4 className="section-title"><Heart size={14} /> Residency & Status Attributes</h4>
                  <div className="info-triple-grid">
                    <div className="attribute-box">
                      <span className="attr-label"><Calendar size={12} /> Resident Since</span>
                      <span className="attr-value">{selectedResident.resident_since || 'N/A'}</span>
                      <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '700', marginTop: '2px' }}>
                        ({calculateYearsAsResident(selectedResident.resident_since, selectedResident.birth_date, selectedResident.resident_since === 'Since Birth' ? 'Yes' : 'No')})
                      </span>
                    </div>
                    <div className="attribute-box">
                      <span className="attr-label"><Heart size={12} /> Life Status</span>
                      <span className={`attr-value ${selectedResident.life_status === 'Deceased' ? 'red' : 'green'}`}>
                        {selectedResident.life_status || 'Alive'}
                      </span>
                    </div>
                    <div className="attribute-box">
                      <span className="attr-label"><Accessibility size={12} /> PWD Status</span>
                      <span className="attr-value">{selectedResident.is_pwd === 'Yes' ? 'Yes (Registered PWD)' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* --- COMPACT EDIT MODE FORM --- */
              <form onSubmit={handleUpdateResident} className="edit-profile-form">
                <h3 className="form-section-heading">Edit Personal Information</h3>
                <div className="form-grid-4">
                  <div>
                    <label className="form-label">Role / Designation</label>
                    <select name="role_type" value={formData.role_type} onChange={handleChange} className="form-input">
                      <option value="Member">Member</option>
                      <option value="House Leader">House Leader</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">First Name</label>
                    <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Middle Name</label>
                    <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className="form-input" />
                  </div>
                </div>

                <div className="form-grid-4">
                  <div>
                    <label className="form-label">Suffix</label>
                    <input type="text" name="suffix" placeholder="Jr., III" value={formData.suffix} onChange={handleChange} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Birthdate</label>
                    <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="form-input">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Civil Status</label>
                    <select name="civil_status" value={formData.civil_status} onChange={handleChange} className="form-input">
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                    </select>
                  </div>
                </div>

                <h3 className="form-section-heading">Contact & Location Details</h3>
                <div className="form-grid-4">
                  <div>
                    <label className="form-label">Email Address</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Contact Number</label>
                    <input type="text" name="contact_no" value={formData.contact_no} onChange={handleChange} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Purok</label>
                    <select name="purok" value={formData.purok} onChange={handleChange} className="form-input">
                      <option value="Purok 1">Purok 1</option>
                      <option value="Purok 2">Purok 2</option>
                      <option value="Purok 3">Purok 3</option>
                      <option value="Purok 4">Purok 4</option>
                      <option value="Purok 5">Purok 5</option>
                      <option value="Purok 6">Purok 6</option>
                      <option value="Purok 7">Purok 7</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Household No.</label>
                    <input type="text" name="household_no" value={formData.household_no} onChange={handleChange} className="form-input" />
                  </div>
                </div>

                <div className="form-grid-4">
                  <div>
                    <label className="form-label">House Leader</label>
                    <select name="house_leader" value={formData.house_leader} onChange={handleChange} className="form-input">
                      <option value="">-- Select House Leader --</option>
                      {houseLeadersList.map(leader => {
                        const leaderName = leader.full_name || `${leader.first_name} ${leader.last_name}`
                        return (
                          <option key={leader.id} value={leaderName}>{leaderName}</option>
                        )
                      })}
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 3' }}>
                    <label className="form-label">Street Address</label>
                    <input type="text" name="street_address" value={formData.street_address} onChange={handleChange} className="form-input" />
                  </div>
                </div>

                <h3 className="form-section-heading">Barangay Residency & Status Fields</h3>
                <div className="form-grid-4">
                  <div>
                    <label className="form-label">Resident Since</label>
                    <select name="resident_since_option" value={sinceType} onChange={handleChange} className="form-input" style={{ marginBottom: '4px' }}>
                      <option value="since_birth">Since Birth</option>
                      <option value="custom_date">Custom Date</option>
                    </select>
                    {sinceType === 'custom_date' && (
                      <input type="date" name="resident_since" value={formData.resident_since === 'Since Birth' ? '' : formData.resident_since} onChange={handleChange} className="form-input" />
                    )}
                  </div>
                  <div>
                    <label className="form-label">Life Status</label>
                    <select name="life_status" value={formData.life_status} onChange={handleChange} className="form-input">
                      <option value="Alive">Alive</option>
                      <option value="Deceased">Deceased</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">PWD Status</label>
                    <select name="is_pwd" value={formData.is_pwd} onChange={handleChange} className="form-input">
                      <option value="No">No</option>
                      <option value="Yes">Yes (PWD)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel-mode">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn-save-changes">
                    <Save size={15} /> {submitting ? 'Saving Changes...' : 'Save Profile Updates'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* VIEW 3: HOUSEHOLD MEMBERS LIST VIEW */}
      {/* ========================================== */}
      {currentView === 'household_members' && selectedResident && (
        <div className="full-view-container">
          <div className="dashboard-top-flex">
            <button onClick={() => setCurrentView('view_profile')} className="btn-back">
              <ArrowLeft size={16} /> Back to Resident Profile
            </button>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
              Household Members (Household No: {selectedResident.household_no || 'N/A'})
            </h2>
          </div>

          <div className="admin-panel-card" style={{ marginTop: '16px' }}>
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <strong>House Leader / Head: </strong> 
              <span style={{ color: '#2563eb', fontWeight: '700' }}>{selectedResident.house_leader || 'No assigned House Leader'}</span>
            </div>

            <div className="panel-divider-line"></div>

            {householdMembers.length === 0 ? (
              <div className="table-state-box">No other members found in this household number.</div>
            ) : (
              <table className="pro-admin-table">
                <thead>
                  <tr>
                    <th>Resident Name</th>
                    <th>Role (Designation)</th>
                    <th>Age & Gender</th>
                    <th>Contact Number</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {householdMembers.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <strong>{member.full_name || `${member.first_name} ${member.last_name}`}</strong>
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: member.role_type === 'House Leader' ? '#f0fdf4' : '#f1f5f9',
                          color: member.role_type === 'House Leader' ? '#16a34a' : '#475569',
                          border: member.role_type === 'House Leader' ? '1px solid #bbf7d0' : '1px solid #cbd5e1'
                        }}>
                          {member.role_type || 'Member'}
                        </span>
                      </td>
                      <td>{calculateAge(member.birth_date)} / {member.gender || 'N/A'}</td>
                      <td>{member.contact_no || 'N/A'}</td>
                      <td>
                        <button onClick={() => handleOpenViewProfile(member)} className="btn-view-profile">
                          <Eye size={13} /> View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* VIEW 4: ADD NEW RESIDENT FULL VIEW FORM */}
      {/* ========================================== */}
      {currentView === 'add_resident' && (
        <div className="full-view-container">
          <div className="dashboard-top-flex">
            <button onClick={() => setCurrentView('list')} className="btn-back">
              <ArrowLeft size={16} /> Back to Directory
            </button>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Add New Resident Profile</h2>
          </div>

          <div className="admin-panel-card" style={{ marginTop: '16px' }}>
            <form onSubmit={handleAddResident} className="edit-profile-form">
              <h3 className="form-section-heading">Personal Information</h3>
              <div className="form-grid-4">
                <div>
                  <label className="form-label">Role / Designation</label>
                  <select name="role_type" value={formData.role_type} onChange={handleChange} className="form-input">
                    <option value="Member">Member</option>
                    <option value="House Leader">House Leader</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">First Name</label>
                  <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Middle Name</label>
                  <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className="form-input" />
                </div>
              </div>

              <div className="form-grid-4">
                <div>
                  <label className="form-label">Suffix</label>
                  <input type="text" name="suffix" placeholder="Jr., III" value={formData.suffix} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Birthdate</label>
                  <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="form-input">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Civil Status</label>
                  <select name="civil_status" value={formData.civil_status} onChange={handleChange} className="form-input">
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>
              </div>

              <h3 className="form-section-heading">Contact & Address</h3>
              <div className="form-grid-4">
                <div>
                  <label className="form-label">Email Address</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Contact Number</label>
                  <input type="text" name="contact_no" placeholder="09XXXXXXXXX" value={formData.contact_no} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Purok</label>
                  <select name="purok" value={formData.purok} onChange={handleChange} className="form-input">
                    <option value="Purok 1">Purok 1</option>
                    <option value="Purok 2">Purok 2</option>
                    <option value="Purok 3">Purok 3</option>
                    <option value="Purok 4">Purok 4</option>
                    <option value="Purok 5">Purok 5</option>
                    <option value="Purok 6">Purok 6</option>
                    <option value="Purok 7">Purok 7</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Household No.</label>
                  <input type="text" name="household_no" placeholder="Ex. HH-001" value={formData.household_no} onChange={handleChange} className="form-input" />
                </div>
              </div>

              <div className="form-grid-4">
                <div>
                  <label className="form-label">House Leader</label>
                  <select name="house_leader" value={formData.house_leader} onChange={handleChange} className="form-input">
                    <option value="">-- Select House Leader --</option>
                    {houseLeadersList.map(leader => {
                      const leaderName = leader.full_name || `${leader.first_name} ${leader.last_name}`
                      return (
                        <option key={leader.id} value={leaderName}>{leaderName}</option>
                      )
                    })}
                  </select>
                </div>
                <div style={{ gridColumn: 'span 3' }}>
                  <label className="form-label">Street Address</label>
                  <input type="text" name="street_address" placeholder="House No. / Street Name" value={formData.street_address} onChange={handleChange} className="form-input" />
                </div>
              </div>

              <h3 className="form-section-heading">Residency & Special Status</h3>
              <div className="form-grid-4">
                <div>
                  <label className="form-label">Resident Since</label>
                  <select name="resident_since_option" value={sinceType} onChange={handleChange} className="form-input" style={{ marginBottom: '4px' }}>
                    <option value="since_birth">Since Birth</option>
                    <option value="custom_date">Custom Date</option>
                  </select>
                  {sinceType === 'custom_date' && (
                    <input type="date" name="resident_since" value={formData.resident_since === 'Since Birth' ? '' : formData.resident_since} onChange={handleChange} className="form-input" />
                  )}
                </div>
                <div>
                  <label className="form-label">Life Status</label>
                  <select name="life_status" value={formData.life_status} onChange={handleChange} className="form-input">
                    <option value="Alive">Alive</option>
                    <option value="Deceased">Deceased</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">PWD Status</label>
                  <select name="is_pwd" value={formData.is_pwd} onChange={handleChange} className="form-input">
                    <option value="No">No</option>
                    <option value="Yes">Yes (PWD)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setCurrentView('list')} className="btn-cancel-mode">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-save-changes">
                  {submitting ? 'Creating Profile...' : 'Save New Resident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}