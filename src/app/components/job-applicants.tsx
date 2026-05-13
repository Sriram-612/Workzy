import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Briefcase,
  Loader2,
  Mail,
  MessageSquare,
  UserCheck,
  IndianRupee,
  Clock,
} from 'lucide-react';
import type { User } from '../App';
import { jobsAPI, proposalsAPI } from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface JobApplicantsProps {
  user: User;
}

type Freelancer = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  skills?: string[];
  rating?: number;
  bio?: string;
  hourlyRate?: number;
};

type ProposalRow = {
  id: string;
  status: string;
  hireOfferStatus?: string | null;
  coverLetter?: string;
  proposedBudget?: number;
  timeline?: string;
  createdAt?: string;
  freelancer?: Freelancer;
};

export function JobApplicants({ user }: JobApplicantsProps) {
  const { jobId } = useParams();
  const [jobTitle, setJobTitle] = useState('');
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hireBusy, setHireBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const jobRes = (await jobsAPI.getJobById(jobId)) as { job?: { title?: string; clientId?: string } };
      const job = jobRes.job;
      if (!job) {
        setOwnerId(null);
        setJobTitle('');
        setProposals([]);
        return;
      }
      setJobTitle(job.title || 'Job');
      setOwnerId(String(job.clientId || ''));
      if (String(job.clientId) !== String(user.id)) {
        setProposals([]);
        return;
      }
      const propRes = (await proposalsAPI.getJobProposals(jobId)) as { proposals?: ProposalRow[] };
      setProposals(propRes.proposals || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load applicants');
      setProposals([]);
    } finally {
      setLoading(false);
    }
  }, [jobId, user.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (user.role !== 'client') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!jobId) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!loading && ownerId && String(ownerId) !== String(user.id)) {
    return <Navigate to="/dashboard" replace />;
  }

  const messageHref = (f: Freelancer) => {
    const email = encodeURIComponent(f.email || '');
    const name = encodeURIComponent(f.name || '');
    return `/messages?email=${email}&name=${name}`;
  };

  const onHire = async (proposalId: string) => {
    setHireBusy(proposalId);
    try {
      await proposalsAPI.sendHireOffer(proposalId);
      toast.success('Hire invitation sent. The freelancer will get a notification to accept or decline.');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not send hire offer');
    } finally {
      setHireBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to={`/job/${jobId}`} className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Job
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground truncate">Applicants</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground mb-1">Applicants</h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span className="truncate">{jobTitle || '…'}</span>
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : proposals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              No applications yet. Share your job link or wait for freelancers to apply.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {proposals.map((p) => {
              const f = p.freelancer;
              const created = p.createdAt ? new Date(p.createdAt) : null;
              const statusUp = String(p.status || '').toUpperCase();
              const hireSt = p.hireOfferStatus ? String(p.hireOfferStatus).toUpperCase() : '';
              const canInviteHire =
                statusUp === 'PENDING' && hireSt !== 'PENDING' && hireSt !== 'ACCEPTED';
              return (
                <Card key={p.id}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={f?.avatar} />
                          <AvatarFallback>{(f?.name || '?').charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{f?.name || 'Freelancer'}</CardTitle>
                          {f?.email ? (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" />
                              {f.email}
                            </p>
                          ) : null}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline">{statusUp}</Badge>
                            {hireSt ? (
                              <Badge variant="secondary">Hire: {hireSt}</Badge>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {f?.email ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link to={messageHref(f)}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message
                            </Link>
                          </Button>
                        ) : null}
                        {canInviteHire ? (
                          <Button size="sm" disabled={hireBusy === p.id} onClick={() => void onHire(p.id)}>
                            {hireBusy === p.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Hire
                              </>
                            )}
                          </Button>
                        ) : null}
                        {hireSt === 'PENDING' ? (
                          <Badge className="self-center">Invitation sent</Badge>
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {f?.bio ? <p className="text-muted-foreground whitespace-pre-wrap">{f.bio}</p> : null}
                    {f?.skills && f.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {f.skills.slice(0, 8).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs font-normal">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {f?.hourlyRate != null ? (
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          {f.hourlyRate}/hr profile rate
                        </span>
                      ) : null}
                      <span className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        Bid ₹{p.proposedBudget != null ? Number(p.proposedBudget).toLocaleString() : '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {p.timeline || '—'}
                      </span>
                      {created && !Number.isNaN(created.getTime()) ? (
                        <span>Applied {format(created, 'MMM d, yyyy p')}</span>
                      ) : null}
                    </div>
                    {p.coverLetter ? (
                      <div className="rounded-md border border-border bg-muted/30 p-3">
                        <p className="text-xs font-medium text-foreground mb-1">Cover letter</p>
                        <p className="text-sm whitespace-pre-wrap text-foreground">{p.coverLetter}</p>
                      </div>
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
