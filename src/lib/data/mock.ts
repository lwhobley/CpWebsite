import {
  AuditSubmission,
  Certification,
  ChecklistTask,
  InventoryItem,
  Permit,
  PosStatus,
} from "@/lib/types";
import { LOCATION_ID } from "@/lib/constants";

export const mockUsers = [
  {
    id: "6dbb40ef-df4f-4de9-9e2d-3ec72f2d089b",
    name: "Liffort Hobley",
    role: "owner",
    locationId: LOCATION_ID,
    email: "liffort@enishhouston.com",
    active: true,
    pinHash: "$2b$10$6pDc01DQlIvY8qLZbw8h3el8wpm1fi.E3Bu2d69ssdqxL4XDXnpQm",
  },
  {
    id: "9aabf4bb-b118-4cc8-8d53-9f52277b9777",
    name: "Amina Bello",
    role: "manager",
    locationId: LOCATION_ID,
    email: "amina@enishhouston.com",
    active: true,
    pinHash: "",
  },
  {
    id: "59c4e67c-f69e-4d7b-8a40-d6b10f4b9ed1",
    name: "Samuel Reed",
    role: "bartender",
    locationId: LOCATION_ID,
    email: null,
    active: true,
    pinHash: "$2b$10$6pDc01DQlIvY8qLZbw8h3el8wpm1fi.E3Bu2d69ssdqxL4XDXnpQm",
  },
] as const;

export const mockChecklistTasks: ChecklistTask[] = [
  {
    id: "c1",
    checklist: "Opening Bar",
    role: "bartender",
    task: "Sanitize speed rails and garnish station",
    completed: true,
    cutoff: "10:30 AM",
  },
  {
    id: "c2",
    checklist: "Opening Host Stand",
    role: "host",
    task: "Print reservation manifest and ADA seating notes",
    completed: false,
    cutoff: "10:15 AM",
  },
  {
    id: "c3",
    checklist: "Manager Walkthrough",
    role: "manager",
    task: "Confirm TABC signage, emergency exits, and music license",
    completed: false,
    cutoff: "11:00 AM",
  },
  {
    id: "c4",
    checklist: "Kitchen Line Check",
    role: "kitchen",
    task: "Log cooler temperatures and sanitize prep tops",
    completed: false,
    cutoff: "10:45 AM",
  },
];

export const mockPermits: Permit[] = [
  {
    id: "p1",
    name: "Houston Food Dealer Permit",
    type: "health",
    expiresAt: "2026-04-21",
    status: "yellow",
  },
  {
    id: "p2",
    name: "TABC Mixed Beverage Permit",
    type: "tabc",
    expiresAt: "2026-05-30",
    status: "green",
  },
  {
    id: "p3",
    name: "Fire Occupancy Inspection",
    type: "fire",
    expiresAt: "2026-03-31",
    status: "red",
  },
];

export const mockInventory: InventoryItem[] = [
  {
    itemId: "i1",
    brand: "Tito's Handmade Vodka",
    spiritType: "vodka",
    size: "1 L",
    par: 16,
    expectedQuantity: 8,
    actualQuantity: 3,
    variance: 5,
    distributor: "Southern Glazer's",
    flagged: true,
  },
  {
    itemId: "i2",
    brand: "Hennessy VS",
    spiritType: "other",
    size: "750 ml",
    par: 12,
    expectedQuantity: 6,
    actualQuantity: 7,
    variance: -1,
    distributor: "Southern Glazer's",
    flagged: false,
  },
  {
    itemId: "i3",
    brand: "Don Julio Blanco",
    spiritType: "tequila",
    size: "750 ml",
    par: 10,
    expectedQuantity: 5,
    actualQuantity: 2,
    variance: 3,
    distributor: "Southern Glazer's",
    flagged: true,
  },
];

export const mockAudits: AuditSubmission[] = [
  {
    id: "a1",
    title: "Pre-service Dining Room Audit",
    category: "front-of-house",
    score: 96,
    submittedAt: "2026-03-27T10:00:00Z",
    aiNotes: "Two ADA access points need clearer wayfinding.",
  },
  {
    id: "a2",
    title: "Bar Readiness Audit",
    category: "bar",
    score: 88,
    submittedAt: "2026-03-27T09:10:00Z",
    aiNotes: "Ice well splash guard photographed as incomplete.",
  },
];

export const mockCertifications: Certification[] = [
  {
    id: "cert1",
    name: "Samuel Reed",
    type: "TABC Seller-Server",
    expiresAt: "2026-04-18",
    compliant: true,
  },
  {
    id: "cert2",
    name: "Dara James",
    type: "Food Manager",
    expiresAt: "2026-03-30",
    compliant: false,
  },
];

export const mockPosStatus: PosStatus = {
  system: "toast",
  lastSynced: "2026-03-27T16:45:00Z",
  status: "success",
  covers: 214,
  checkAvg: 47,
};
