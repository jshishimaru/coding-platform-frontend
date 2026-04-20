import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Island } from "@/components/ui/Island";
import { Button } from "@/components/ui/Button";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/Table";
import { ArrowLeft, LogOut, UserPlus, X } from "lucide-react";
import type { Group, GroupMember } from "@/types";

interface GroupDetailResponse {
  group: Group;
  members: GroupMember[];
  pending_request: boolean;
}

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: () => apiClient.get<GroupDetailResponse>(`/groups/${id}`),
    enabled: !!id,
  });

  const joinMutation = useMutation({
    mutationFn: (payload: { message: string }) =>
      apiClient.post(`/groups/${id}/join`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      setShowJoinForm(false);
      setMessage("");
      setActionError(null);
    },
    onError: (err: Error) => setActionError(err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiClient.delete(`/groups/${id}/join`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      setActionError(null);
    },
    onError: (err: Error) => setActionError(err.message),
  });

  const leaveMutation = useMutation({
    mutationFn: () => apiClient.post(`/groups/${id}/leave`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setActionError(null);
    },
    onError: (err: Error) => setActionError(err.message),
  });

  if (isLoading || !data) {
    return <p className="py-20 text-center text-sm text-text-muted">Loading...</p>;
  }

  const { group, members, pending_request } = data;
  const isMember = !!group.my_role;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/groups")}
        className="flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text"
      >
        <ArrowLeft size={14} /> Back to groups
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">{group.name}</h1>
          <p className="mt-1 text-sm text-text-muted max-w-2xl whitespace-pre-wrap">
            {group.description || "No description"}
          </p>
          <p className="mt-2 text-xs text-text-muted">
            {group.member_count ?? 0} members · Created{" "}
            {new Date(group.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isMember && !pending_request && (
            <Button variant="primary" onClick={() => setShowJoinForm(true)} className="flex items-center gap-1.5 text-xs">
              <UserPlus size={14} /> Request to join
            </Button>
          )}
          {!isMember && pending_request && (
            <>
              <span className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                Request pending
              </span>
              <Button
                variant="ghost"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="flex items-center gap-1.5 text-xs"
              >
                <X size={14} /> Cancel
              </Button>
            </>
          )}
          {isMember && (
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm("Leave this group?")) leaveMutation.mutate();
              }}
              disabled={leaveMutation.isPending}
              className="flex items-center gap-1.5 text-xs"
            >
              <LogOut size={14} /> Leave
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {actionError}
        </div>
      )}

      {showJoinForm && !isMember && !pending_request && (
        <Island>
          <h3 className="mb-2 text-sm font-semibold text-text">Request to join</h3>
          <p className="mb-3 text-xs text-text-muted">
            Optionally include a short message. A group admin will review your request.
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="I'm a student in CS101 this semester..."
            rows={3}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent resize-none"
          />
          <div className="mt-3 flex gap-2">
            <Button
              variant="primary"
              onClick={() => joinMutation.mutate({ message: message.trim() })}
              disabled={joinMutation.isPending}
              className="text-xs"
            >
              {joinMutation.isPending ? "Submitting..." : "Submit request"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setShowJoinForm(false); setMessage(""); }}
              className="text-xs"
            >
              Cancel
            </Button>
          </div>
        </Island>
      )}

      {(isMember || members.length > 0) && (
        <Island>
          <h3 className="mb-3 text-sm font-semibold text-text">Members ({members.length})</h3>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead className="w-32">Role</TableHead>
                <TableHead className="w-40">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-sm text-text-muted">
                    No members listed
                  </TableCell>
                </TableRow>
              )}
              {members.map((m) => (
                <TableRow key={m.user_id}>
                  <TableCell className="text-sm font-medium">{m.username}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                        m.role === "admin"
                          ? "bg-accent-subtle text-accent"
                          : "bg-bg-secondary text-text-muted"
                      }`}
                    >
                      {m.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-text-muted">
                    {new Date(m.joined_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Island>
      )}
    </div>
  );
}
