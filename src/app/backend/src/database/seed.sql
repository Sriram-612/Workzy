insert into users (name, email, password_hash, role, is_profile_complete, college_name, department, bio, skills, portfolio_links, hourly_rate, response_rate, completion_rate, total_projects, rating)
values
('Aarav Student', 'student@workzy.test', '$2a$12$8x3dHhtQU8LQF3uQb5oO/.4f3svJ4dT4TnOTRiBJMnx1xMkb7VQkq', 'FREELANCER', true, 'Demo Institute', 'Computer Science', 'Full-stack student freelancer focused on React and Node.', array['React','Node.js','PostgreSQL'], array['https://github.com/demo'], 25, 96, 100, 3, 4.8),
('Maya Client', 'client@workzy.test', '$2a$12$8x3dHhtQU8LQF3uQb5oO/.4f3svJ4dT4TnOTRiBJMnx1xMkb7VQkq', 'CLIENT', true, null, null, 'Founder hiring sharp student talent.', '{}', '{}', null, 90, 100, 2, 5.0)
on conflict (email) do nothing;

insert into jobs (client_id, title, description, requirements, skills, category, budget_type, fixed_budget, duration, experience_level, is_urgent)
select id, 'Build a landing page for a campus SaaS', 'Need a responsive landing page with pricing, FAQ, and contact capture for a student SaaS MVP.', 'React, clean responsive implementation, and basic form handling.', array['React','Tailwind','Frontend'], 'Development', 'FIXED', 300, '1 week', 'ENTRY', false
from users where email = 'client@workzy.test'
on conflict do nothing;
