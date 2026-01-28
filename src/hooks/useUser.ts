"use client";

import { useEffect, useState } from "react";

export function useUser() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; phone: string; role: 'ADMIN' | 'CUSTOMER'; membership?: { name: string; id: string } | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { user, loading };
}
