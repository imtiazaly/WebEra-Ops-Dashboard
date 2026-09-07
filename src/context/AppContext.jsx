import React, { createContext, useContext } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  INITIAL_LEADS,
  INITIAL_PROJECTS,
  INITIAL_INVOICES,
} from "../data/seedData";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [leads, setLeads] = useLocalStorage("webera_leads", INITIAL_LEADS);
  const [projects, setProjects] = useLocalStorage(
    "webera_projects",
    INITIAL_PROJECTS,
  );
  const [invoices, setInvoices] = useLocalStorage(
    "webera_invoices",
    INITIAL_INVOICES,
  );
  const [aiSettings, setAiSettings] = useLocalStorage("webera_ai_settings", {
    apiKey: "",
    model: "gemini-1.5-flash",
  });

  // Leads CRUD
  const addLead = (newLead) => setLeads((prev) => [newLead, ...prev]);
  const updateLead = (id, updatedLead) =>
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updatedLead } : l)),
    );
  const deleteLead = (id) =>
    setLeads((prev) => prev.filter((l) => l.id !== id));

  // Projects CRUD
  const addProject = (newProject) =>
    setProjects((prev) => [newProject, ...prev]);
  const updateProject = (id, updatedProject) =>
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedProject } : p)),
    );
  const deleteProject = (id) =>
    setProjects((prev) => prev.filter((p) => p.id !== id));

  // Invoices CRUD
  const addInvoice = (newInvoice) =>
    setInvoices((prev) => [newInvoice, ...prev]);
  const updateInvoice = (id, updatedInvoice) =>
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updatedInvoice } : inv)),
    );
  const deleteInvoice = (id) =>
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  const toggleInvoiceStatus = (id) =>
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? { ...inv, status: inv.status === "Paid" ? "Pending" : "Paid" }
          : inv,
      ),
    );

  // Settings
  const updateAiSettings = (newSettings) =>
    setAiSettings((prev) => ({ ...prev, ...newSettings }));

  // Reset demo data
  const resetToSeedData = () => {
    setLeads(INITIAL_LEADS);
    setProjects(INITIAL_PROJECTS);
    setInvoices(INITIAL_INVOICES);
  };

  return (
    <AppContext.Provider
      value={{
        leads,
        addLead,
        updateLead,
        deleteLead,
        projects,
        addProject,
        updateProject,
        deleteProject,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        toggleInvoiceStatus,
        aiSettings,
        updateAiSettings,
        resetToSeedData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
