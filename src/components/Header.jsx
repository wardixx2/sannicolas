export default function Header({ user, onLogout }) {
  return (
    <header style={{
      height: '60px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px'
    }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>
          Barangay San Nicolas Portal
        </h3>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '14px', color: '#4b5563' }}>
          👤 {user?.email}
        </span>
        <button
          onClick={onLogout}
          style={{
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </header>
  )
}