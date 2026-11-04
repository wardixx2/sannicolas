import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
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
    description: ''
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

      // Compute Total Income, Expenses & Net Balance
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
        description: ''
      })
      fetchFinances()
    }
    setLoading(false)
  }

  const filteredTransactions = transactions.filter(t =>
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="finances-container">
      {/* Page Header */}
      <div className="finances-header">
        <div>
          <h1 className="finances-title">Budget & Expenses Tracker</h1>
          <p className="finances-subtitle">Monitor barangay budget allocations, revenues, and operational expenses.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="add-btn">
          + Record Transaction
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

      {/* Search Bar */}
      <div className="action-bar">
        <input
          type="text"
          placeholder="Search by Title, Category, or Type (Income/Expense)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Transactions Data Table */}
      <div className="table-wrapper">
        <table className="residents-table">
          <thead>
            <tr>
              <th>Title / Particulars</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Description / Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading financial logs...</td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No financial transactions recorded.</td>
              </tr>
            ) : (
              filteredTransactions.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.title}</strong></td>
                  <td>{item.category}</td>
                  <td>
                    <span className={`badge ${item.type === 'Income' ? 'type-income' : 'type-expense'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 'bold', color: item.type === 'Income' ? '#059669' : '#dc2626' }}>
                    {item.type === 'Income' ? '+' : '-'}₱{parseFloat(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td>{item.transaction_date}</td>
                  <td>{item.description || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Entry Form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Record Financial Transaction</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
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

              <div className="form-row">
                <div>
                  <label className="form-label">Transaction Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="Expense">Expense (Gastos)</option>
                    <option value="Income">Income / Budget (Pondo)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-select"
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

              <div className="form-row">
                <div>
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

                <div>
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

              <div className="form-group">
                <label className="form-label">Description / OR Number / Remarks</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="form-input"
                  placeholder="Add Official Receipt (OR) number or details..."
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="save-btn"
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