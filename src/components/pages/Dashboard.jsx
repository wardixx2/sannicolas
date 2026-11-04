import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  RefreshCw 
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import './Dashboard.css'

// Rehistrahin ang Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalResidents: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalBlotter: 0
  })
  
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const { count: residentCount } = await supabase
        .from('residents')
        .select('*', { count: 'exact', head: true })

      const { data: requests } = await supabase
        .from('document_requests')
        .select('*')
        .order('created_at', { ascending: false })

      const pending = requests ? requests.filter(r => r.status?.toLowerCase() === 'pending').length : 0
      const approved = requests ? requests.filter(r => r.status?.toLowerCase() === 'approved' || r.status?.toLowerCase() === 'released' || r.status?.toLowerCase() === 'ready').length : 0

      const { count: blotterCount } = await supabase
        .from('blotter_records')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalResidents: residentCount || 0,
        pendingRequests: pending,
        approvedRequests: approved,
        totalBlotter: blotterCount || 0
      })

      if (requests) {
        setRecentRequests(requests.slice(0, 5))
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err)
    }
    setLoading(false)
  }

  // --- CHART DATA CONFIGURATION ---
  const barChartData = {
    labels: ['Clearance', 'Indigency', 'Residency', 'Business Permit'],
    datasets: [
      {
        label: 'Bilang ng Requests',
        data: [12, 19, 7, 5],
        backgroundColor: '#2563eb',
        borderRadius: 6,
      },
    ],
  }

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } }
    }
  }

  const doughnutData = {
    labels: ['Pending', 'Approved/Ready'],
    datasets: [
      {
        data: [stats.pendingRequests, stats.approvedRequests],
        backgroundColor: ['#ea580c', '#16a34a'],
        borderWidth: 0,
      },
    ],
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
    },
  }

  return (
    <div className="admin-dashboard-wrapper">
      <div className="dashboard-top-flex">
        <div>
          <h1 className="dash-title">Admin Dashboard</h1>
          <p className="dash-subtitle">Barangay San Nicolas, Castillejos, Zambales - Management Portal</p>
        </div>
        <button onClick={fetchDashboardData} className="btn-refresh-clean">
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* STATS CARDS WITH LUCIDE ICONS */}
      <div className="admin-stats-grid">
        <div className="admin-stat-box">
          <div className="stat-icon-wrap blue">
            <Users size={22} />
          </div>
          <div>
            <div className="stat-label-text">TOTAL RESIDENTS</div>
            <div className="stat-number-val">{loading ? '...' : stats.totalResidents}</div>
          </div>
        </div>

        <div className="admin-stat-box">
          <div className="stat-icon-wrap amber">
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-label-text">PENDING REQUESTS</div>
            <div className="stat-number-val">{loading ? '...' : stats.pendingRequests}</div>
          </div>
        </div>

        <div className="admin-stat-box">
          <div className="stat-icon-wrap green">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="stat-label-text">APPROVED / READY</div>
            <div className="stat-number-val">{loading ? '...' : stats.approvedRequests}</div>
          </div>
        </div>

        <div className="admin-stat-box">
          <div className="stat-icon-wrap purple">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="stat-label-text">BLOTTER RECORDS</div>
            <div className="stat-number-val">{loading ? '...' : stats.totalBlotter}</div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="charts-grid-container">
        <div className="admin-panel-card chart-box">
          <h3 className="panel-heading-title">Document Requests Overview</h3>
          <div className="panel-divider-line"></div>
          <div className="chart-inner-wrapper">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        <div className="admin-panel-card chart-box">
          <h3 className="panel-heading-title">Request Status Ratio</h3>
          <div className="panel-divider-line"></div>
          <div className="chart-inner-wrapper doughnut-wrapper">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* TABLE PANEL */}
      <div className="admin-panel-card">
        <div className="panel-top-row">
          <h3 className="panel-heading-title">Recent Online Document Requests</h3>
          <span className="live-status-pill">Live Sync</span>
        </div>
        <div className="panel-divider-line"></div>

        {loading ? (
          <div className="table-state-box">Loading records...</div>
        ) : recentRequests.length === 0 ? (
          <div className="table-state-box">Wala pang natatanggap na online document request.</div>
        ) : (
          <table className="pro-admin-table">
            <thead>
              <tr>
                <th>Resident Name</th>
                <th>Document Type</th>
                <th>Purpose</th>
                <th>Date Requested</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((req) => (
                <tr key={req.id}>
                  <td><strong>{req.resident_name || req.email}</strong></td>
                  <td>{req.document_type}</td>
                  <td>{req.purpose}</td>
                  <td>{new Date(req.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`pro-status-tag ${req.status?.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}