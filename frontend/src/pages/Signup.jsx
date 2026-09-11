import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  UserPlus,
  Phone,
} from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { userService } from '../services/userService';
import {
  validateRequired,
  validateEmail,
  validateMinLength,
  validateMaxLength,
  validatePassword,
} from '../utils/validation';
import toast from 'react-hot-toast';

export const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phonenumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (field, value, allValues = formData) => {
    if (field === 'name') {
      const req = validateRequired(value, 'Name');
      if (req) return req;

      const min = validateMinLength(value, 3, 'Name');
      if (min) return min;

      return validateMaxLength(value, 50, 'Name');
    }

    if (field === 'username') {
      const req = validateRequired(value, 'Username');
      if (req) return req;

      const min = validateMinLength(value, 3, 'Username');
      if (min) return min;

      return validateMaxLength(value, 30, 'Username');
    }

    if (field === 'email') {
      return validateEmail(value);
    }

    if (field === 'phonenumber') {
      const req = validateRequired(value, 'Phone number');
      if (req) return req;

      if (!/^\d{10}$/.test(value)) {
        return 'Phone number must be exactly 10 digits';
      }

      return '';
    }

    if (field === 'password') {
      return validatePassword(value);
    }

    if (field === 'confirmPassword') {
      if (!value) return 'Please confirm your password';

      if (value !== allValues.password) {
        return 'Passwords do not match';
      }

      return '';
    }

    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updated = {
      ...formData,
      [name]: value,
    };

    setFormData(updated);

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, updated),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, formData),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameErr = validateField('name', formData.name);
    const usernameErr = validateField(
      'username',
      formData.username
    );
    const emailErr = validateField('email', formData.email);
    const phoneErr = validateField(
      'phonenumber',
      formData.phonenumber
    );
    const passErr = validateField(
      'password',
      formData.password
    );
    const confirmErr = validateField(
      'confirmPassword',
      formData.confirmPassword
    );

    if (
      nameErr ||
      usernameErr ||
      emailErr ||
      phoneErr ||
      passErr ||
      confirmErr
    ) {
      setTouched({
        name: true,
        username: true,
        email: true,
        phonenumber: true,
        password: true,
        confirmPassword: true,
      });

      setErrors({
        name: nameErr,
        username: usernameErr,
        email: emailErr,
        phonenumber: phoneErr,
        password: passErr,
        confirmPassword: confirmErr,
      });

      return;
    }

    try {
      setLoading(true);

      const res = await userService.signup({
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phonenumber: formData.phonenumber.trim(),
        password: formData.password,
      });

      if (res.success) {
        toast.success(
          `Account created! Welcome, ${res.user.name}`
        );

        navigate('/login');
      } else {
        toast.error(
          res.message || 'Unable to register'
        );

        setErrors((prev) => ({
          ...prev,
          email: res.message,
        }));
      }
    } catch (error) {
      toast.error(
        error.message || 'Unable to register'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-4">
          <Sparkles className="w-6 h-6" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create an Account
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-slate-500">
          Join CampusSettle and start splitting bills transparently.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">

            <Input
              label="Full Name"
              name="name"
              placeholder="e.g. Bharat Rathor"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name ? errors.name : ''}
              icon={User}
              required
            />

            <Input
              label="Username"
              name="username"
              placeholder="e.g. bharat123"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.username
                  ? errors.username
                  : ''
              }
              icon={User}
              required
            />

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
              required
            />

            <Input
              label="Phone Number"
              name="phonenumber"
              type="tel"
              placeholder="e.g. 9876543210"
              value={formData.phonenumber}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.phonenumber
                  ? errors.phonenumber
                  : ''
              }
              icon={Phone}
              required
            />

            <Input
              label="Password (min 8 characters)"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.password
                  ? errors.password
                  : ''
              }
              icon={Lock}
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.confirmPassword
                  ? errors.confirmPassword
                  : ''
              }
              icon={Lock}
              required
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              loading={loading}
              icon={UserPlus}
            >
              Create Account
            </Button>

          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}

            <Link
              to="/login"
              className="font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};