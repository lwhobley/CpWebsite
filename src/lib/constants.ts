import { Role } from "@/lib/types";

type ModuleDefinition = {
  href: string;
  label: string;
  roles?: Role[];
};

export const LOCATION_ID = "7b8c104b-4f70-49aa-ae2f-e7f451e7f44b";
export const APP_NAME = "Enish Ops Hub";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  gm: "General Manager",
  manager: "Manager",
  captain: "Captain",
  bartender: "Bartender",
  host: "Host",
  kitchen: "Kitchen",
  dishwasher: "Dishwasher",
};

export const FLOOR_ROLES: Role[] = [
  "captain",
  "bartender",
  "host",
  "kitchen",
  "dishwasher",
];

export const MANAGER_ROLES: Role[] = ["owner", "gm", "manager"];

export const ADMIN_ROLES: Role[] = ["owner", "gm"];

export const MODULES: ModuleDefinition[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/checklists", label: "Checklists" },
  { href: "/permits", label: "Permits" },
  { href: "/inventory", label: "Inventory" },
  { href: "/audits", label: "Audits" },
  { href: "/certifications", label: "Certifications" },
  { href: "/assistant", label: "Assistant" },
  { href: "/admin", label: "Admin", roles: ADMIN_ROLES },
  { href: "/pos", label: "POS", roles: ADMIN_ROLES },
] as const;
