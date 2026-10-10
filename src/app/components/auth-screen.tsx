import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { User, Building, Zap, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '../services/api';
import type { User as UserType } from '../App';

interface AuthScreenProps {
  onLogin: (user: UserType) => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'freelancer' | 'client'>('freelancer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isLogin && !formData.name) {
      toast.error('Please enter your full name');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Login user (must succeed against real API — no mock fallback for auth)
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });

        if (!response?.user || !response?.token) {
          throw new Error('Invalid email or password');
        }

        const user: UserType = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role.toLowerCase() as 'freelancer' | 'client',
          isProfileComplete: response.user.isProfileComplete,
          avatar: response.user.avatar,
          skills: response.user.skills,
          hourlyRate: response.user.hourlyRate,
          company: response.user.company,
          collegeName: response.user.collegeName,
          department: response.user.department,
          bio: response.user.bio,
          portfolio: response.user.portfolio,
          responseRate: response.user.responseRate,
          completionRate: response.user.completionRate,
          totalProjects: response.user.totalProjects,
          rating: response.user.rating,
        };

        toast.success('Welcome back!');
        onLogin(user);
      } else {
        // Register user
        const response = await authAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: selectedRole.toUpperCase() as 'FREELANCER' | 'CLIENT',
        });

        if (!response?.user || !response?.token) {
          throw new Error('Registration failed. Please try again.');
        }

        const user: UserType = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role.toLowerCase() as 'freelancer' | 'client',
          isProfileComplete: response.user.isProfileComplete,
          avatar: response.user.avatar,
          rating: 0,
          totalProjects: 0,
        };

        toast.success('Account created successfully!');
        onLogin(user);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info('Password reset link sent to your email');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.88), rgba(59, 130, 246, 0.78)), url('https://images.unsplash.com/photo-1745970747689-52782301cfb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBuZXR3b3JraW5nJTIwZXZlbnR8ZW58MXx8fHwxNzU4OTc1MzIyfDA&ixlib=rb-4.1.0&q=80&w=1080')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl text-white mb-2 font-bold">Welcome to Workzy</h1>
          <p className="text-blue-100">Your freelance journey starts here</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">
              {isLogin ? 'Sign In' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <Label className="text-sm mb-3 block">Choose your role</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={selectedRole === 'freelancer' ? 'default' : 'outline'}
                      onClick={() => setSelectedRole('freelancer')}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                    >
                      <User className="w-5 h-5" />
                      <span className="text-sm">Freelancer</span>
                    </Button>
                    <Button
                      type="button"
                      variant={selectedRole === 'client' ? 'default' : 'outline'}
                      onClick={() => setSelectedRole('client')}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                    >
                      <Building className="w-5 h-5" />
                      <span className="text-sm">Client</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    required={!isLogin}
                  />
                </div>
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-600 hover:text-blue-700 p-0 h-auto"
                  >
                    Forgot password?
                  </Button>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            <Separator />

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                type="button"
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-700 p-0 h-auto"
              >
                {isLogin ? 'Sign up here' : 'Sign in here'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}