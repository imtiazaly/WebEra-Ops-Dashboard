import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";
import { generateId } from "../utils/idGenerator";
import { formatCurrency, formatDate } from "../utils/formatters";

const STATUS_OPTIONS = ["Paid", "Pending"];

export default function Invoices() {
  const {
    invoices,
    projects,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    toggleInvoiceStatus,
  } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    projectId: "",
    clientName: "",
    amount: "",
    status: "Pending",
    dueDate: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalPending = invoices
      .filter((i) => i.status === "Pending")
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const totalPaid = invoices
      .filter((i) => i.status === "Paid")
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);
    return { totalPending, totalPaid, totalInvoices: invoices.length };
  }, [invoices]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch = inv.clientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const openAddModal = () => {
    setEditingInvoice(null);
    const defaultDueDate = new Date(Date.now() + 86400000 * 7)
      .toISOString()
      .split("T")[0];
    setFormData({
      projectId: projects[0]?.id || "",
      clientName: projects[0]?.clientName || "",
      amount: "",
      status: "Pending",
      dueDate: defaultDueDate,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (inv) => {
    setEditingInvoice(inv);
    setFormData({
      projectId: inv.projectId || "",
      clientName: inv.clientName,
      amount: inv.amount,
      status: inv.status,
      dueDate: inv.dueDate ? inv.dueDate.split("T")[0] : "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleProjectSelect = (e) => {
    const pId = e.target.value;
    const selectedProj = projects.find((p) => p.id === pId);
    setFormData((prev) => ({
      ...prev,
      projectId: pId,
      clientName: selectedProj ? selectedProj.clientName : prev.clientName,
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.clientName.trim())
      errors.clientName = "Client name is required.";
    if (!formData.amount || Number(formData.amount) <= 0) {
      errors.amount = "Amount must be a positive number.";
    }
    if (!formData.dueDate) {
      errors.dueDate = "Due date is required.";
    } else {
      const selected = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today && !editingInvoice) {
        errors.dueDate = "Due date cannot be in the past.";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      projectId: formData.projectId,
      clientName: formData.clientName.trim(),
      amount: Number(formData.amount),
      status: formData.status,
      dueDate: new Date(formData.dueDate).toISOString(),
    };

    if (editingInvoice) {
      updateInvoice(editingInvoice.id, payload);
    } else {
      addInvoice({
        id: generateId(),
        ...payload,
        createdAt: new Date().toISOString(),
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Invoices & Payments</h2>
          <p className="text-muted mb-0 small">
            Track billing, receivables, and payment status
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="bi bi-plus-lg me-1"></i> Create Invoice
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-danger bg-opacity-10">
            <div className="card-body p-3 d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-danger fw-bold mb-1 text-uppercase small">
                  Total Pending Receivables
                </h6>
                <h3 className="fw-bold text-danger mb-0">
                  {formatCurrency(metrics.totalPending)}
                </h3>
              </div>
              <div className="p-3 bg-danger bg-opacity-20 text-danger rounded-circle">
                <i className="bi bi-clock-history fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-success bg-opacity-10">
            <div className="card-body p-3 d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-success fw-bold mb-1 text-uppercase small">
                  Total Collected (Paid)
                </h6>
                <h3 className="fw-bold text-success mb-0">
                  {formatCurrency(metrics.totalPaid)}
                </h3>
              </div>
              <div className="p-3 bg-success bg-opacity-20 text-success rounded-circle">
                <i className="bi bi-check2-circle fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-primary bg-opacity-10">
            <div className="card-body p-3 d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-primary fw-bold mb-1 text-uppercase small">
                  Total Invoices
                </h6>
                <h3 className="fw-bold text-primary mb-0">
                  {metrics.totalInvoices}
                </h3>
              </div>
              <div className="p-3 bg-primary bg-opacity-20 text-primary rounded-circle">
                <i className="bi bi-receipt fs-3"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search by client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select bg-light"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Invoice Statuses</option>
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table / List */}
      {filteredInvoices.length === 0 ? (
        <EmptyState
          icon="bi-receipt"
          title="No Invoices Found"
          description={
            searchTerm || statusFilter !== "All"
              ? "Try adjusting your filters."
              : "Create your first client invoice."
          }
          actionText="Create Invoice"
          onAction={openAddModal}
        />
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Client Name</th>
                  <th>Linked Project</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Created Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  const linkedProj = projects.find(
                    (p) => p.id === inv.projectId,
                  );

                  return (
                    <tr key={inv.id}>
                      <td className="fw-bold">{inv.clientName}</td>
                      <td>
                        {linkedProj ? (
                          <span className="badge bg-secondary bg-opacity-10 text-dark">
                            <i className="bi bi-kanban me-1"></i>
                            {linkedProj.projectName}
                          </span>
                        ) : (
                          <span className="text-muted small">
                            General Invoice
                          </span>
                        )}
                      </td>
                      <td className="fw-bold text-dark">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td>
                        <button
                          className="btn p-0 border-0 bg-transparent text-start"
                          onClick={() => toggleInvoiceStatus(inv.id)}
                          title="Click to toggle Paid/Pending"
                        >
                          <StatusBadge status={inv.status} />
                          <i className="bi bi-arrow-repeat ms-1 text-muted small"></i>
                        </button>
                      </td>
                      <td className="text-muted small">
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="text-muted small">
                        {formatDate(inv.createdAt)}
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => openEditModal(inv)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setDeletingId(inv.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Link to Project (Optional)
                    </label>
                    <select
                      className="form-select"
                      value={formData.projectId}
                      onChange={handleProjectSelect}
                    >
                      <option value="">
                        -- Direct Client Invoice (No project link) --
                      </option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.projectName} ({p.clientName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.clientName ? "is-invalid" : ""}`}
                      value={formData.clientName}
                      onChange={(e) =>
                        setFormData({ ...formData, clientName: e.target.value })
                      }
                      placeholder="e.g. Faisal Tech Hub"
                    />
                    {formErrors.clientName && (
                      <div className="invalid-feedback">
                        {formErrors.clientName}
                      </div>
                    )}
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Amount (PKR) *
                      </label>
                      <input
                        type="number"
                        className={`form-control ${formErrors.amount ? "is-invalid" : ""}`}
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        placeholder="e.g. 45000"
                        min="1"
                      />
                      {formErrors.amount && (
                        <div className="invalid-feedback">
                          {formErrors.amount}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Payment Status
                      </label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Due Date *</label>
                    <input
                      type="date"
                      className={`form-control ${formErrors.dueDate ? "is-invalid" : ""}`}
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                    {formErrors.dueDate && (
                      <div className="invalid-feedback">
                        {formErrors.dueDate}
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingInvoice ? "Save Changes" : "Create Invoice"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          deleteInvoice(deletingId);
          setDeletingId(null);
        }}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice record? This cannot be undone."
      />
    </div>
  );
}
