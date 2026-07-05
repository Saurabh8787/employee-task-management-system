import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, clearAuthError } from './authSlice';

const RegisterPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const password = watch('password');

  const onSubmit = async (formValues) => {
    dispatch(clearAuthError());
    const result = await dispatch(registerUser(formValues));
    if (registerUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          Task<span>MGR</span>
        </div>
        <p className="auth-subtitle">Create an account to get started.</p>

        {error && <div className="form-error" style={{ marginBottom: 14 }}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              placeholder="Jane Doe"
              {...register('fullName', { required: 'Full Name is required.' })}
            />
            {errors.fullName && <div className="form-error">{errors.fullName.message}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@company.com"
              {...register('email', { required: 'Email is required.' })}
            />
            {errors.email && <div className="form-error">{errors.email.message}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" {...register('role', { required: true })}>
              <option value="Employee">Employee</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required.',
                  minLength: { value: 8, message: 'At least 8 characters.' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                    message: 'Needs an uppercase, lowercase letter and a number.',
                  },
                })}
              />
              {errors.password && <div className="form-error">{errors.password.message}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Please confirm your password.',
                  validate: (value) => value === password || 'Passwords do not match.',
                })}
              />
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword.message}</div>}
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={status === 'loading'} style={{ width: '100%', marginTop: 8 }}>
            {status === 'loading' ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
