import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, CreditCard, Loader2, RefreshCw, Smartphone, Wallet, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { projectsAPI, paymentsAPI } from '../services/api';
import type { User } from '../App';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface DirectPaymentProps {
  user: User;
  projectId?: string;
}

interface Project {
  id: string;
  title: string;
  budget: number | string;
  status: string;
  client_id?: string;
  freelancer_id?: string;
  clientId?: string;
  freelancerId?: string;
  created_at?: string;
}

interface Payment {
  id: string;
  projectId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentStatus: 'pending' | 'paid_directly' | 'failed' | 'cancelled';
  paidAt?: string;
  createdAt: string;
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function formatCurrency(amount: number | string, currency = 'INR') {
  const value = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function getProjectStatus(status: string) {
  return String(status || '').toLowerCase();
}

export function EscrowPayment({ user, projectId }: DirectPaymentProps) {
  const navigate = useNavigate();
  const params = useParams();
  const effectiveProjectId = projectId || params.projectId;
  const role = String(user.role || '').toLowerCase();
  const isClient = role === 'client';
  const isFreelancer = role === 'freelancer' || role === 'student';
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingProjectId, setPayingProjectId] = useState<string | null>(null);
  const [studentUpiId, setStudentUpiId] = useState('');
  const autoOpenedProjectId = useRef<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectResponse, paymentResponse] = await Promise.all([
        projectsAPI.getUserProjects(),
        paymentsAPI.getUserPayments(user.id),
      ]);
      const loadedProjects = (projectResponse.projects || []) as Project[];
      setProjects(effectiveProjectId ? loadedProjects.filter((project) => project.id === effectiveProjectId) : loadedProjects);
      setPayments((paymentResponse.payments || []) as Payment[]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [effectiveProjectId, user.id]);

  const paymentForProject = (id: string) =>
    payments.find((payment) => payment.projectId === id && ['pending', 'paid_directly'].includes(payment.paymentStatus));

  const payFreelancer = async (project: Project) => {
    setPayingProjectId(project.id);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) throw new Error('Unable to load Razorpay Checkout');

      const response = await paymentsAPI.createPayment({
        projectId: project.id,
        amount: Number(project.budget),
        currency: 'INR',
        studentUpiId: studentUpiId || undefined,
        studentPaymentNote: 'Direct client-to-student MVP payment. Workzy platform fee: 0%.',
      });

      const options = {
        key: response.keyId,
        amount: response.order.amount,
        currency: response.order.currency,
        name: 'Workzy',
        description: `Direct payment for ${project.title}`,
        order_id: response.order.id,
        prefill: response.checkout?.prefill,
        config: response.checkout?.config,
        theme: { color: '#16a34a' },
        retry: { enabled: true },
        handler: async (razorpayResponse: any) => {
          await paymentsAPI.verifyPayment({
            paymentId: response.payment.id,
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
            paymentMethod: 'upi',
          });
          toast.success('Payment successful. Project is now active.');
          await loadData();
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment was not completed. You can retry anytime.');
          },
        },
      };

      const checkout = new window.Razorpay(options);
      checkout.on('payment.failed', async (failure: any) => {
        if (response.payment?.id) {
          await paymentsAPI.updatePaymentStatus(response.payment.id, 'failed').catch(() => null);
        }
        toast.error(failure?.error?.description || 'Payment failed. Please retry with UPI.');
        await loadData();
      });
      checkout.open();
    } catch (error: any) {
      toast.error(error.message || 'Unable to start payment');
    } finally {
      setPayingProjectId(null);
    }
  };

  const markCompleted = async (project: Project) => {
    try {
      await projectsAPI.updateProjectStatus(project.id, 'completed');
      toast.success('Project marked completed. You can now leave a review.');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Unable to complete project');
    }
  };

  const visibleProjects = projects.filter((project) => {
    const status = getProjectStatus(project.status);
    return isClient
      ? status !== 'cancelled'
      : ['payment_pending', 'paid_directly', 'active', 'submitted', 'completed', 'proposal_accepted'].includes(status);
  });

  useEffect(() => {
    if (!effectiveProjectId || loading || !isClient || payingProjectId) return;
    if (autoOpenedProjectId.current === effectiveProjectId) return;

    const project = projects.find((item) => item.id === effectiveProjectId);
    if (!project) return;

    const status = getProjectStatus(project.status);
    const payment = paymentForProject(project.id);
    const paid =
      payment?.paymentStatus === 'paid_directly' || ['paid_directly', 'active', 'submitted', 'completed'].includes(status);
    if (paid || status === 'cancelled') return;

    autoOpenedProjectId.current = effectiveProjectId;
    void payFreelancer(project);
  }, [effectiveProjectId, loading, isClient, payingProjectId, projects, payments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl text-foreground">Direct Payments</h1>
            <p className="text-muted-foreground">UPI-first Razorpay payments. Workzy fee is 0%.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <Card className="border-green-200 bg-green-50/40 dark:bg-green-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm text-foreground">Simple direct payment flow</p>
              <p className="text-sm text-muted-foreground">
                The client pays after proposal acceptance, Workzy records payment status, and the project starts after Razorpay verification.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isFreelancer && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Student Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              value={studentUpiId}
              onChange={(event) => setStudentUpiId(event.target.value)}
              placeholder="yourname@upi"
            />
            <p className="text-xs text-muted-foreground">
              Share this UPI ID with the client in chat. Razorpay payment verification still happens through Workzy.
            </p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading payment workflow...</p>
          </CardContent>
        </Card>
      ) : visibleProjects.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-lg text-foreground mb-2">No direct payments yet</h3>
            <p className="text-muted-foreground">
              Payments appear here after a proposal is accepted and the project enters payment pending.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleProjects.map((project) => {
            const payment = paymentForProject(project.id);
            const status = getProjectStatus(project.status);
            const paid =
              payment?.paymentStatus === 'paid_directly' || ['paid_directly', 'active', 'submitted', 'completed'].includes(status);

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg">{project.title || 'Project'}</CardTitle>
                        <p className="text-sm text-muted-foreground">{formatCurrency(project.budget)}</p>
                      </div>
                      <Badge variant={paid ? 'default' : 'secondary'}>{paid ? 'paid directly' : status.replace('_', ' ')}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Method</p>
                          <p className="text-sm text-foreground">UPI via Razorpay</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {paid ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-amber-600" />}
                        <div>
                          <p className="text-xs text-muted-foreground">Payment</p>
                          <p className="text-sm text-foreground">{payment?.paymentStatus?.replace('_', ' ') || 'not started'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reference</p>
                        <p className="text-sm text-foreground break-all">{payment?.razorpayPaymentId || payment?.razorpayOrderId || '-'}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {isClient && !paid && (
                        <Button onClick={() => payFreelancer(project)} disabled={payingProjectId === project.id} className="gap-2">
                          {payingProjectId === project.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Smartphone className="w-4 h-4" />
                          )}
                          Pay Freelancer
                        </Button>
                      )}
                      {isClient && status === 'submitted' && (
                        <Button variant="outline" onClick={() => markCompleted(project)}>
                          Mark Completed
                        </Button>
                      )}
                      {payment?.paymentStatus === 'failed' && isClient && (
                        <Button variant="secondary" onClick={() => payFreelancer(project)}>
                          Retry Payment
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
