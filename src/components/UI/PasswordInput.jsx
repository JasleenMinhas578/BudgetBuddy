import { useState } from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';

export default function PasswordInput({ id, label, value, onChange, placeholder, required = true }) {
  const [show, setShow] = useState(false);
  const toggle = () => setShow(v => !v);

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrapper">
        <input
          type={show ? 'text' : 'password'}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
        <span
          className="input-eye"
          onClick={toggle}
          tabIndex={0}
          aria-label={show ? 'Hide password' : 'Show password'}
          role="button"
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggle(); }}
        >
          {show ? <LuEyeOff size={16} /> : <LuEye size={16} />}
        </span>
      </div>
    </div>
  );
}
