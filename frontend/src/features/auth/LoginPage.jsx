import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, clearAuthError } from './authSlice';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [rememberMe, setRememberMe] = useState(false);

  const onSubmit = async (formValues) => {
    dispatch(clearAuthError());
    const result = await dispatch(loginUser({ ...formValues, rememberMe }));
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          Task<span>MGR</span>
        </div>
        <p className="auth-subtitle">Sign in to manage your team's work.</p>

        {error && <div className="form-error" style={{ marginBottom: 14 }}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required.' })}
            />
            {errors.password && <div className="form-error">{errors.password.message}</div>}
          </div>

          <div className="auth-checkbox-row">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>

          <button className="btn btn-primary" type="submit" disabled={status === 'loading'} style={{ width: '100%' }}>
            {status === 'loading' ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
