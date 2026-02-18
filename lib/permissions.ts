// Role-based permission helpers for the RBAC system

export type AppRole =
    | "SUPER_ADMIN"
    | "ADMIN"
    | "SENIOR_ACCOUNT_MANAGER"
    | "ACCOUNT_MANAGER"
    | "CONTENT_CREATOR"
    | "FINANCE";

// ─── Role Descriptions ───────────────────────────────────────────
export const ROLE_INFO: Record<
    AppRole,
    { label: string; description: string; color: string; icon: string }
> = {
    SUPER_ADMIN: {
        label: "Super Admin",
        description:
            "Full system access. Can manage all teams, clients, settings, and finances.",
        color: "bg-red-100 text-red-700 ring-red-600/20",
        icon: "🛡️",
    },
    ADMIN: {
        label: "Admin",
        description:
            "System configuration, manage all teams and clients. Full operational access.",
        color: "bg-purple-100 text-purple-700 ring-purple-600/20",
        icon: "⚙️",
    },
    SENIOR_ACCOUNT_MANAGER: {
        label: "Senior Account Manager",
        description:
            "Oversee Account Managers, assign/reassign clients, view all client deliverables and reports.",
        color: "bg-blue-100 text-blue-700 ring-blue-600/20",
        icon: "👔",
    },
    ACCOUNT_MANAGER: {
        label: "Account Manager",
        description:
            "Manage assigned clients — social media, content calendar, kanban, deliverables. Cannot access invoices.",
        color: "bg-green-100 text-green-700 ring-green-600/20",
        icon: "👤",
    },
    CONTENT_CREATOR: {
        label: "Content Creator",
        description:
            "Create and edit social media posts for assigned clients. Cannot manage plans or finances.",
        color: "bg-pink-100 text-pink-700 ring-pink-600/20",
        icon: "✏️",
    },
    FINANCE: {
        label: "Finance",
        description:
            "Manage invoices, proformas, and contracts for all clients. No access to social media or content.",
        color: "bg-yellow-100 text-yellow-700 ring-yellow-600/20",
        icon: "💰",
    },
};

// ─── Permission Checks ──────────────────────────────────────────

/** Can this role manage team members? (create, edit, delete) */
export function canManageTeam(role: string): boolean {
    return ["SUPER_ADMIN", "ADMIN"].includes(role);
}

/** Can this role assign clients to team members? */
export function canAssignClients(role: string): boolean {
    return ["SUPER_ADMIN", "ADMIN", "SENIOR_ACCOUNT_MANAGER"].includes(role);
}

/** Can this role see ALL clients (not just assigned)? */
export function canViewAllClients(role: string): boolean {
    return [
        "SUPER_ADMIN",
        "ADMIN",
        "SENIOR_ACCOUNT_MANAGER",
        "FINANCE",
    ].includes(role);
}

/** Can this role manage client details (create, edit, delete)? */
export function canManageClients(role: string): boolean {
    return [
        "SUPER_ADMIN",
        "ADMIN",
        "SENIOR_ACCOUNT_MANAGER",
        "ACCOUNT_MANAGER",
    ].includes(role);
}

/** Can this role access social media features? */
export function canManageSocial(role: string): boolean {
    return [
        "SUPER_ADMIN",
        "ADMIN",
        "SENIOR_ACCOUNT_MANAGER",
        "ACCOUNT_MANAGER",
        "CONTENT_CREATOR",
    ].includes(role);
}

/** Can this role manage financial documents (invoices, proformas)? */
export function canManageFinance(role: string): boolean {
    return ["SUPER_ADMIN", "ADMIN", "FINANCE"].includes(role);
}

/** Can this role access system settings? */
export function canManageSettings(role: string): boolean {
    return ["SUPER_ADMIN", "ADMIN"].includes(role);
}

/** Get the list of roles that this role is allowed to create */
export function creatableRoles(role: string): AppRole[] {
    if (role === "SUPER_ADMIN") {
        return [
            "ADMIN",
            "SENIOR_ACCOUNT_MANAGER",
            "ACCOUNT_MANAGER",
            "CONTENT_CREATOR",
            "FINANCE",
        ];
    }
    if (role === "ADMIN") {
        return [
            "SENIOR_ACCOUNT_MANAGER",
            "ACCOUNT_MANAGER",
            "CONTENT_CREATOR",
            "FINANCE",
        ];
    }
    return [];
}
