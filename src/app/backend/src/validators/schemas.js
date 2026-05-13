const { z } = require('zod');

const idParam = z.object({ id: z.string().uuid() });
const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['FREELANCER', 'CLIENT', 'freelancer', 'client', 'student'])
  })
});
const loginSchema = z.object({
  body: z.object({ email: z.string().email(), password: z.string().min(1) })
});
const profileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    collegeName: z.string().optional(),
    college_name: z.string().optional(),
    department: z.string().optional(),
    bio: z.string().optional(),
    skills: z.array(z.string()).optional(),
    portfolio: z.array(z.string()).optional(),
    portfolioLinks: z.array(z.string()).optional(),
    avatar: z.string().optional(),
    hourlyRate: z.number().nonnegative().optional(),
    company: z.string().optional(),
    companyName: z.string().optional(),
    companyDescription: z.string().optional(),
    companyLogo: z.string().optional(),
    website: z.string().optional()
  })
});
const jobSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    requirements: z.string().optional(),
    skills: z.array(z.string()).default([]),
    category: z.enum(['Development', 'Design', 'Video Editing', 'AI & Content']),
    budgetType: z.enum(['FIXED', 'HOURLY']),
    fixedBudget: z.number().positive().optional(),
    hourlyRate: z.number().positive().optional(),
    duration: z.string().optional(),
    experienceLevel: z.enum(['ENTRY', 'INTERMEDIATE', 'EXPERT']).default('ENTRY'),
    isUrgent: z.boolean().optional()
  })
});
const proposalSchema = z.object({
  body: z.object({
    jobId: z.string().uuid(),
    coverLetter: z.string().min(10),
    proposedBudget: z.number().positive(),
    timeline: z.string().min(1)
  })
});
const proposalStatusSchema = z.object({
  params: idParam,
  body: z.object({ status: z.enum(['ACCEPTED', 'REJECTED', 'WITHDRAWN', 'accepted', 'rejected', 'withdrawn']) })
});
const messageSchema = z.object({
  body: z
    .object({
      receiverId: z.string().uuid().optional(),
      receiverEmail: z.string().email().optional(),
      recipientName: z.string().min(2).max(200).optional(),
      content: z.string().min(1).max(20000)
    })
    .superRefine((data, ctx) => {
      const hasId = Boolean(data.receiverId);
      const hasEmail = Boolean(data.receiverEmail?.trim());
      if (!hasId && !hasEmail) {
        ctx.addIssue({ code: 'custom', message: 'Provide receiverId or receiverEmail' });
      }
      if (hasId && hasEmail) {
        ctx.addIssue({ code: 'custom', message: 'Provide only one of receiverId or receiverEmail' });
      }
      if (hasEmail && !data.recipientName?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['recipientName'],
          message: 'Recipient name is required when sending by email'
        });
      }
    })
});

const lookupEmailQuerySchema = z.object({
  query: z.object({ email: z.string().email() }),
  body: z.object({}).optional(),
  params: z.object({}).optional()
});
const paymentIntentSchema = z.object({
  body: z.object({ projectId: z.string().uuid(), amount: z.number().positive(), currency: z.string().default('usd') })
});
const reviewSchema = z.object({
  body: z.object({
    projectId: z.string().uuid(),
    revieweeId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
    isPublic: z.boolean().optional()
  })
});

const hireResponseSchema = z.object({
  body: z.object({ accept: z.boolean() })
});

module.exports = {
  idParam,
  registerSchema,
  loginSchema,
  profileSchema,
  jobSchema,
  proposalSchema,
  proposalStatusSchema,
  messageSchema,
  lookupEmailQuerySchema,
  hireResponseSchema,
  paymentIntentSchema,
  reviewSchema
};
