import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { validateRequired, validateEmail, validateMinLength } from '../../utils/validation';
import { UserPlus } from 'lucide-react';

export const AddMemberModal = ({ isOpen, onClose, onAddMember, loading = false }) => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (field, value) => {
    if (field === 'name') {
      const req = validateRequired(value, 'Name');
      if (req) return req;
      return validateMinLength(value, 2, 'Name');
    }
    if (field === 'email') {
      return validateEmail(value);
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nameErr = validateField('name', formData.name);
    const emailErr = validateField('email', formData.email);

    if (nameErr || emailErr) {
      setTouched({ name: true, email: true });
      setErrors({ name: nameErr, email: emailErr });
      return;
    }

    onAddMember(formData, () => {
      setFormData({ name: '', email: '' });
      setTouched({});
      setErrors({});
      onClose();
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Group Member"
      subtitle="Invite a friend or roommate to split expenses with."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          placeholder="e.g. Manan Shah"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.name ? errors.name : ''}
          required
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="e.g. manan@campussettle.com"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email ? errors.email : ''}
          required
        />

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={UserPlus}>
            Add Member
          </Button>
        </div>
      </form>
    </Modal>
  );
};
