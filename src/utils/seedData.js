export const INITIAL_LEADS = [
  {
    id: "lead-101",
    clientName: "Ahmad Raza (Al-Madina Stores)",
    contact: "0300-1234567 / ahmad@almadina.pk",
    rawMessage:
      "Assalam-o-Alaikum, I need an online store for my grocery items in Lahore. Payment gateway like JazzCash/Easypaisa support visually clean design and mobile responsive. How much time and cost?",
    serviceType: "Shopify",
    requirements: [
      "Mobile responsive e-commerce layout",
      "Easypaisa & JazzCash integration",
      "Product inventory & catalog management",
      "Order notification via WhatsApp/SMS",
    ],
    complexity: "Medium",
    suggestedPriceRange: "PKR 45,000 - 65,000",
    status: "New",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "lead-102",
    clientName: "Dr. Sara Khan",
    contact: "sara.clinic@gmail.com",
    rawMessage:
      "Hi WebEra team, I want a modern clean booking website for my dental clinic with patient appointment form, services overview and Google Maps location.",
    serviceType: "WordPress",
    requirements: [
      "Modern clean healthcare design",
      "Online appointment booking form",
      "Services catalog & pricing list",
      "Google Maps & WhatsApp contact button",
    ],
    complexity: "Simple",
    suggestedPriceRange: "PKR 25,000 - 35,000",
    status: "Contacted",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "lead-103",
    clientName: "Faisal Tech Hub",
    contact: "0321-9876543",
    rawMessage:
      "Need full custom SaaS dashboard UI design in Figma for real estate listing management. Total around 15 screens.",
    serviceType: "UI/UX",
    requirements: [
      "Figma UI/UX prototype with 15+ screens",
      "Real estate dashboard design system",
      "Dark & Light mode variants",
      "User research & component library",
    ],
    complexity: "Complex",
    suggestedPriceRange: "PKR 90,000 - 120,000",
    status: "Converted",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

export const INITIAL_PROJECTS = [
  {
    id: "proj-201",
    clientName: "Faisal Tech Hub",
    contact: "0321-9876543",
    projectName: "Real Estate SaaS UI/UX Figma",
    serviceType: "UI/UX",
    deadline: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
    status: "In Progress",
    notes: "Designing 15 Figma screens. Wireframes approved by client.",
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: "proj-202",
    clientName: "Zubair Fashion Brand",
    contact: "zubair@fashionpk.com",
    projectName: "Shopify Store Redesign",
    serviceType: "Shopify",
    deadline: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    status: "In Review",
    notes:
      "Custom Shopify theme created. Final testing on mobile devices pending.",
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: "proj-203",
    clientName: "Tariq Auto Spares",
    contact: "0345-1122334",
    projectName: "WordPress Catalog Site",
    serviceType: "WordPress",
    deadline: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    status: "Completed",
    notes: "Product showcase site completed and hosted on client domain.",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

export const INITIAL_INVOICES = [
  {
    id: "inv-301",
    projectId: "proj-201",
    clientName: "Faisal Tech Hub",
    amount: 50000,
    status: "Pending",
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "inv-302",
    projectId: "proj-202",
    clientName: "Zubair Fashion Brand",
    amount: 40000,
    status: "Pending",
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "inv-303",
    projectId: "proj-203",
    clientName: "Tariq Auto Spares",
    amount: 30000,
    status: "Paid",
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0],
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
];
