import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useAI } from "../hooks/useAI";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { generateId } from "../utils/idGenerator";
import { formatDate } from "../utils/formatters";

const STATUS_COLUMNS = ["Not Started", "In Progress", "In Review", "Completed"];
const SERVICE_TYPES = ["WordPress", "Shopify", "UI/UX", "Full-Stack"];

export default function Projects() {
  const { projects, addProject, updateProject, deleteProject } = useApp();
  const { loading: aiLoading, error: aiError, generateFollowUp } = useAI();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // AI Follow up modal state
  const [aiFollowUpModal, setAiFollowUpModal] = useState({
    isOpen: false,
    text: "",
    clientName: "",
    copied: false,
  });

  // Form State
  const [formData, setFormData] = useState({
    clientName: "",
    contact: "",
    projectName: "",
    serviceType: "WordPress",
    deadline: "",
    status: "In Progress",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesService =
        serviceFilter === "All" || p.serviceType === serviceFilter;
      return matchesSearch && matchesService;
    });
  }, [projects, searchTerm, serviceFilter]);

  const openAddModal = () => {
    setEditingProject(null);
    const defaultDeadline = new Date(Date.now() + 86400000 * 7)
      .toISOString()
      .split("T")[0];
    setFormData({
      clientName: "",
      contact: "",
      projectName: "",
      serviceType: "WordPress",
      deadline: defaultDeadline,
      status: "In Progress",
      notes: "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (proj) => {
    setEditingProject(proj);
    setFormData({
      clientName: proj.clientName,
      contact: proj.contact,
      projectName: proj.projectName,
      serviceType: proj.serviceType,
      deadline: proj.deadline ? proj.deadline.split("T")[0] : "",
      status: proj.status,
      notes: proj.notes || "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.clientName.trim())
      errors.clientName = "Client name is required.";
    if (!formData.contact.trim())
      errors.contact = "Contact information is required.";
    if (!formData.projectName.trim())
      errors.projectName = "Project name is required.";
    if (!formData.deadline) {
      errors.deadline = "Deadline date is required.";
    } else {
      const selected = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        errors.deadline = "Deadline cannot be in the past.";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      clientName: formData.clientName.trim(),
      contact: formData.contact.trim(),
      projectName: formData.projectName.trim(),
      serviceType: formData.serviceType,
      deadline: new Date(formData.deadline).toISOString(),
      status: formData.status,
      notes: formData.notes.trim(),
    };

    if (editingProject) {
      updateProject(editingProject.id, payload);
    } else {
      addProject({
        id: generateId(),
        ...payload,
        createdAt: new Date().toISOString(),
      });
    }

    setIsModalOpen(false);
  };

  const handleGenerateAiFollowUp = async (project) => {
    setAiFollowUpModal({
      isOpen: true,
      text: "",
      clientName: project.clientName,
      copied: false,
    });
    const msg = await generateFollowUp(project);
    if (msg) {
      setAiFollowUpModal((prev) => ({ ...prev, text: msg }));
    }
  };

  const handleCopyAiMessage = () => {
    navigator.clipboard.writeText(aiFollowUpModal.text);
    setAiFollowUpModal((prev) => ({ ...prev, copied: true }));
    setTimeout(
      () => setAiFollowUpModal((prev) => ({ ...prev, copied: false })),
      2500,
    );
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Projects Board</h2>
          <p className="text-muted mb-0 small">
            Manage active agency client projects
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="bi bi-plus-lg me-1"></i> Add New Project
        </button>
      </div>

      {/* Search & Filter */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-7">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search by project or client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-5">
              <select
                className="form-select bg-light"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
              >
                <option value="All">All Services</option>
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="row g-3">
        {STATUS_COLUMNS.map((colStatus) => {
          const colProjects = filteredProjects.filter(
            (p) => p.status === colStatus,
          );

          return (
            <div key={colStatus} className="col-12 col-md-6 col-xl-3">
              <div className="bg-light p-3 rounded-3 h-100 border">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0 text-uppercase small text-muted">
                    {colStatus}
                  </h6>
                  <span className="badge bg-white text-dark border fw-semibold">
                    {colProjects.length}
                  </span>
                </div>

                {colProjects.length === 0 ? (
                  <div className="text-center py-4 text-muted small bg-white rounded border border-dashed">
                    No projects
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {colProjects.map((project) => (
                      <div key={project.id} className="card shadow-sm border-0">
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="fw-bold mb-0 text-truncate max-w-xs">
                              {project.projectName}
                            </h6>
                            <StatusBadge status={project.status} />
                          </div>

                          <p className="text-muted small mb-2">
                            <i className="bi bi-person me-1"></i>
                            {project.clientName}
                          </p>

                          <div className="d-flex align-items-center justify-content-between text-muted small mb-3">
                            <span>
                              <i className="bi bi-tools me-1"></i>
                              {project.serviceType}
                            </span>
                            <span>
                              <i className="bi bi-calendar-event me-1"></i>
                              {formatDate(project.deadline)}
                            </span>
                          </div>

                          {project.notes && (
                            <p className="text-secondary small bg-light p-2 rounded mb-3">
                              {project.notes}
                            </p>
                          )}

                          <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleGenerateAiFollowUp(project)}
                            >
                              <i className="bi bi-whatsapp me-1"></i> AI
                              Follow-up
                            </button>
                            <div>
                              <button
                                className="btn btn-sm btn-link text-primary p-0 me-2"
                                onClick={() => openEditModal(project)}
                              >
                                <i className="bi bi-pencil fs-6"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-link text-danger p-0"
                                onClick={() => setDeletingId(project.id)}
                              >
                                <i className="bi bi-trash fs-6"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Project Modal */}
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
                  {editingProject ? "Edit Project" : "Add New Project"}
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
                      Project Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.projectName ? "is-invalid" : ""}`}
                      value={formData.projectName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projectName: e.target.value,
                        })
                      }
                      placeholder="e.g. Shopify Redesign"
                    />
                    {formErrors.projectName && (
                      <div className="invalid-feedback">
                        {formErrors.projectName}
                      </div>
                    )}
                  </div>

                  <div className="row g-3 mb-3">
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
                        placeholder="e.g. Faisal Tech"
                      />
                      {formErrors.clientName && (
                        <div className="invalid-feedback">
                          {formErrors.clientName}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Contact *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.contact ? "is-invalid" : ""}`}
                        value={formData.contact}
                        onChange={(e) =>
                          setFormData({ ...formData, contact: e.target.value })
                        }
                        placeholder="e.g. 0321-9876543"
                      />
                      {formErrors.contact && (
                        <div className="invalid-feedback">
                          {formErrors.contact}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
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
                        {SERVICE_TYPES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      >
                        {STATUS_COLUMNS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Deadline Date *
                    </label>
                    <input
                      type="date"
                      className={`form-control ${formErrors.deadline ? "is-invalid" : ""}`}
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                    />
                    {formErrors.deadline && (
                      <div className="invalid-feedback">
                        {formErrors.deadline}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Notes & Description
                    </label>
                    <textarea
                      rows="3"
                      className="form-control"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Add project details or milestones..."
                    ></textarea>
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
                    {editingProject ? "Save Changes" : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* AI Follow Up Modal */}
      {aiFollowUpModal.isOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-success">
                  <i className="bi bi-whatsapp me-2"></i> WhatsApp Follow-Up (
                  {aiFollowUpModal.clientName})
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setAiFollowUpModal({
                      isOpen: false,
                      text: "",
                      clientName: "",
                      copied: false,
                    })
                  }
                ></button>
              </div>
              <div className="modal-body py-3">
                {aiLoading ? (
                  <LoadingSpinner text="Generating WhatsApp message with AI..." />
                ) : aiError ? (
                  <div className="alert alert-danger">{aiError}</div>
                ) : (
                  <div>
                    <label className="form-label small text-muted">
                      Generated Message (Editable):
                    </label>
                    <textarea
                      rows="4"
                      className="form-control"
                      value={aiFollowUpModal.text}
                      onChange={(e) =>
                        setAiFollowUpModal({
                          ...aiFollowUpModal,
                          text: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() =>
                    setAiFollowUpModal({
                      isOpen: false,
                      text: "",
                      clientName: "",
                      copied: false,
                    })
                  }
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleCopyAiMessage}
                  disabled={!aiFollowUpModal.text || aiLoading}
                >
                  <i className="bi bi-clipboard me-1"></i>
                  {aiFollowUpModal.copied ? "Copied!" : "Copy Message"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          deleteProject(deletingId);
          setDeletingId(null);
        }}
        title="Delete Project"
        message="Are you sure you want to delete this project? This will not delete associated invoices."
      />
    </div>
  );
}
