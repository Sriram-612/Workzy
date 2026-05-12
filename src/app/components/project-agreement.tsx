import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { 
  FileText, Shield, Clock, DollarSign, AlertTriangle, 
  CheckCircle, XCircle, Eye, Download, Send, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '../App';

interface ProjectAgreementProps {
  user: User;
  projectId?: string;
  onAgreementSigned?: (agreementId: string) => void;
}

interface Agreement {
  id: string;
  projectTitle: string;
  clientName: string;
  freelancerName: string;
  projectScope: string;
  deliverables: string[];
  timeline: string;
  milestones: Milestone[];
  totalAmount: number;
  escrowAmount: number;
  platformCommission: number;
  revisionCount: number;
  refundPolicy: string;
  approvalProcess: string;
  disputeProcess: string;
  status: 'draft' | 'pending_client' | 'pending_freelancer' | 'signed' | 'disputed';
  clientSignature?: {
    date: string;
    ipAddress: string;
  };
  freelancerSignature?: {
    date: string;
    ipAddress: string;
  };
  createdAt: string;
}

interface Milestone {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
}

export function ProjectAgreement({ user, projectId, onAgreementSigned }: ProjectAgreementProps) {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [newAgreement, setNewAgreement] = useState({
    projectTitle: '',
    clientName: '',
    freelancerName: '',
    projectScope: '',
    deliverables: [''],
    timeline: '',
    totalAmount: 0,
    revisionCount: 2,
    milestones: [{
      id: '1',
      description: '',
      amount: 0,
      dueDate: '',
      status: 'pending' as const
    }]
  });
  const [clientAgreed, setClientAgreed] = useState(false);
  const [freelancerAgreed, setFreelancerAgreed] = useState(false);

  const platformCommissionRate = 9.9; // 9.9% commission

  const calculateCommission = (amount: number) => {
    return (amount * platformCommissionRate) / 100;
  };

  const calculateEscrowAmount = (amount: number) => {
    return amount + calculateCommission(amount);
  };

  const createAgreement = () => {
    if (!newAgreement.projectTitle || !newAgreement.projectScope || !newAgreement.totalAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const agreement: Agreement = {
      id: Date.now().toString(),
      projectTitle: newAgreement.projectTitle,
      clientName: newAgreement.clientName || 'Client',
      freelancerName: newAgreement.freelancerName || 'Freelancer',
      projectScope: newAgreement.projectScope,
      deliverables: newAgreement.deliverables.filter(d => d.trim()),
      timeline: newAgreement.timeline,
      milestones: newAgreement.milestones,
      totalAmount: newAgreement.totalAmount,
      escrowAmount: calculateEscrowAmount(newAgreement.totalAmount),
      platformCommission: calculateCommission(newAgreement.totalAmount),
      revisionCount: newAgreement.revisionCount,
      refundPolicy: 'Partial or full refund depending on completion quality and stage of project.',
      approvalProcess: 'Client must approve work to release payment. Auto-release after 7 days if no response.',
      disputeProcess: 'Disputes must be raised within 14 days. Neutral resolution by platform team.',
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    setAgreements(prev => [agreement, ...prev]);
    setShowCreateDialog(false);
    setNewAgreement({
      projectTitle: '',
      clientName: '',
      freelancerName: '',
      projectScope: '',
      deliverables: [''],
      timeline: '',
      totalAmount: 0,
      revisionCount: 2,
      milestones: [{
        id: '1',
        description: '',
        amount: 0,
        dueDate: '',
        status: 'pending'
      }]
    });
    toast.success('Project agreement created successfully');
  };

  const signAgreement = (agreementId: string, role: 'client' | 'freelancer') => {
    setAgreements(prev => prev.map(agreement => {
      if (agreement.id === agreementId) {
        const signature = {
          date: new Date().toISOString(),
          ipAddress: '192.168.1.1' // Mock IP address
        };

        const updatedAgreement = {
          ...agreement,
          [role === 'client' ? 'clientSignature' : 'freelancerSignature']: signature
        };

        // Check if both parties have signed
        const bothSigned = role === 'client' 
          ? updatedAgreement.freelancerSignature && signature
          : updatedAgreement.clientSignature && signature;

        if (bothSigned) {
          updatedAgreement.status = 'signed';
          toast.success('Agreement fully signed! Project can now begin.');
          onAgreementSigned?.(agreementId);
        } else {
          updatedAgreement.status = role === 'client' ? 'pending_freelancer' : 'pending_client';
          toast.success(`Agreement signed as ${role}. Waiting for other party.`);
        }

        return updatedAgreement;
      }
      return agreement;
    }));
  };

  const addDeliverable = () => {
    setNewAgreement(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, '']
    }));
  };

  const updateDeliverable = (index: number, value: string) => {
    setNewAgreement(prev => ({
      ...prev,
      deliverables: prev.deliverables.map((d, i) => i === index ? value : d)
    }));
  };

  const removeDeliverable = (index: number) => {
    setNewAgreement(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  const addMilestone = () => {
    setNewAgreement(prev => ({
      ...prev,
      milestones: [...prev.milestones, {
        id: Date.now().toString(),
        description: '',
        amount: 0,
        dueDate: '',
        status: 'pending'
      }]
    }));
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    setNewAgreement(prev => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => 
        i === index ? { ...m, [field]: value } : m
      )
    }));
  };

  const removeMilestone = (index: number) => {
    setNewAgreement(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
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
          <h1 className="text-2xl text-foreground">Project Agreements</h1>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <FileText className="w-4 h-4" />
              Create Agreement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Project Agreement</DialogTitle>
              <DialogDescription>
                Generate a comprehensive agreement that protects both parties and ensures project success.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-foreground">Project Title *</label>
                  <Input
                    placeholder="Enter project title"
                    value={newAgreement.projectTitle}
                    onChange={(e) => setNewAgreement(prev => ({ ...prev, projectTitle: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground">Timeline</label>
                  <Input
                    placeholder="e.g., 2 weeks, 30 days"
                    value={newAgreement.timeline}
                    onChange={(e) => setNewAgreement(prev => ({ ...prev, timeline: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground">Client Name</label>
                  <Input
                    placeholder="Client name"
                    value={newAgreement.clientName}
                    onChange={(e) => setNewAgreement(prev => ({ ...prev, clientName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground">Freelancer Name</label>
                  <Input
                    placeholder="Freelancer name"
                    value={newAgreement.freelancerName}
                    onChange={(e) => setNewAgreement(prev => ({ ...prev, freelancerName: e.target.value }))}
                  />
                </div>
              </div>

              {/* Project Scope */}
              <div>
                <label className="text-sm text-foreground">Project Scope *</label>
                <Textarea
                  placeholder="Describe the project scope, requirements, and expectations..."
                  value={newAgreement.projectScope}
                  onChange={(e) => setNewAgreement(prev => ({ ...prev, projectScope: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              {/* Deliverables */}
              <div>
                <label className="text-sm text-foreground">Deliverables</label>
                <div className="space-y-2">
                  {newAgreement.deliverables.map((deliverable, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Deliverable ${index + 1}`}
                        value={deliverable}
                        onChange={(e) => updateDeliverable(index, e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeDeliverable(index)}
                        disabled={newAgreement.deliverables.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addDeliverable}>
                    Add Deliverable
                  </Button>
                </div>
              </div>

              {/* Payment & Milestones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-foreground">Total Amount (₹) *</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newAgreement.totalAmount || ''}
                    onChange={(e) => setNewAgreement(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
                  />
                  {newAgreement.totalAmount > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>Platform Commission (9.9%): ₹{calculateCommission(newAgreement.totalAmount).toFixed(2)}</p>
                      <p>Total Escrow Amount: ₹{calculateEscrowAmount(newAgreement.totalAmount).toFixed(2)}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm text-foreground">Revision Count</label>
                  <Input
                    type="number"
                    value={newAgreement.revisionCount}
                    onChange={(e) => setNewAgreement(prev => ({ ...prev, revisionCount: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Milestones */}
              <div>
                <label className="text-sm text-foreground">Milestones</label>
                <div className="space-y-3">
                  {newAgreement.milestones.map((milestone, index) => (
                    <Card key={milestone.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          placeholder="Milestone description"
                          value={milestone.description}
                          onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Amount (₹)"
                          value={milestone.amount || ''}
                          onChange={(e) => updateMilestone(index, 'amount', parseFloat(e.target.value) || 0)}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="date"
                            value={milestone.dueDate}
                            onChange={(e) => updateMilestone(index, 'dueDate', e.target.value)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeMilestone(index)}
                            disabled={newAgreement.milestones.length === 1}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Button variant="outline" size="sm" onClick={addMilestone}>
                    Add Milestone
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createAgreement}>
                  Create Agreement
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Agreements List */}
      <div className="grid gap-4">
        {agreements.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg text-foreground mb-2">No Agreements Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project agreement to secure payments and protect both parties.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              Create First Agreement
            </Button>
          </Card>
        ) : (
          agreements.map((agreement) => (
            <motion.div
              key={agreement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{agreement.projectTitle}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {agreement.clientName} ↔ {agreement.freelancerName}
                      </p>
                    </div>
                    <Badge variant={
                      agreement.status === 'signed' ? 'default' :
                      agreement.status === 'disputed' ? 'destructive' :
                      'secondary'
                    }>
                      {agreement.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-foreground">₹{agreement.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Escrow</p>
                        <p className="text-foreground">₹{agreement.escrowAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Timeline</p>
                        <p className="text-foreground">{agreement.timeline || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Revisions</p>
                        <p className="text-foreground">{agreement.revisionCount} included</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {agreement.clientSignature && (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Client Signed
                        </Badge>
                      )}
                      {agreement.freelancerSignature && (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Freelancer Signed
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAgreement(agreement);
                          setShowViewDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      
                      {agreement.status !== 'signed' && !agreement.clientSignature && user.role === 'client' && (
                        <Button
                          size="sm"
                          onClick={() => signAgreement(agreement.id, 'client')}
                        >
                          Sign as Client
                        </Button>
                      )}
                      
                      {agreement.status !== 'signed' && !agreement.freelancerSignature && user.role === 'freelancer' && (
                        <Button
                          size="sm"
                          onClick={() => signAgreement(agreement.id, 'freelancer')}
                        >
                          Sign as Freelancer
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* View Agreement Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedAgreement && (
            <>
              <DialogHeader>
                <DialogTitle>Project Agreement - {selectedAgreement.projectTitle}</DialogTitle>
                <DialogDescription>
                  Complete agreement details and terms
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 text-sm">
                {/* Agreement Header */}
                <div className="border-b border-border pb-4">
                  <h3 className="text-lg text-foreground mb-2">Project Agreement</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Client:</p>
                      <p className="text-foreground">{selectedAgreement.clientName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Freelancer:</p>
                      <p className="text-foreground">{selectedAgreement.freelancerName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Project:</p>
                      <p className="text-foreground">{selectedAgreement.projectTitle}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created:</p>
                      <p className="text-foreground">{new Date(selectedAgreement.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Project Scope */}
                <div>
                  <h4 className="text-foreground mb-2">Project Scope</h4>
                  <p className="text-muted-foreground">{selectedAgreement.projectScope}</p>
                </div>

                {/* Deliverables */}
                {selectedAgreement.deliverables.length > 0 && (
                  <div>
                    <h4 className="text-foreground mb-2">Deliverables</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedAgreement.deliverables.map((deliverable, index) => (
                        <li key={index} className="text-muted-foreground">{deliverable}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Payment Terms */}
                <div>
                  <h4 className="text-foreground mb-2">Payment Terms</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-muted-foreground">Total Amount:</p>
                        <p className="text-foreground">₹{selectedAgreement.totalAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Platform Commission (9.9%):</p>
                        <p className="text-foreground">₹{selectedAgreement.platformCommission.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Escrow Amount:</p>
                        <p className="text-foreground">₹{selectedAgreement.escrowAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                {selectedAgreement.milestones.length > 0 && (
                  <div>
                    <h4 className="text-foreground mb-2">Milestones</h4>
                    <div className="space-y-2">
                      {selectedAgreement.milestones.map((milestone, index) => (
                        <div key={milestone.id} className="flex justify-between items-center p-3 bg-muted rounded">
                          <div>
                            <p className="text-foreground">{milestone.description}</p>
                            <p className="text-xs text-muted-foreground">Due: {milestone.dueDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-foreground">₹{milestone.amount.toLocaleString()}</p>
                            <Badge variant="outline" className="text-xs">
                              {milestone.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div>
                  <h4 className="text-foreground mb-2">Terms and Conditions</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-foreground">Revision Policy:</p>
                      <p className="text-muted-foreground">{selectedAgreement.revisionCount} revisions included. Additional revisions may incur extra charges.</p>
                    </div>
                    <div>
                      <p className="text-foreground">Refund Policy:</p>
                      <p className="text-muted-foreground">{selectedAgreement.refundPolicy}</p>
                    </div>
                    <div>
                      <p className="text-foreground">Approval & Completion:</p>
                      <p className="text-muted-foreground">{selectedAgreement.approvalProcess}</p>
                    </div>
                    <div>
                      <p className="text-foreground">Dispute Resolution:</p>
                      <p className="text-muted-foreground">{selectedAgreement.disputeProcess}</p>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div>
                  <h4 className="text-foreground mb-2">Digital Signatures</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-border rounded">
                      <p className="text-foreground mb-1">Client Signature</p>
                      {selectedAgreement.clientSignature ? (
                        <div>
                          <Badge variant="outline" className="gap-1 mb-2">
                            <CheckCircle className="w-3 h-3" />
                            Signed
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Signed on: {new Date(selectedAgreement.clientSignature.date).toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <XCircle className="w-3 h-3" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <div className="p-4 border border-border rounded">
                      <p className="text-foreground mb-1">Freelancer Signature</p>
                      {selectedAgreement.freelancerSignature ? (
                        <div>
                          <Badge variant="outline" className="gap-1 mb-2">
                            <CheckCircle className="w-3 h-3" />
                            Signed
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Signed on: {new Date(selectedAgreement.freelancerSignature.date).toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <XCircle className="w-3 h-3" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Agreement Acceptance */}
                {selectedAgreement.status !== 'signed' && (
                  <div className="border-t border-border pt-4">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <h5 className="text-amber-800 dark:text-amber-200 mb-1">Agreement Acknowledgement</h5>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                            By signing this agreement, both parties acknowledge that they have read, understood, and agree to all terms and conditions outlined above.
                          </p>
                          
                          {!selectedAgreement.clientSignature && user.role === 'client' && (
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="client-agree"
                                  checked={clientAgreed}
                                  onCheckedChange={(checked) => setClientAgreed(checked as boolean)}
                                />
                                <label htmlFor="client-agree" className="text-sm text-amber-700 dark:text-amber-300">
                                  I have read and agree to the terms and conditions of this project agreement.
                                </label>
                              </div>
                              <Button
                                disabled={!clientAgreed}
                                onClick={() => signAgreement(selectedAgreement.id, 'client')}
                                className="w-full"
                              >
                                Sign Agreement as Client
                              </Button>
                            </div>
                          )}
                          
                          {!selectedAgreement.freelancerSignature && user.role === 'freelancer' && (
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="freelancer-agree"
                                  checked={freelancerAgreed}
                                  onCheckedChange={(checked) => setFreelancerAgreed(checked as boolean)}
                                />
                                <label htmlFor="freelancer-agree" className="text-sm text-amber-700 dark:text-amber-300">
                                  I have read and agree to the terms and conditions of this project agreement.
                                </label>
                              </div>
                              <Button
                                disabled={!freelancerAgreed}
                                onClick={() => signAgreement(selectedAgreement.id, 'freelancer')}
                                className="w-full"
                              >
                                Sign Agreement as Freelancer
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-1" />
                  Download PDF
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}