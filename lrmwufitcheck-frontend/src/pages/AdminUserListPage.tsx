import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  ChevronRight,
  ChevronLeft,
  Users,
  RefreshCw,
  CircleAlert,
  MoveHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useUsers,
  useDeleteUser,
  useUpdateUserRole,
} from "@/hooks/api/use-auth";

function AdminUserListPage() {
  // ── Filter / pagination state ──
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [pageNumber, setPageNumber] = useState(1);

  // ── Delete dialog state ──
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // ── Role-change dialog state ──
  const [roleTarget, setRoleTarget] = useState<{
    id: string;
    name: string;
    currentRole: string;
  } | null>(null);
  const [newRole, setNewRole] = useState("");

  // ── Data ──
  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useUsers({
    email: searchText || undefined,
    fullname: searchText || undefined,
    roleId: roleFilter || undefined,
    pageNumber,
    pageRowCount: pageSize,
  });

  const deleteMutation = useDeleteUser();
  const updateRoleMutation = useUpdateUserRole();

  const userList = users ?? [];

  // ── Estimated pagination (no count endpoint in spec – derive from page fullness) ──
  const hasMore = userList.length === pageSize;
  const totalPages = hasMore ? pageNumber + 1 : pageNumber;
  const showingFrom = userList.length > 0 ? (pageNumber - 1) * pageSize + 1 : 0;
  const showingTo = (pageNumber - 1) * pageSize + userList.length;
  const totalLabel = hasMore ? `${showingTo}+` : `${showingTo}`;

  // ── Handlers ──
  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        refetch();
      },
    });
  }, [deleteTarget, deleteMutation, refetch]);

  const handleRoleChange = useCallback(() => {
    if (!roleTarget || !newRole) return;
    updateRoleMutation.mutate(
      { userId: roleTarget.id, data: { roleId: newRole } },
      {
        onSuccess: () => {
          setRoleTarget(null);
          setNewRole("");
          refetch();
        },
      },
    );
  }, [roleTarget, newRole, updateRoleMutation, refetch]);

  // ── Helpers ──
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const roleBadgeVariant = (role: string) => {
    if (role === "superAdmin") return "default";
    if (role === "admin") return "secondary";
    return "outline";
  };

  const roleLabel = (role: string) => {
    if (role === "superAdmin") return "Super Admin";
    if (role === "admin") return "Admin";
    return "User";
  };

  const pageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (pageNumber > 3) pages.push("...");
      const start = Math.max(2, pageNumber - 1);
      const end = Math.min(totalPages - 1, pageNumber + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (pageNumber < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // ── Render ──
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <header className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
            <p className="text-sm text-muted-foreground">
              Manage platform members, roles, and access.
            </p>
          </div>
          <Link
            to="/admin/users/create"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden />
            Add User
          </Link>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search by name or email..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPageNumber(1);
            }}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={roleFilter}
            onValueChange={(v) => {
              setRoleFilter(v);
              setPageNumber(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              <SelectItem value="superAdmin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPageNumber(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/20">
              <CircleAlert className="w-5 h-5 text-destructive" aria-hidden />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-destructive">
                Failed to load users
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Please check your connection and try again.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-2"
                onClick={() => refetch()}
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden />
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && userList.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Users className="w-8 h-8 text-muted-foreground" aria-hidden />
          </div>
          <h3 className="text-lg font-semibold">No users found</h3>
          <p className="mt-1 mb-6 text-sm text-muted-foreground max-w-sm">
            Try adjusting your search or filters, or create a new user to get
            started.
          </p>
          <Link
            to="/admin/users/create"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden />
            Add User
          </Link>
        </div>
      )}

      {/* User List Table */}
      {!isLoading && !error && userList.length > 0 && (
        <>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-border bg-muted/50">
              <span className="col-span-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                User
              </span>
              <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Role
              </span>
              <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Verified
              </span>
              <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Joined
              </span>
              <span className="col-span-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-end">
                Actions
              </span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-border">
              {userList.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors"
                >
                  {/* User */}
                  <div className="sm:col-span-5 flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold text-sm">
                      {getInitials(user.fullname)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">
                        {user.fullname}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="sm:col-span-2">
                    <Badge
                      variant={
                        roleBadgeVariant(user.roleId) as
                          | "default"
                          | "secondary"
                          | "outline"
                      }
                    >
                      {roleLabel(user.roleId)}
                    </Badge>
                  </div>

                  {/* Verified */}
                  <div className="sm:col-span-2">
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <span className="relative flex h-2.5 w-2.5">
                        <span
                          className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            user.emailVerified ? "bg-chart-2" : "bg-chart-4"
                          }`}
                        />
                      </span>
                      <span className="text-muted-foreground">
                        {user.emailVerified ? "Verified" : "Pending"}
                      </span>
                    </span>
                  </div>

                  {/* Joined */}
                  <div className="sm:col-span-2 text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </div>

                  {/* Actions */}
                  <div className="sm:col-span-1 flex justify-end items-center gap-0.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background hover:bg-muted transition-colors"
                          aria-label="User actions"
                        >
                          <MoveHorizontal
                            className="w-4 h-4 text-muted-foreground"
                            aria-hidden
                          />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/admin/users/${user.id}`}
                            className="cursor-pointer"
                          >
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setRoleTarget({
                              id: user.id,
                              name: user.fullname,
                              currentRole: user.roleId,
                            });
                            setNewRole("");
                          }}
                        >
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() =>
                            setDeleteTarget({
                              id: user.id,
                              name: user.fullname,
                            })
                          }
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Link
                      to={`/admin/users/${user.id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background hover:bg-muted transition-colors"
                      aria-label="View user details"
                    >
                      <ChevronRight
                        className="w-4 h-4 text-muted-foreground"
                        aria-hidden
                      />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {showingFrom}–{showingTo}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {totalLabel}
              </span>{" "}
              users
            </p>
            <nav className="flex items-center gap-1" aria-label="Pagination">
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden />
              </button>
              {pageNumbers().map((p, idx) =>
                p === "..." ? (
                  <span
                    key={`dots-${idx}`}
                    className="inline-flex h-9 items-center px-1 text-sm text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`inline-flex h-9 min-w-[36px] items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors ${
                      p === pageNumber
                        ? "border-primary bg-primary text-primary-foreground font-semibold"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setPageNumber(p)}
                    aria-current={p === pageNumber ? "page" : undefined}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() =>
                  setPageNumber((p) => Math.min(totalPages, p + 1))
                }
                disabled={pageNumber >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" aria-hidden />
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold">{deleteTarget?.name}</span>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role Change Dialog */}
      <AlertDialog
        open={!!roleTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRoleTarget(null);
            setNewRole("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Role</AlertDialogTitle>
            <AlertDialogDescription>
              Change the role for{" "}
              <span className="font-semibold">{roleTarget?.name}</span>. Current
              role:{" "}
              <span className="font-semibold capitalize">
                {roleTarget?.currentRole}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="superAdmin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleChange}
              disabled={!newRole || updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminUserListPage;
