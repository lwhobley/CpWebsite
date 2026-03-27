export type Role =
  | "owner"
  | "gm"
  | "manager"
  | "captain"
  | "bartender"
  | "host"
  | "kitchen"
  | "dishwasher";

export type AppUser = {
  id: string;
  name: string;
  role: Role;
  locationId: string;
  email?: string | null;
  active: boolean;
};

export type ChecklistTask = {
  id: string;
  checklist: string;
  role: Role;
  task: string;
  requiresPhoto?: boolean;
  requiresNote?: boolean;
  completed: boolean;
  cutoff: string;
  assignee?: string;
};

export type DashboardStat = {
  label: string;
  value: number;
  suffix?: string;
  delta?: string;
  tone?: "default" | "alert" | "success";
};

export type InventoryItem = {
  itemId: string;
  brand: string;
  spiritType: string;
  size: string;
  par: number;
  expectedQuantity: number;
  actualQuantity: number;
  variance: number;
  distributor: string;
  flagged: boolean;
};

export type PermitStatus = "green" | "yellow" | "red";

export type Permit = {
  id: string;
  name: string;
  type: string;
  expiresAt: string;
  status: PermitStatus;
};

export type AuditSubmission = {
  id: string;
  title: string;
  category: string;
  score: number;
  submittedAt: string;
  aiNotes: string;
};

export type Certification = {
  id: string;
  name: string;
  type: string;
  expiresAt: string;
  compliant: boolean;
};

export type PosStatus = {
  system: "toast" | "square";
  lastSynced: string;
  status: "success" | "error" | "partial";
  covers: number;
  checkAvg: number;
};
