import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useAI } from "../hooks/useAI";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { generateId } from "../utils/idGenerator";
import { formatDate } from "../utils/formatters";

const SERVICE_TYPES = ["WordPress", "Shopify", "UI/UX", "Full-Stack"];
const STATUS_OPTIONS = ["New", "Contacted", "Converted", "Lost"];
const COMPLEXITY_OPTIONS = ["Simple", "Medium", "Complex"];

export default function Leads() {
  const { leads, addLead, updateLead, deleteLead } = useApp();
  const { loading: aiLoading, error: aiError, generateLeadBrief } = useAI();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [serviceFilter, setServiceFilter] = useState("All");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    clientName: "",
    contact: "",
    rawMessage: "",
    serviceType: "WordPress",
    requirementsText: "",
    complexity: "Medium",
    suggestedPriceRange: "",
    status: "New",
  });
  const [formErrors, setFormErrors] = useState({});

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.contact.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || lead.status === statusFilter;
      const matchesService =
        serviceFilter === "All" || lead.serviceType === serviceFilter;
      return matchesSearch && matchesStatus && matchesService;
    });
  }, [leads, searchTerm, statusFilter, serviceFilter]);

  const openAddModal = () => {
    setEditingLead(null);
    setFormData({
      clientName: "",
      contact: "",
      rawMessage: "",
      serviceType: "WordPress",
      requirementsText: "",
      complexity: "Medium",
      suggestedPriceRange: "",
      status: "New",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setFormData({
      clientName: lead.clientName,
      contact: lead.contact,
      rawMessage: lead.rawMessage || "",
      serviceType: lead.serviceType,
      requirementsText: (lead.requirements || []).join("\n"),
      complexity: lead.complexity || "Medium",
      suggestedPriceRange: lead.suggestedPriceRange || "",
      status: lead.status,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleAiAssist = async () => {
    if (!formData.rawMessage.trim()) {
      setFormErrors((prev) => ({
        ...prev,
        rawMessage: "Please enter a raw message first.",
      }));
      return;
    }
    const result = await generateLeadBrief(formData.rawMessage);
    if (result) {
      setFormData((prev) => ({
        ...prev,
        serviceType: result.serviceType || prev.serviceType,
        requirementsText: Array.isArray(result.requirements)
          ? result.requirements.join("\n")
          : "",
        complexity: result.complexity || prev.complexity,
        suggestedPriceRange:
          result.suggestedPriceRange || prev.suggestedPriceRange,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.clientName.trim())
      errors.clientName = "Client name is required.";
    if (!formData.contact.trim())
      errors.contact = "Contact information is required.";
    if (!formData.rawMessage.trim())
      errors.rawMessage = "Raw inquiry message is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const requirementsArr = formData.requirementsText
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const payload = {
      clientName: formData.clientName.trim(),
      contact: formData.contact.trim(),
      rawMessage: formData.rawMessage.trim(),
      serviceType: formData.serviceType,
      requirements: requirementsArr,
      complexity: formData.complexity,
      suggestedPriceRange: formData.suggestedPriceRange.trim(),
      status: formData.status,
    };

    if (editingLead) {
      updateLead(editingLead.id, payload);
    } else {
      addLead({
        id: generateId(),
        ...payload,
        createdAt: new Date().toISOString(),
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header & Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Leads Manager</h2>
          <p className="text-muted mb-0 small">
            Track and convert incoming client inquiries
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="bi bi-plus-lg me-1"></i> Add New Lead
        </button>
      </div>

      {/* Search & Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search by client name or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select bg-light"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select bg-light"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
              >
                <option value="All">All Services</option>
                {SERVICE_TYPES.map((srv) => (
                  <option key={srv} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Leads List / Table */}
      {filteredLeads.length === 0 ? (
        <EmptyState
          icon="bi-people"
          title="No Leads Found"
          description={
            searchTerm || statusFilter !== "All"
              ? "Try adjusting your search filters."
              : "Add your first inquiry lead to get started."
          }
          actionText="Add Lead"
          onAction={openAddModal}
        />
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Complexity</th>
                  <th>Suggested Price</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div className="fw-bold">{lead.clientName}</div>
                      <small className="text-muted">
                        <i className="bi bi-telephone me-1"></i>
                        {lead.contact}
                      </small>
                    </td>
                    <td>
                      <span className="badge bg-secondary bg-opacity-10 text-dark">
                        {lead.serviceType}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${lead.complexity === "Complex" ? "bg-danger" : lead.complexity === "Medium" ? "bg-warning text-dark" : "bg-info text-dark"}`}
                      >
                        {lead.complexity || "Medium"}
                      </span>
                    </td>
                    <td className="fw-semibold text-success">
                      {lead.suggestedPriceRange || "N/A"}
                    </td>
                    <td>
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="text-muted small">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => openEditModal(lead)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setDeletingId(lead.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
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
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editingLead ? "Edit Lead" : "Add New Lead"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body py-3">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.clientName ? "is-invalid" : ""}`}
                        value={formData.clientName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            clientName: e.target.value,
                          })
                        }
                        placeholder="e.g. Ahmad Raza"
                      />
                      {formErrors.clientName && (
                        <div className="invalid-feedback">
                          {formErrors.clientName}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Contact (Phone/Email) *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.contact ? "is-invalid" : ""}`}
                        value={formData.contact}
                        onChange={(e) =>
                          setFormData({ ...formData, contact: e.target.value })
                        }
                        placeholder="e.g. 0300-1234567 or email"
                      />
                      {formErrors.contact && (
                        <div className="invalid-feedback">
                          {formErrors.contact}
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label fw-semibold mb-0">
                          Raw Inquiry Message *
                        </label>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={handleAiAssist}
                          disabled={aiLoading}
                        >
                          <i className="bi bi-stars me-1 text-warning"></i>
                          {aiLoading
                            ? "Generating..."
                            : "Generate Brief with AI"}
                        </button>
                      </div>
                      <textarea
                        rows="3"
                        className={`form-control ${formErrors.rawMessage ? "is-invalid" : ""}`}
                        value={formData.rawMessage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rawMessage: e.target.value,
                          })
                        }
                        placeholder="Paste original client message here..."
                      ></textarea>
                      {formErrors.rawMessage && (
                        <div className="invalid-feedback">
                          {formErrors.rawMessage}
                        </div>
                      )}
                      {aiLoading && (
                        <LoadingSpinner text="AI is extracting requirements & pricing..." />
                      )}
                      {aiError && (
                        <div className="text-danger small mt-1">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {aiError}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Service Type
                      </label>
                      <select
                        className="form-select"
                        value={formData.serviceType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            serviceType: e.target.value,
                          })
                        }
                      >
                        {SERVICE_TYPES.map((srv) => (
                          <option key={srv} value={srv}>
                            {srv}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Complexity
                      </label>
                      <select
                        className="form-select"
                        value={formData.complexity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            complexity: e.target.value,
                          })
                        }
                      >
                        {COMPLEXITY_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Status</label>
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

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Suggested Price Range
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.suggestedPriceRange}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            suggestedPriceRange: e.target.value,
                          })
                        }
                        placeholder="e.g. PKR 30,000 - 45,000"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Requirements (1 per line)
                      </label>
                      <textarea
                        rows="3"
                        className="form-control"
                        value={formData.requirementsText}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requirementsText: e.target.value,
                          })
                        }
                        placeholder="Bullet points auto-filled by AI or type manually..."
                      ></textarea>
                    </div>
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
                    {editingLead ? "Save Changes" : "Create Lead"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          deleteLead(deletingId);
          setDeletingId(null);
        }}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
      />
    </div>
  );
}
