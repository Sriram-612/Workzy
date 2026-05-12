function roleToDb(role) {
  if (!role) return role;
  const normalized = String(role).toLowerCase();
  if (normalized === 'freelancer' || normalized === 'student') return 'FREELANCER';
  if (normalized === 'client') return 'CLIENT';
  return String(role).toUpperCase();
}

function userToClient(user) {
  if (!user) return user;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isProfileComplete: user.is_profile_complete,
    avatar: user.avatar,
    skills: user.skills || [],
    hourlyRate: user.hourly_rate === null ? undefined : Number(user.hourly_rate),
    company: user.company_name,
    companyDescription: user.company_description,
    collegeName: user.college_name,
    department: user.department,
    bio: user.bio,
    portfolio: user.portfolio_links || [],
    responseRate: Number(user.response_rate || 0),
    completionRate: Number(user.completion_rate || 0),
    totalProjects: Number(user.total_projects || 0),
    rating: Number(user.rating || 0),
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
}

module.exports = { roleToDb, userToClient };
