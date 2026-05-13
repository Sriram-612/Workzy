import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  ChevronLeft,
  Star,
  Clock,
  DollarSign,
  Heart,
  Send,
  Calendar,
  Briefcase,
  CheckCircle,
  Loader2,
  Users,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { User } from '../App';
import { jobsAPI, proposalsAPI } from '../services/api';

interface JobDetailsProps {
  user: User;
}

function formatBudget(job: Record<string, unknown>) {
  if (job.budgetType === 'FIXED' && job.fixedBudget != null) {
    return `₹${Number(job.fixedBudget).toLocaleString()}`;
  }
  if (job.budgetType === 'HOURLY' && job.hourlyRate != null) {
    return `₹${Number(job.hourlyRate).toLocaleString()}/hr`;
  }
  return '—';
}

export function JobDetails({ user }: JobDetailsProps) {
  const { id: jobId } = useParams();
  const [job, setJob] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [myProposal, setMyProposal] = useState<Record<string, unknown> | null>(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyBusy, setApplyBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [proposal, setProposal] = useState({
    coverLetter: '',
    proposedBudget: '',
    timeline: '',
  });

  const isClientOwner =
    user.role === 'client' && job && String((job as { clientId?: string }).clientId) === String(user.id);

  const loadJob = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const res = (await jobsAPI.getJobById(jobId)) as { job?: Record<string, unknown> };
      setJob(res.job || null);
    } catch {
      toast.error('Could not load job');
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const refreshSavedAndProposal = useCallback(async () => {
    if (!jobId || user.role !== 'freelancer') return;
    try {
      const [savedRes, sent] = await Promise.all([
        jobsAPI.getSavedJobs() as Promise<{ jobs?: { id: string }[] }>,
        proposalsAPI.getUserProposals() as Promise<{ proposals?: { jobId?: string }[] }>,
      ]);
      const ids = new Set((savedRes.jobs || []).map((j) => j.id));
      setSaved(ids.has(jobId));
      const mine = (sent.proposals || []).find((p) => String(p.jobId) === jobId);
      setMyProposal(mine || null);
    } catch {
      /* ignore */
    }
  }, [jobId, user.role]);

  useEffect(() => {
    void loadJob();
  }, [loadJob]);

  useEffect(() => {
    void refreshSavedAndProposal();
  }, [refreshSavedAndProposal, job]);

  const handleToggleSave = async () => {
    if (!jobId || user.role !== 'freelancer') return;
    setSaveBusy(true);
    try {
      if (saved) {
        await jobsAPI.unsaveJob(jobId);
        setSaved(false);
        toast.success('Removed from saved jobs');
      } else {
        await jobsAPI.saveJob(jobId);
        setSaved(true);
        toast.success('Saved to your profile');
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Could not update saved jobs');
    } finally {
      setSaveBusy(false);
    }
  };

  const handleApply = async () => {
    if (!jobId) return;
    const budget = parseFloat(proposal.proposedBudget);
    if (!proposal.coverLetter.trim() || !proposal.timeline.trim() || Number.isNaN(budget) || budget <= 0) {
      toast.error('Please fill cover letter, valid budget, and timeline');
      return;
    }
    setApplyBusy(true);
    try {
      await proposalsAPI.createProposal({
        jobId,
        coverLetter: proposal.coverLetter.trim(),
        proposedBudget: budget,
        timeline: proposal.timeline.trim(),
      });
      toast.success('Application submitted! The client can review you under this job’s applicants.');
      setShowApplyForm(false);
      setProposal({ coverLetter: '', proposedBudget: '', timeline: '' });
      await refreshSavedAndProposal();
      await loadJob();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Could not apply');
    } finally {
      setApplyBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
        <p className="text-muted-foreground">Job not found.</p>
        <Link to="/browse-jobs">
          <Button variant="outline">Back to jobs</Button>
        </Link>
      </div>
    );
  }

  const client = (job.client as Record<string, unknown>) || {};
  const skills = (job.skills as string[]) || [];
  const created = job.createdAt ? new Date(String(job.createdAt)) : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/browse-jobs" className="flex items-center text-muted-foreground hover:text-foreground text-sm">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            {isClientOwner && (
              <Link to={`/job/${jobId}/applicants`}>
                <Button size="sm" variant="default">
                  <Users className="w-4 h-4 mr-2" />
                  View applicants
                </Button>
              </Link>
            )}
            {user.role === 'freelancer' && (
              <Button variant="ghost" size="sm" disabled={saveBusy} onClick={() => void handleToggleSave()}>
                <Heart className={`w-4 h-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">{String(job.category)}</Badge>
                    {job.isUrgent ? <Badge>Urgent</Badge> : null}
                    <Badge variant="secondary">{String(job.status)}</Badge>
                  </div>
                  <h1 className="text-2xl font-semibold text-foreground mb-2">{String(job.title)}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    {created && !Number.isNaN(created.getTime()) && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Posted {format(created, 'MMM d, yyyy')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {Number(job.proposalCount ?? 0)} proposals
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <DollarSign className="w-4 h-4" />
                      {formatBudget(job)}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {String(job.duration || '—')}
                    </span>
                    <Badge variant="outline">{String(job.experienceLevel)}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {skills.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{String(job.description)}</p>
                {job.requirements ? (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Requirements</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{String(job.requirements)}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {user.role === 'freelancer' && String(job.clientId) !== String(user.id) && (
              <Card>
                <CardHeader>
                  <CardTitle>Apply</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {myProposal ? (
                    <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
                      <p className="font-medium text-foreground">You already applied</p>
                      <p className="text-muted-foreground mt-1">
                        Status: <Badge variant="outline">{String(myProposal.status)}</Badge>
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" disabled={saveBusy} onClick={() => void handleToggleSave()}>
                          <Heart className={`w-4 h-4 mr-2 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
                          {saved ? 'Saved' : 'Save for later'}
                        </Button>
                        <Button onClick={() => setShowApplyForm((v) => !v)}>
                          {showApplyForm ? 'Hide application form' : 'Apply now'}
                        </Button>
                      </div>
                      {showApplyForm && (
                        <div className="space-y-4 pt-2 border-t border-border">
                          <div>
                            <Label htmlFor="coverLetter">Cover letter</Label>
                            <Textarea
                              id="coverLetter"
                              rows={6}
                              className="mt-1"
                              value={proposal.coverLetter}
                              onChange={(e) => setProposal({ ...proposal, coverLetter: e.target.value })}
                              placeholder="Introduce yourself and explain why you fit this job."
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="budget">Your bid (₹)</Label>
                              <Input
                                id="budget"
                                type="number"
                                className="mt-1"
                                value={proposal.proposedBudget}
                                onChange={(e) => setProposal({ ...proposal, proposedBudget: e.target.value })}
                                placeholder="e.g. 15000"
                              />
                            </div>
                            <div>
                              <Label htmlFor="timeline">Timeline</Label>
                              <Input
                                id="timeline"
                                className="mt-1"
                                value={proposal.timeline}
                                onChange={(e) => setProposal({ ...proposal, timeline: e.target.value })}
                                placeholder="e.g. 3 weeks"
                              />
                            </div>
                          </div>
                          <Button onClick={() => void handleApply()} disabled={applyBusy}>
                            {applyBusy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                            Submit application
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src={client.avatar as string | undefined} />
                    <AvatarFallback>{String(client.name || '?').charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{String(client.name || 'Client')}</span>
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {Number(client.rating || 0)} rating
                    </div>
                  </div>
                </div>
                {client.company ? (
                  <p className="text-sm text-muted-foreground">{String(client.company)}</p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget</span>
                  <span>{formatBudget(job)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span>{String(job.budgetType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Proposals</span>
                  <span>{Number(job.proposalCount ?? 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
