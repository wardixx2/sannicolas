import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { Search, Plus, X, Wallet, Check, Ban } from 'lucide-react'
import './Finances.css'

export default function Finances() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)

  // Summary Metrics
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  })

  const [formData, setFormData] = useState({
    title: '',
    category: 'Administrative',
    type: 'Expense',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    description: '',
    proposed_by: '',
    status: 'Pending',
    approved_by: ''
  })

  useEffect(() => {
    fetchFinances()
  }, [])

  const fetchFinances = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('finances')
      .select('*')
      .order('transaction_date', { ascending: false })

    if (error) {
      console.error('Error fetching financial records:', error.message)
    } else if (data) {
      setTransactions(data)

      let income = 0
      let expense = 0

      data.forEach(item => {
        const val = parseFloat(item.amount) || 0
        if (item.type === 'Income') income += val
        if (item.type === 'Expense') expense += val
      })

      setSummary({
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense
      })
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount) || 0
    }

    const { error } = await supabase
      .from('finances')
      .insert([payload])

    if (error) {
      alert('Error saving record: ' + error.message)
    } else {
      alert('Financial transaction recorded successfully!')
      setShowModal(false)
      setFormData({
        title: '',
        category: 'Administrative',
        type: 'Expense',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
        proposed_by: '',
        status: 'Pending',
        approved_by: ''
      })
      fetchFinances()
    }
    setLoading(false)
  }

  // Function para mag-update ng Status (Approve / Not Approve)
  const handleUpdateStatus = async (id, newStatus) => {
    const approverName = prompt(`Ilagay ang pangalan ng nag-${newStatus === 'Approved' ? 'apruba' : 'tumanggi'} (e.g., Punong Barangay):`)
    if (!approverName) return // Kung kinansela o walang inilagay, itigil ang proseso

    setLoading(true)
    const { error } = await supabase
      .from('finances')
      .update({ 
        status: newStatus,
        approved_by: approverName 
      })
      .eq('id', id)

    if (error) {
      alert('Error updating status: ' + error.message)
    } else {
      fetchFinances()
    }
    setLoading(false)
  }

  const filteredTransactions = transactions.filter(t =>
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.proposed_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.approved_by?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="admin-dashboard-wrapper">
      {/* Page Header */}
      <div className="dashboard-top-flex">
        <div>
          <h1 className="dash-title">Budget & Expenses Tracker</h1>
          <p className="dash-subtitle">Monitor barangay budget allocations, revenues, and operational expenses.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-add-resident">
          <Plus size={16} /> Record Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="finance-summary-grid">
        <div className="finance-card income">
          <div className="label">Total Revenue / Budget</div>
          <div className="amount">₱{summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>

        <div className="finance-card expense">
          <div className="label">Total Expenses</div>
          <div className="amount">₱{summary.totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>

        <div className="finance-card balance">
          <div className="label">Remaining Balance</div>
          <div className="amount">₱{summary.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="admin-panel-card">
        {/* Action Bar */}
        <div className="panel-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={18} color="#2563eb" />
            <h3 className="panel-heading-title" style={{ margin: 0 }}>Financial Records ({filteredTransactions.length})</h3>
          </div>

          <div className="modern-search-wrapper">
            <Search size={16} className="search-bar-icon" />
            <input
              type="text"
              placeholder="Search title, category, proposer, status..."
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

        {/* Transactions Data Table */}
        <div className="table-responsive-container">
          <table className="pro-admin-table">
            <thead>
              <tr>
                <th>Title / Particulars</th>
                <th>Proposed By</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status / Approved By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="table-state-box">Loading financial logs...</td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-state-box">No financial transactions recorded.</td>
                </tr>
              ) : (
                filteredTransactions.map((item) => {
                  const currentStatus = item.status || 'Pending'
                  const isProcessed = currentStatus === 'Approved' || currentStatus === 'Not Approved'

                  return (
                    <tr key={item.id}>
                      <td><strong>{item.title}</strong></td>
                      <td>{item.proposed_by || 'N/A'}</td>
                      <td>{item.category}</td>
                      <td>
                        <span className={`status-pill ${item.type === 'Income' ? 'type-income' : 'type-expense'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 'bold', color: item.type === 'Income' ? '#059669' : '#dc2626' }}>
                        {item.type === 'Income' ? '+' : '-'}₱{parseFloat(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={`status-pill status-${currentStatus.toLowerCase().replace(' ', '-')}`}>
                            {currentStatus}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {item.approved_by ? `By: ${item.approved_by}` : 'No approver yet'}
                          </span>
                        </div>
                      </td>
                      <td>{item.transaction_date}</td>
                      <td>
                        {/* Kung na-proseso na (Approved / Not Approved), huwag nang ipakita ang buttons */}
                        {isProcessed ? (
                          <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', fontWeight: '500' }}>
                            Already Processed
                          </span>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'Approved')}
                              title="Approve"
                              style={{
                                background: '#f0fdf4',
                                color: '#16a34a',
                                border: '1px solid #bbf7d0',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'Not Approved')}
                              title="Not Approve"
                              style={{
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              <Ban size={14} /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Entry Form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', width: '100%', background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Record Financial Transaction</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label className="form-label">Transaction Title / Particulars</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Q1 IRA Allocation or Solar Streetlight Repair"
                  required
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="form-label">Proposed By</label>
                <input
                  type="text"
                  name="proposed_by"
                  value={formData.proposed_by}
                  onChange={handleChange}
                  placeholder="e.g., Kagawad Juan Dela Cruz / SK Chairman"
                  required
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="form-label">Transaction Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income / Budget</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="Administrative">Administrative & Office</option>
                    <option value="Infrastructure">Infrastructure & Public Works</option>
                    <option value="Health & Sanitation">Health & Sanitation</option>
                    <option value="Peace & Order">Peace & Order</option>
                    <option value="Youth & Sports">Youth & Sports (SK)</option>
                    <option value="Disaster / Calamity">Disaster Risk / Calamity</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="form-label">Amount (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    className="form-input"
                  />
                </div>

                <div className="input-group">
                  <label className="form-label">Transaction Date</label>
                  <input
                    type="date"
                    name="transaction_date"
                    value={formData.transaction_date}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="form-label">Description / OR Number / Remarks</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="form-input"
                  placeholder="Add Official Receipt (OR) number or details..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-cancel-mode"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-save-changes"
                >
                  {loading ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}