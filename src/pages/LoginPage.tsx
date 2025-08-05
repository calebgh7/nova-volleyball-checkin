import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle } from 'lucide-react';
import NovaLogo from '../components/NovaLogo';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null);
      await login(data.username, data.password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-nova-purple flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Nova Logo and Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-nova-cyan/20 to-nova-purple/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <NovaLogo size={48} />
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-6 mx-4 border border-white/20">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-white drop-shadow-lg font-black">
                Nova Volleyball Club
              </span>
            </h1>
            <h2 className="text-2xl font-bold text-white/90 mb-2 drop-shadow-md">
              Staff Portal
            </h2>
            <p className="text-white/80 text-lg drop-shadow-md font-semibold">
              Access management dashboard
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="glass rounded-3xl p-8 border border-white/20 backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-300 mr-3" />
                <span className="text-red-200 text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-white mb-2">
                Username or Email
              </label>
              <input
                {...register('username')}
                type="text"
                autoComplete="username"
                className="input-modern w-full"
                placeholder="Enter your username or email"
              />
              {errors.username && (
                <p className="mt-2 text-sm text-red-300">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="input-modern w-full"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-300">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-nova-cyan text-nova-purple font-semibold py-3 px-6 rounded-xl hover:bg-nova-cyan/80 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-nova-cyan/30 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          {/* Quick Access Link */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-white/60 text-sm mb-3">Need to check in athletes?</p>
              <Link
                to="/checkin"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-nova-cyan hover:text-white transition-colors duration-200 hover:bg-nova-cyan/10 rounded-xl"
              >
                Quick Check-In (No Login Required)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
