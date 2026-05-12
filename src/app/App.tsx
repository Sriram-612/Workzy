import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/theme-context';
import { SplashScreen } from './components/splash-screen';
import { WelcomeScreen } from './components/welcome-screen';
import { AuthScreen } from './components/auth-screen';
import { ProfileSetup } from './components/profile-setup';
import { FreelancerDashboard } from './components/freelancer-dashboard';
import { ClientDashboard } from './components/client-dashboard';
import { BrowseJobs } from './components/browse-jobs';
import { PostJob } from './components/post-job';
import { JobDetails } from './components/job-details';
import { SearchFreelancers } from './components/search-freelancers';
import { MessagingScreen } from './components/messaging-screen';
import { ProfileScreen } from './components/profile-screen';
import { SettingsScreen } from './components/settings-screen';
import { ProjectAgreement } from './components/project-agreement';
import { EscrowPayment } from './components/escrow-payment';
import { DevNotice } from './components/dev-notice';
import { Toaster } from './components/ui/sonner';
import { authAPI, removeAuthToken } from './services/api';

// User interface with trust system fields
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'freelancer' | 'client';
  isProfileComplete: boolean;
  avatar?: string;
  skills?: string[];
  hourlyRate?: number;
  company?: string;
  // Trust system fields
  isCollegeVerified?: boolean;
  collegeName?: string;
  collegeEmail?: string;
  isPortfolioVerified?: boolean;
  responseRate?: number; // Percentage 0-100
  completionRate?: number; // Percentage 0-100
  totalProjects?: number;
  onTimeDeliveryRate?: number; // Percentage 0-100
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Simulate splash screen delay
    setTimeout(() => {
      setIsLoading(false);
      // Check if user has seen welcome screen
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    }, 2000);
  }, []);

  const handleWelcomeComplete = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    removeAuthToken(); // Clear auth token from API service
    authAPI.logout(); // Call logout API if needed
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Check for existing user session and validate token
  useEffect(() => {
    const checkExistingSession = async () => {
      const savedUser = localStorage.getItem('user');
      const authToken = localStorage.getItem('authToken');
      
      if (savedUser && authToken) {
        try {
          // Validate token by fetching current user
          const response = await authAPI.getCurrentUser();
          if (response.user) {
            const user: User = {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              role: response.user.role.toLowerCase() as 'freelancer' | 'client',
              isProfileComplete: response.user.isProfileComplete,
              avatar: response.user.avatar,
              skills: response.user.skills,
              hourlyRate: response.user.hourlyRate,
              company: response.user.company,
            };
            setUser(user);
            // Update localStorage with fresh user data
            localStorage.setItem('user', JSON.stringify(user));
          }
        } catch (error) {
          // Token is invalid, clear session
          console.log('Session expired, clearing user data');
          handleLogout();
        }
      }
    };

    checkExistingSession();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="workzy-ui-theme">
      <Router>
        <div className="min-h-screen bg-background">
          <DevNotice />
          <Routes>
            {/* Root route - redirect based on user status */}
            <Route 
              path="/" 
              element={
                user ? (
                  <Navigate to={user.isProfileComplete ? "/dashboard" : "/profile-setup"} replace />
                ) : (
                  <Navigate to="/auth" replace />
                )
              } 
            />

            {/* Auth route */}
            <Route 
              path="/auth" 
              element={
                user ? (
                  <Navigate to={user.isProfileComplete ? "/dashboard" : "/profile-setup"} replace />
                ) : (
                  <AuthScreen onLogin={handleLogin} />
                )
              } 
            />

            {/* Protected Routes - only render if user exists */}
            {user && (
              <>
                <Route 
                  path="/profile-setup" 
                  element={
                    user.isProfileComplete ? (
                      <Navigate to="/dashboard" replace />
                    ) : (
                      <ProfileSetup user={user} onComplete={updateUser} />
                    )
                  } 
                />
                
                <Route 
                  path="/dashboard" 
                  element={
                    user.role === 'freelancer' ? (
                      <FreelancerDashboard user={user} onLogout={handleLogout} />
                    ) : (
                      <ClientDashboard user={user} onLogout={handleLogout} />
                    )
                  } 
                />
                
                <Route path="/browse-jobs" element={<BrowseJobs user={user} />} />
                <Route path="/post-job" element={<PostJob user={user} />} />
                <Route path="/job/:id" element={<JobDetails user={user} />} />
                <Route path="/search-freelancers" element={<SearchFreelancers user={user} />} />
                <Route path="/messages" element={<MessagingScreen user={user} />} />
                <Route path="/profile" element={<ProfileScreen user={user} onUpdate={updateUser} />} />
                <Route path="/settings" element={<SettingsScreen user={user} onLogout={handleLogout} />} />
                <Route path="/agreements" element={<ProjectAgreement user={user} />} />
                <Route path="/escrow" element={<EscrowPayment user={user} />} />
              </>
            )}

            {/* Catch-all route - redirect to auth if no user, dashboard if user exists */}
            <Route 
              path="*" 
              element={
                <Navigate 
                  to={user ? "/dashboard" : "/auth"} 
                  replace 
                />
              } 
            />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}