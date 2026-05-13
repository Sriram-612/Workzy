import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { ArrowLeft, Bell, Check, Loader2, X } from 'lucide-react';
import type { User } from '../App';
import { notificationsAPI, proposalsAPI } from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface NotificationsScreenProps {
  user: User;
}

type NotifRow = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read?: boolean;
  isRead?: boolean;
  created_at?: string;
  createdAt?: string;
  data?: Record<string, unknown> | string;
};

function parseData(data: NotifRow['data']): Record<string, unknown> {
  if (!data) return {};
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) return data as Record<string, unknown>;
  if (typeof data === 'string') {
    try {
      const p = JSON.parse(data);
      return typeof p === 'object' && p !== null ? (p as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return {};
}

function normalizeNotification(row: Record<string, unknown>): NotifRow {
  return {
    id: String(row.id),
    title: String(row.title || ''),
    message: String(row.message || ''),
    type: String(row.type || ''),
    isRead: Boolean(row.is_read ?? row.isRead),
    createdAt: (row.created_at ?? row.createdAt) as string | undefined,
    data: row.data as NotifRow['data'],
  };
}

export function NotificationsScreen({ user }: NotificationsScreenProps) {
  const [items, setItems] = useState<NotifRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hireBusy, setHireBusy] = useState<string | null>(null);
  const [doneProposalIds, setDoneProposalIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await notificationsAPI.getNotifications(1, 50)) as {
        notifications?: Record<string, unknown>[];
      };
      const raw = res.notifications || [];
      setItems(raw.map(normalizeNotification));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load notifications');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true, is_read: true } : n)));
    } catch {
      /* ignore */
    }
  };

  const onHireResponse = async (proposalId: string, accept: boolean) => {
    setHireBusy(`${proposalId}-${accept}`);
    try {
      await proposalsAPI.respondToHireOffer(proposalId, accept);
      setDoneProposalIds((prev) => new Set(prev).add(proposalId));
      toast.success(accept ? 'You accepted the hire. Project is starting.' : 'You declined the hire offer.');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update hire offer');
    } finally {
      setHireBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground text-sm">You have no notifications yet.</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((n) => {
              const read = Boolean(n.isRead ?? n.is_read);
              const at = n.createdAt || n.created_at;
              const dt = at ? new Date(at) : null;
              const data = parseData(n.data);
              const proposalId =
                (data.proposalId as string) || (data.proposal_id as string) || undefined;
              const jobId = (data.jobId as string) || (data.job_id as string) || undefined;
              const projectId = (data.projectId as string) || (data.project_id as string) || undefined;
              const isHireOffer = n.type === 'hire_offer' && user.role === 'freelancer';
              const hireResponded = proposalId && doneProposalIds.has(proposalId);

              return (
                <Card
                  key={n.id}
                  className={read ? 'opacity-90' : 'border-primary/30'}
                  onClick={() => {
                    if (!read) void markRead(n.id);
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-medium">{n.title}</CardTitle>
                      {!read ? <Badge variant="default">New</Badge> : null}
                    </div>
                    {dt && !Number.isNaN(dt.getTime()) ? (
                      <p className="text-xs text-muted-foreground">{format(dt, 'MMM d, yyyy p')}</p>
                    ) : null}
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-foreground">
                    <p className="text-muted-foreground leading-relaxed">{n.message}</p>

                    {isHireOffer && proposalId && !hireResponded ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          size="sm"
                          className="gap-1"
                          disabled={hireBusy !== null}
                          onClick={(e) => {
                            e.stopPropagation();
                            void onHireResponse(proposalId, true);
                          }}
                        >
                          {hireBusy === `${proposalId}-true` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          disabled={hireBusy !== null}
                          onClick={(e) => {
                            e.stopPropagation();
                            void onHireResponse(proposalId, false);
                          }}
                        >
                          {hireBusy === `${proposalId}-false` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          Decline
                        </Button>
                      </div>
                    ) : null}

                    {hireResponded ? (
                      <p className="text-xs text-muted-foreground">Response recorded.</p>
                    ) : null}

                    {jobId &&
                    user.role === 'client' &&
                    (n.type === 'proposal_received' || n.type === 'hire_offer_accepted') ? (
                      <Link
                        to={`/job/${jobId}/applicants`}
                        className="text-primary text-xs hover:underline inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View applicants
                      </Link>
                    ) : null}

                    {jobId && !(user.role === 'client' && (n.type === 'proposal_received' || n.type === 'hire_offer_accepted')) ? (
                      <Link to={`/job/${jobId}`} className="text-primary text-xs hover:underline inline-block" onClick={(e) => e.stopPropagation()}>
                        Open job
                      </Link>
                    ) : null}

                    {projectId ? (
                      <p className="text-xs text-muted-foreground">Project ID: {projectId}</p>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
