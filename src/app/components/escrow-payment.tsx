import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { 
  Shield, DollarSign, Clock, CheckCircle, XCircle, 
  CreditCard, Wallet, AlertCircle, RefreshCw, Download,
  ArrowUpRight, ArrowDownLeft, FileText, Calendar, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '../App';

interface EscrowPaymentProps {
  user: User;
  projectId?: string;
}

interface EscrowTransaction {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  freelancerName: string;
  totalAmount: number;
  platformCommission: number;
  netAmount: number;
  status: 'pending_deposit' | 'deposited' | 'work_in_progress' | 'pending_approval' | 'dispute' | 'released' | 'refunded';
  milestones: EscrowMilestone[];
  createdAt: string;
  updatedAt: string;
  autoReleaseDate?: string;
  disputeReason?: string;
}

interface EscrowMilestone {
  id: string;
  description: string;
  amount: number;
  status: 'pending' | 'deposited' | 'work_submitted' | 'approved' | 'released' | 'disputed';
  dueDate: string;
  submittedAt?: string;
  approvedAt?: string;
  releasedAt?: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'upi';
  details: string;
  isDefault: boolean;
}

export function EscrowPayment({ user, projectId }: EscrowPaymentProps) {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([
    // Sample data for demonstration
    {
      id: '1',
      projectId: 'proj_1',
      projectTitle: 'E-commerce Website Development',
      clientName: 'Tech Startup Inc.',
      freelancerName: 'John Developer',
      totalAmount: 50000,
      platformCommission: 4950,
      netAmount: 45050,
      status: 'work_in_progress',
      milestones: [
        {
          id: 'm1',
          description: 'Design Phase',
          amount: 20000,
          status: 'released',
          dueDate: '2024-01-15',
          submittedAt: '2024-01-14T10:00:00Z',
          approvedAt: '2024-01-15T14:30:00Z',
          releasedAt: '2024-01-15T14:30:00Z'
        },
        {
          id: 'm2',
          description: 'Development Phase',
          amount: 25000,
          status: 'work_submitted',
          dueDate: '2024-02-01',
          submittedAt: '2024-01-30T16:00:00Z'
        },
        {
          id: 'm3',
          description: 'Testing & Deployment',
          amount: 5000,
          status: 'pending',
          dueDate: '2024-02-15'
        }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-30T16:00:00Z',
      autoReleaseDate: '2024-02-07T16:00:00Z'
    }
  ]);

  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<EscrowTransaction | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<EscrowMilestone | null>(null);
  const [depositAmount, setDepositAmount] = useState(0);
  const [paymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', details: '**** **** **** 1234', isDefault: true },
    { id: '2', type: 'upi', details: 'user@paytm', isDefault: false },
    { id: '3', type: 'bank', details: 'HDFC Bank ****5678', isDefault: false }
  ]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0].id);
  const [disputeReason, setDisputeReason] = useState('');

  const depositFunds = () => {
    if (depositAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Simulate payment processing
    toast.info('Processing payment...');
    
    setTimeout(() => {
      // Create new transaction
      const newTransaction: EscrowTransaction = {
        id: Date.now().toString(),
        projectId: projectId || 'proj_new',
        projectTitle: 'New Project',
        clientName: user.role === 'client' ? user.name : 'Client Name',
        freelancerName: user.role === 'freelancer' ? user.name : 'Freelancer Name',
        totalAmount: depositAmount,
        platformCommission: (depositAmount * 9.9) / 100,
        netAmount: depositAmount - (depositAmount * 9.9) / 100,
        status: 'deposited',
        milestones: [{
          id: 'm1',
          description: 'Full Project',
          amount: depositAmount,
          status: 'deposited',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        autoReleaseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setShowDepositDialog(false);
      setDepositAmount(0);
      toast.success('Funds deposited successfully in escrow!');
    }, 2000);
  };

  const submitWork = (transactionId: string, milestoneId: string) => {
    setTransactions(prev => prev.map(transaction => {
      if (transaction.id === transactionId) {
        const updatedMilestones = transaction.milestones.map(milestone => {
          if (milestone.id === milestoneId) {
            return {
              ...milestone,
              status: 'work_submitted' as const,
              submittedAt: new Date().toISOString()
            };
          }
          return milestone;
        });

        // Set auto-release date (7 days from submission)
        const autoReleaseDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        return {
          ...transaction,
          milestones: updatedMilestones,
          status: 'pending_approval' as const,
          autoReleaseDate,
          updatedAt: new Date().toISOString()
        };
      }
      return transaction;
    }));

    toast.success('Work submitted! Client has 7 days to approve or funds will be auto-released.');
  };

  const approveWork = (transactionId: string, milestoneId: string) => {
    setTransactions(prev => prev.map(transaction => {
      if (transaction.id === transactionId) {
        const updatedMilestones = transaction.milestones.map(milestone => {
          if (milestone.id === milestoneId) {
            return {
              ...milestone,
              status: 'approved' as const,
              approvedAt: new Date().toISOString()
            };
          }
          return milestone;
        });

        return {
          ...transaction,
          milestones: updatedMilestones,
          updatedAt: new Date().toISOString()
        };
      }
      return transaction;
    }));

    // Auto-release funds
    setTimeout(() => releaseFunds(transactionId, milestoneId), 1000);
    toast.success('Work approved! Funds will be released to freelancer.');
  };

  const releaseFunds = (transactionId: string, milestoneId: string) => {
    setTransactions(prev => prev.map(transaction => {
      if (transaction.id === transactionId) {
        const updatedMilestones = transaction.milestones.map(milestone => {
          if (milestone.id === milestoneId) {
            return {
              ...milestone,
              status: 'released' as const,
              releasedAt: new Date().toISOString()
            };
          }
          return milestone;
        });

        // Check if all milestones are released
        const allReleased = updatedMilestones.every(m => m.status === 'released');
        
        return {
          ...transaction,
          milestones: updatedMilestones,
          status: allReleased ? 'released' as const : transaction.status,
          updatedAt: new Date().toISOString()
        };
      }
      return transaction;
    }));

    toast.success('Funds released to freelancer!');
  };

  const raiseDispute = (transactionId: string, milestoneId: string) => {
    if (!disputeReason.trim()) {
      toast.error('Please provide a reason for the dispute');
      return;
    }

    setTransactions(prev => prev.map(transaction => {
      if (transaction.id === transactionId) {
        const updatedMilestones = transaction.milestones.map(milestone => {
          if (milestone.id === milestoneId) {
            return {
              ...milestone,
              status: 'disputed' as const
            };
          }
          return milestone;
        });

        return {
          ...transaction,
          milestones: updatedMilestones,
          status: 'dispute' as const,
          disputeReason,
          updatedAt: new Date().toISOString()
        };
      }
      return transaction;
    }));

    setSelectedTransaction(null);
    setSelectedMilestone(null);
    setDisputeReason('');
    toast.success('Dispute raised. Our team will review and respond within 24-48 hours.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deposited':
      case 'work_in_progress':
        return 'bg-blue-500';
      case 'work_submitted':
      case 'pending_approval':
        return 'bg-yellow-500';
      case 'approved':
      case 'released':
        return 'bg-green-500';
      case 'dispute':
      case 'disputed':
        return 'bg-red-500';
      case 'refunded':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'upi':
        return <Wallet className="w-4 h-4" />;
      case 'bank':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const calculateProgress = (milestones: EscrowMilestone[]) => {
    const releasedAmount = milestones
      .filter(m => m.status === 'released')
      .reduce((sum, m) => sum + m.amount, 0);
    const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
    return totalAmount > 0 ? (releasedAmount / totalAmount) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl text-foreground">Escrow Payments</h1>
            <p className="text-muted-foreground">Secure payments with 9.9% platform commission</p>
          </div>
        </div>
        {user.role === 'client' && (
          <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Shield className="w-4 h-4" />
                Deposit Funds
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deposit Funds to Escrow</DialogTitle>
                <DialogDescription>
                  Secure your project by depositing funds that will be held safely until work is completed.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-foreground">Amount (₹)</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={depositAmount || ''}
                    onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                  />
                  {depositAmount > 0 && (
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Project Amount:</span>
                        <span className="text-foreground">₹{depositAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Platform Commission (9.9%):</span>
                        <span className="text-foreground">₹{((depositAmount * 9.9) / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
                        <span className="text-foreground">Total to Deposit:</span>
                        <span className="text-foreground">₹{(depositAmount + (depositAmount * 9.9) / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-foreground">Payment Method</label>
                  <div className="space-y-2">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedPaymentMethod === method.id 
                            ? 'border-primary bg-accent' 
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        {getPaymentMethodIcon(method.type)}
                        <span className="flex-1 text-foreground">{method.details}</span>
                        {method.isDefault && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="text-blue-800 dark:text-blue-200 mb-1">Secure Escrow Protection</h5>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your funds are held securely in escrow until the freelancer completes the work to your satisfaction. 
                        Funds are automatically released 7 days after work submission if no action is taken.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowDepositDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={depositFunds} disabled={depositAmount <= 0} className="flex-1">
                    Deposit ₹{(depositAmount + (depositAmount * 9.9) / 100).toFixed(2)}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <Card className="p-8 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg text-foreground mb-2">No Escrow Transactions</h3>
            <p className="text-muted-foreground mb-4">
              {user.role === 'client' 
                ? 'Deposit funds in escrow to secure your projects and protect both parties.'
                : 'Escrow transactions will appear here when clients deposit funds for your projects.'
              }
            </p>
            {user.role === 'client' && (
              <Button onClick={() => setShowDepositDialog(true)}>
                Make First Deposit
              </Button>
            )}
          </Card>
        ) : (
          transactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{transaction.projectTitle}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {transaction.clientName} → {transaction.freelancerName}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        transaction.status === 'released' ? 'default' :
                        transaction.status === 'dispute' ? 'destructive' :
                        'secondary'
                      }>
                        {transaction.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        ID: {transaction.id}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Amount Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-foreground">₹{transaction.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Commission</p>
                        <p className="text-foreground">₹{transaction.platformCommission.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Net Amount</p>
                        <p className="text-foreground">₹{transaction.netAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-foreground">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-foreground">Payment Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {calculateProgress(transaction.milestones).toFixed(0)}% Released
                      </span>
                    </div>
                    <Progress value={calculateProgress(transaction.milestones)} className="h-2" />
                  </div>

                  {/* Milestones */}
                  <div className="space-y-3">
                    <h4 className="text-foreground">Milestones</h4>
                    {transaction.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(milestone.status)}`}></div>
                          <div>
                            <p className="text-foreground">{milestone.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>₹{milestone.amount.toLocaleString()}</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Due: {new Date(milestone.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {milestone.status.replace('_', ' ')}
                          </Badge>
                          
                          {/* Freelancer Actions */}
                          {user.role === 'freelancer' && milestone.status === 'deposited' && (
                            <Button
                              size="sm"
                              onClick={() => submitWork(transaction.id, milestone.id)}
                            >
                              Submit Work
                            </Button>
                          )}

                          {/* Client Actions */}
                          {user.role === 'client' && milestone.status === 'work_submitted' && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setSelectedMilestone(milestone);
                                  setShowMilestoneDialog(true);
                                }}
                              >
                                Review
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => approveWork(transaction.id, milestone.id)}
                              >
                                Approve
                              </Button>
                            </div>
                          )}

                          {milestone.status === 'released' && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          
                          {milestone.status === 'disputed' && (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Auto-release warning */}
                  {transaction.autoReleaseDate && transaction.status === 'pending_approval' && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          Auto-release on: {new Date(transaction.autoReleaseDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Milestone Review Dialog */}
      <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
        <DialogContent>
          {selectedMilestone && selectedTransaction && (
            <>
              <DialogHeader>
                <DialogTitle>Review Milestone Work</DialogTitle>
                <DialogDescription>
                  Review the submitted work and decide whether to approve or raise a dispute.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-foreground mb-2">{selectedMilestone.description}</h4>
                  <p className="text-sm text-muted-foreground">
                    Amount: ₹{selectedMilestone.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Submitted: {selectedMilestone.submittedAt ? new Date(selectedMilestone.submittedAt).toLocaleString() : 'Not submitted'}
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Work Submission</p>
                  <p className="text-foreground">The freelancer has submitted their work for this milestone. Please review and either approve to release funds or raise a dispute if the work doesn't meet requirements.</p>
                </div>

                <div>
                  <label className="text-sm text-foreground">Dispute Reason (if any)</label>
                  <textarea
                    className="w-full mt-1 p-2 border border-border rounded text-foreground bg-background"
                    rows={3}
                    placeholder="Describe any issues with the submitted work..."
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowMilestoneDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => raiseDispute(selectedTransaction.id, selectedMilestone.id)}
                    disabled={!disputeReason.trim()}
                    className="flex-1"
                  >
                    Raise Dispute
                  </Button>
                  <Button
                    onClick={() => {
                      approveWork(selectedTransaction.id, selectedMilestone.id);
                      setShowMilestoneDialog(false);
                    }}
                    className="flex-1"
                  >
                    Approve & Release
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}