import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { userService } from '../services/userService';
import { validateEmail, validatePassword } from '../utils/validation';
import toast from 'react-hot-toast';

export const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true,
  });
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100 flex flex-col justify-center py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/login" className="inline-block group mb-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white p-1.5 shadow-md shadow-blue-500/10 border border-slate-200/80 group-hover:scale-105 transition-transform duration-200">
            <img
              src="/logo.png"
              alt="CampusSettle"
              className="w-full h-full object-contain"
            />
          </div>
        </Link>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Welcome to Campus<span className="text-blue-600">Settle</span>
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 max-w-xs mx-auto font-medium">
          Smart expense sharing, item-based splits, and debt settlements for students.
        </p>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-5 sm:px-8 rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-3.5">
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
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password ? errors.password : ''}
              icon={Lock}
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              required
            />

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full shadow-md shadow-blue-500/20 mt-1"
              size="lg"
              loading={loading}
              icon={LogIn}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-4 pt-3.5 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link
              to="/signup"
              className="font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5 ml-1"
            >
              Create Account <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
