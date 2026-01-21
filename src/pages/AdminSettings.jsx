import AdminLayout from '../components/AdminLayout'

const AdminSettings = () => {
  return (
    <AdminLayout>
      <section className="admin-page-section">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Inställningar</h1>
          <p className="admin-page-subtitle">Webbplatsinställningar</p>
        </div>

        <div className="admin-page-content">
          <div className="admin-empty">
            <p>Inställningar kommer snart...</p>
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}

export default AdminSettings
