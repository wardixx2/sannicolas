import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { FileText, RefreshCw, Printer, ArrowLeft } from 'lucide-react'

export default function DocumentServices() {
  const [requestsList, setRequestsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('All')

  // View States: 'list' | 'print_view'
  const [currentView, setCurrentView] = useState('list')
  const [printData, setPrintData] = useState({
    resident_name: '',
    age: '21',
    purok: 'Purok 1',
    document_type: 'Barangay Certification',
    purpose: '',
    date_issued_day: '4th',
    date_issued_month: 'November',
    date_issued_year: '2026',
    punong_barangay: 'NORBERTO J. PODADOR',
    kagawad_1: 'Rolando M. Rodel',
    kagawad_2: 'Norman L. Cortejos',
    kagawad_3: 'Rosemarie G. Patigdas',
    kagawad_4: 'Lucena L. Basio',
    kagawad_5: 'Alberto L. Belamia',
    kagawad_6: 'Merlyna L. Patigdas',
    kagawad_7: 'Anecita S. Balili',
    sk_chairperson: 'Archie P. Magallon',
    secretary: 'Jessica S. Poquita',
    treasurer: 'Jovie I. Lanoy'
  })

  useEffect(() => {
    fetchDocumentRequests()
  }, [])

  const fetchDocumentRequests = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('document_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching document requests:', error)
    } else {
      setRequestsList(data || [])
    }
    setLoading(false)
  }

  // Update Status function
  const handleUpdateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('document_requests')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      alert('Error updating status: ' + error.message)
    } else {
      fetchDocumentRequests()
    }
  }

  // Open Full-Page Print View with Resident Data
  const handleOpenPrintView = (req) => {
    setPrintData({
      resident_name: req.resident_name || req.email || '',
      age: req.age || '21',
      purok: req.purok || 'Purok 1',
      document_type: req.document_type || 'Barangay Certification',
      purpose: req.purpose || 'Personal Records',
      date_issued_day: '4th',
      date_issued_month: 'November',
      date_issued_year: '2026',
      punong_barangay: 'NORBERTO J. PODADOR',
      kagawad_1: 'Rolando M. Rodel',
      kagawad_2: 'Norman L. Cortejos',
      kagawad_3: 'Rosemarie G. Patigdas',
      kagawad_4: 'Lucena L. Basio',
      kagawad_5: 'Alberto L. Belamia',
      kagawad_6: 'Merlyna L. Patigdas',
      kagawad_7: 'Anecita S. Balili',
      sk_chairperson: 'Archie P. Magallon',
      secretary: 'Jessica S. Poquita',
      treasurer: 'Jovie I. Lanoy'
    })
    setCurrentView('print_view')
  }

  const handlePrintChange = (e) => {
    setPrintData({ ...printData, [e.target.name]: e.target.value })
  }

  const filteredRequests = requestsList.filter(req => {
    if (filterStatus === 'All') return true
    return req.status?.toLowerCase() === filterStatus.toLowerCase()
  })

  return (
    <div className="admin-dashboard-wrapper">
      
      {/* CSS para sakupin ang buong pahina ng bond paper at alisin ang browser margins */}
      <style>{`
        @page {
          size: auto;
          margin: 0mm;
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible !important;
          }
          #printable-certificate {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 40px !important;
            background-color: #fff !important;
          }
        }
      `}</style>

      {/* ========================================== */}
      {/* VIEW 1: DOCUMENT REQUESTS TABLE */}
      {/* ========================================== */}
      {currentView === 'list' && (
        <>
          <div className="dashboard-top-flex">
            <div>
              <h1 className="dash-title">Document Services & Issuance</h1>
              <p className="dash-subtitle">Pamamahala at pag-apruba ng mga online document requests ng mga residente.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={fetchDocumentRequests} className="btn-refresh-clean">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          {/* FILTER TABS */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
            {['All', 'Pending', 'Approved', 'Released'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: filterStatus === status ? '1px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: filterStatus === status ? '#2563eb' : '#ffffff',
                  color: filterStatus === status ? '#ffffff' : '#334155'
                }}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="admin-panel-card">
            <div className="panel-top-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#2563eb" />
                <h3 className="panel-heading-title" style={{ margin: 0 }}>Incoming Document Applications ({filteredRequests.length})</h3>
              </div>
              <span className="live-status-pill">Live Database Sync</span>
            </div>
            <div className="panel-divider-line"></div>

            {loading ? (
              <div className="table-state-box">Naglo-load ng mga request...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="table-state-box">Walang nakitang document request sa kategoryang ito.</div>
            ) : (
              <table className="pro-admin-table">
                <thead>
                  <tr>
                    <th>Residente & Contact</th>
                    <th>Uri ng Dokumento</th>
                    <th>Layunin (Purpose)</th>
                    <th>Petsa ng Request</th>
                    <th>Status</th>
                    <th>Mga Aksyon</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <strong>{req.resident_name || req.email}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Purok: {req.purok || 'N/A'} | {req.contact_no || 'N/A'}</div>
                      </td>
                      <td>
                        <strong>{req.document_type}</strong>
                      </td>
                      <td>{req.purpose}</td>
                      <td>{new Date(req.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`pro-status-tag ${req.status?.toLowerCase()}`}>
                          {req.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {req.status?.toLowerCase() === 'pending' && (
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'Approved')}
                              style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                            >
                              Approve
                            </button>
                          )}
                          {req.status?.toLowerCase() === 'approved' && (
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'Released')}
                              style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                            >
                              Mark as Released
                            </button>
                          )}
                          <button 
                            onClick={() => handleOpenPrintView(req)}
                            style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Printer size={12} /> Print
                          </button>
                        </div>
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
      {/* VIEW 2: FULL-PAGE PRINT PREVIEW & EDITOR */}
      {/* ========================================== */}
      {currentView === 'print_view' && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div className="dashboard-top-flex">
            <button onClick={() => setCurrentView('list')} style={{ background: '#fff', border: '1px solid #cbd5e1', color: '#334155', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} /> Back to Document Requests
            </button>
            <button 
              onClick={() => window.print()}
              style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <Printer size={16} /> Print Document Now
            </button>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '16px', alignItems: 'flex-start' }}>
            
            {/* LEFT SIDE: EDITABLE FIELDS PANEL */}
            <div style={{ width: '360px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#2563eb', fontWeight: '800' }}>Edit Certificate Details</h4>
              
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>Resident Full Name</label>
                <input type="text" name="resident_name" value={printData.resident_name} onChange={handlePrintChange} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>Age</label>
                  <input type="text" name="age" value={printData.age} onChange={handlePrintChange} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>Purok / Address</label>
                  <input type="text" name="purok" value={printData.purok} onChange={handlePrintChange} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>Document Type</label>
                <input type="text" name="document_type" value={printData.document_type} onChange={handlePrintChange} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>Purpose</label>
                <input type="text" name="purpose" value={printData.purpose} onChange={handlePrintChange} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>

              <h5 style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#0f172a', fontWeight: '800' }}>Date Issued</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                <input type="text" name="date_issued_day" value={printData.date_issued_day} onChange={handlePrintChange} placeholder="Day" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', boxSizing: 'border-box' }} />
                <input type="text" name="date_issued_month" value={printData.date_issued_month} onChange={handlePrintChange} placeholder="Month" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', boxSizing: 'border-box' }} />
                <input type="text" name="date_issued_year" value={printData.date_issued_year} onChange={handlePrintChange} placeholder="Year" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', boxSizing: 'border-box' }} />
              </div>

              <h5 style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#0f172a', fontWeight: '800' }}>Barangay Officials</h5>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748b' }}>Punong Barangay</label>
                <input type="text" name="punong_barangay" value={printData.punong_barangay} onChange={handlePrintChange} style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748b' }}>Kagawad 1</label>
                <input type="text" name="kagawad_1" value={printData.kagawad_1} onChange={handlePrintChange} style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748b' }}>Kagawad 2</label>
                <input type="text" name="kagawad_2" value={printData.kagawad_2} onChange={handlePrintChange} style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748b' }}>Secretary</label>
                <input type="text" name="secretary" value={printData.secretary} onChange={handlePrintChange} style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748b' }}>Treasurer</label>
                <input type="text" name="treasurer" value={printData.treasurer} onChange={handlePrintChange} style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* RIGHT SIDE: LIVE DOCUMENT CERTIFICATE PREVIEW */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', backgroundColor: '#e2e8f0', padding: '20px', borderRadius: '10px' }}>
              
              {/* CERTIFICATE PAPER LAYOUT */}
              <div id="printable-certificate" style={{
                width: '790px', minHeight: '1080px', backgroundColor: '#fff', padding: '50px 60px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', boxSizing: 'border-box', position: 'relative',
                fontFamily: 'Times New Roman, serif', color: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
              }}>
                
                <div>
                  {/* Header */}
                  <div style={{ textAlign: 'center', fontSize: '13px', lineHeight: '1.5' }}>
                    Republic of the Philippines<br />
                    Province of Zambales<br />
                    Municipality of Castillejos<br />
                    <strong style={{ fontSize: '14px' }}>BARANGAY SAN NICOLAS</strong><br />
                    <div style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '8px', borderBottom: '2px solid #000', paddingBottom: '6px' }}>
                      OFFICE OF THE PUNONG BARANGAY
                    </div>
                  </div>

                  {/* Main Content Layout with Sidebar */}
                  <div style={{ display: 'flex', marginTop: '35px', gap: '30px' }}>
                    
                    {/* LEFT SIDEBAR: OFFICIALS (PINALAKI ANG WIDTH AT FONT SIZE) */}
                    <div style={{
                      width: '230px', backgroundColor: '#eef2ed', border: '1px solid #cbd5e1',
                      padding: '16px 10px', fontSize: '12px', textAlign: 'center', boxSizing: 'border-box', height: 'fit-content'
                    }}>
                      <div style={{ fontWeight: 'bold', borderBottom: '1px solid #94a3b8', paddingBottom: '8px', marginBottom: '12px', fontSize: '13px' }}>
                        {printData.punong_barangay}<br />
                        <span style={{ fontStyle: 'italic', fontSize: '11px' }}>Punong Barangay</span>
                      </div>

                      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '11px', color: '#334155', letterSpacing: '0.5px' }}>BARANGAY KAGAWAD</div>
                      <div style={{ lineHeight: '1.9' }}>
                        {printData.kagawad_1}<br />
                        {printData.kagawad_2}<br />
                        {printData.kagawad_3}<br />
                        {printData.kagawad_4}<br />
                        {printData.kagawad_5}<br />
                        {printData.kagawad_6}<br />
                        {printData.kagawad_7}
                      </div>

                      <div style={{ marginTop: '20px', borderTop: '1px solid #cbd5e1', paddingTop: '12px' }}>
                        <strong style={{ fontSize: '12px' }}>{printData.sk_chairperson}</strong><br />
                        <span style={{ fontStyle: 'italic', fontSize: '11px' }}>SK Chairperson</span>
                      </div>

                      <div style={{ marginTop: '16px' }}>
                        <strong style={{ fontSize: '12px' }}>{printData.secretary}</strong><br />
                        <span style={{ fontStyle: 'italic', fontSize: '11px' }}>Barangay Secretary</span>
                      </div>

                      <div style={{ marginTop: '16px' }}>
                        <strong style={{ fontSize: '12px' }}>{printData.treasurer}</strong><br />
                        <span style={{ fontStyle: 'italic', fontSize: '11px' }}>Barangay Treasurer</span>
                      </div>
                    </div>

                    {/* RIGHT MAIN BODY */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                        <h2 style={{ margin: 0, fontSize: '26px', fontFamily: 'serif' }}>Barangay Certification</h2>
                        <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold' }}>({printData.document_type})</span>
                      </div>

                      <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '20px' }}>TO WHOM IT MAY CONCERN:</p>

                      <p style={{ fontSize: '14px', textAlign: 'justify', lineHeight: '2', textIndent: '50px', marginBottom: '18px' }}>
                        This is to certify that <strong>{printData.resident_name ? printData.resident_name.toUpperCase() : '[PANGALAN NG RESIDENTE]'}</strong>, {printData.age} years old, Filipino, and a bona-fide resident of {printData.purok}, Barangay San Nicolas, Municipality of Castillejos, Zambales.
                      </p>

                      <p style={{ fontSize: '14px', textAlign: 'justify', lineHeight: '2', textIndent: '50px', marginBottom: '18px' }}>
                        THIS FURTHER CERTIFIES that he/she is known to me as a person of good moral character, a law-abiding citizen, and has never violated any law, ordinance, or rule duly implemented by the government authorities.
                      </p>

                      <p style={{ fontSize: '14px', textAlign: 'justify', lineHeight: '2', textIndent: '50px', marginBottom: '25px' }}>
                        This certification is issued upon the request of the above-mention individual for <strong>{printData.purpose}</strong> purposes.
                      </p>

                      <p style={{ fontSize: '14px', textIndent: '50px', lineHeight: '2' }}>
                        DONE AND ISSUED this {printData.date_issued_day} day of {printData.date_issued_month}, {printData.date_issued_year} at Barangay San Nicolas, Castillejos, Zambales.
                      </p>
                    </div>

                  </div>
                </div>

                {/* Lower Section: Signatory & Footer Notes */}
                <div>
                  {/* Signatory */}
                  <div style={{ marginTop: '40px', textAlign: 'right', paddingRight: '30px' }}>
                    <div style={{ display: 'inline-block', textAlign: 'center' }}>
                      <strong style={{ borderBottom: '1.5px solid #000', display: 'block', paddingBottom: '3px', minWidth: '220px', fontSize: '14px' }}>
                        {printData.punong_barangay}
                      </strong>
                      <span style={{ fontSize: '12px' }}>Punong Barangay</span>
                    </div>
                  </div>

                  {/* Footer Notes */}
                  <div style={{ fontSize: '11px', marginTop: '40px', borderTop: '1px solid #cbd5e1', paddingTop: '10px', lineHeight: '1.5' }}>
                    Paid under OR. No: _______________<br />
                    Date: _______________, 2026<br />
                    At: San Nicolas, Castillejos, Zambales
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}