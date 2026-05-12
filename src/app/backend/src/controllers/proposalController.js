const service = require('../services/proposalService');

async function createProposal(req, res) {
  const proposal = await service.createProposal(req.user.id, req.body);
  res.status(201).json({ message: 'Proposal submitted successfully', proposal });
}

async function getJobProposals(req, res) {
  const proposals = await service.listJobProposals(req.params.jobId, req.user.id);
  res.json({ message: 'Proposals retrieved successfully', proposals });
}

async function getUserProposals(req, res) {
  const proposals = await service.listUserProposals(req.user.id);
  res.json({ message: 'Proposals retrieved successfully', proposals });
}

async function updateStatus(req, res) {
  const result = await service.changeProposalStatus(req.params.id, req.user.id, req.body.status);
  res.json({ message: 'Proposal status updated successfully', ...result });
}

async function accept(req, res) {
  const result = await service.acceptProposal(req.params.id, req.user.id);
  res.json({ message: 'Proposal accepted successfully', ...result });
}

async function reject(req, res) {
  const result = await service.rejectProposal(req.params.id, req.user.id);
  res.json({ message: 'Proposal rejected', ...result });
}

module.exports = { createProposal, getJobProposals, getUserProposals, updateStatus, accept, reject };
