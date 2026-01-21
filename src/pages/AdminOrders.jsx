import AdminLayout from '../components/AdminLayout'

const AdminOrders = () => {
  return (
    <AdminLayout>
      <section className="admin-page-section">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Beställningar</h1>
          <p className="admin-page-subtitle">Hantera beställningar</p>
        </div>

        <div className="admin-page-content">
          <div className="admin-empty">
            <p>Beställningshantering kommer snart...</p>
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}

export default AdminOrders
