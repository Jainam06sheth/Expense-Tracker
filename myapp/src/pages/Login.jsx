import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { userService } from '../services/userService';
import { validateEmail, validatePassword } from '../utils/validation';
import toast from 'react-hot-toast';

export const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: 'bharat@campussettle.com',
    password: 'password123',
    rememberMe: true,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (field, value) => {
    if (field === 'email') return validateEmail(value);
    if (field === 'password') return validatePassword(value);
    return '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, val) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailErr = validateField('email', formData.email);
    const passErr = validateField('password', formData.password);

    if (emailErr || passErr) {
      setTouched({ email: true, password: true });
      setErrors({ email: emailErr, password: passErr });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = userService.login(formData.email, formData.password);
      setLoading(false);
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
        navigate('/dashboard');
      } else {
        toast.error(res.message || 'Invalid credentials');
      }
    }, 400);
  };

  const handleQuickDemoLogin = (email, password) => {
    setFormData({ email, password, rememberMe: true });
    const res = userService.login(email, password);
    if (res.success) {
      toast.success(`Logged in as ${res.user.name}`);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome to Campus<span className="text-blue-600">Settle</span>
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500">
          Smart expense sharing & debt settlement for students and friends.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="e.g. bharat@campussettle.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email ? errors.email : ''}
              icon={Mail}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password ? errors.password : ''}
              icon={Lock}
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>

              <span className="text-slate-400">Demo Mode</span>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              icon={LogIn}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Quick Demo Logins
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('bharat@campussettle.com', 'password123')}
                className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition-colors cursor-pointer text-center"
              >
                Bharat (Primary)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('aman@campussettle.com', 'password123')}
                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-colors cursor-pointer text-center"
              >
                Aman (Roommate)
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link
              to="/signup"
              className="font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5"
            >
              Sign up <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
