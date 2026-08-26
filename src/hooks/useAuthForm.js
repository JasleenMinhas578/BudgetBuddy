import { useState } from 'react';

export function useAuthForm() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  return { error, setError, message, setMessage, loading, setLoading };
}
