import { useState } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { User, Role } from "@/lib/types";
import { StatusPill } from "@/components/StatusText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@/components/ui/item";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useUsers, useCreateUser, useUpdateUser, useToggleUserStatus } from "@/hooks/useUsers";

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const toggleStatusMutation = useToggleUserStatus();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "" as Role | "",
    status: "" as "Active" | "Disabled" | "",
  });

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "", status: "Active" });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (user: User) => {
    toggleStatusMutation.mutate(user.id);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.role || !formData.status) {
      return;
    }

    if (editingUser) {
      updateMutation.mutate({
        id: editingUser.id,
        updates: formData as Omit<User, "id" | "createdAt">,
      });
    } else {
      createMutation.mutate(formData as Omit<User, "id" | "createdAt">);
    }
    setIsDialogOpen(false);
  };

  const getRoleBadgeClass = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "bg-accent/10 text-accent border border-accent/20";
      case "MANAGER":
        return "bg-status-arrived/10 text-status-arrived border border-status-arrived/20";
      case "ENTERPRISE":
        return "bg-secondary text-foreground border border-border";
    }
  };

  return (
    <LayoutShell showSidebar={true} role="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Users</h1>
            <p className="text-muted-foreground">Manage platform users</p>
          </div>
          <Button onClick={handleAddUser}>
            Add User
          </Button>
        </div>

        <div className="bg-white border border-border rounded-xl overflow-hidden py-2 shadow-card">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No users found.
            </div>
          ) : (
            <div>
              {users.map((user) => (
                <Item key={user.id}>
                  <ItemMedia variant="avatar">
                    {getInitials(user.name)}
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{user.name}</ItemTitle>
                    <ItemDescription className="flex items-center gap-2 flex-wrap">
                      <span>{user.email}</span>
                      <span className="text-border">·</span>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium",
                        getRoleBadgeClass(user.role)
                      )}>
                        {user.role}
                      </span>
                      <span className="text-border">·</span>
                      <StatusPill status={user.status} />
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-sm text-accent hover:underline font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={cn(
                        "text-sm hover:underline font-medium",
                        user.status === "Active"
                          ? "text-status-not-arrived"
                          : "text-status-arrived"
                      )}
                    >
                      {user.status === "Active" ? "Disable" : "Enable"}
                    </button>
                  </ItemActions>
                </Item>
              ))}
            </div>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
              <DialogDescription>
                {editingUser ? "Update user information" : "Create a new user account"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: Role) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "Active" | "Disabled") => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </LayoutShell>
  );
}
