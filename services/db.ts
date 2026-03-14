/**
 * Kgomo's Database Service
 * Mock client for Xneelo Hosting transition
 *
 * Database: 16ueg_u4t4d
 * User: scaz6_cfqkg
 *
 * FIX LOG:
 * - insert().select().single() now persists before resolving
 * - delete().eq().eq() double-chain fixed (no race between then() and eq())
 * - signInWithPassword validates against stored users
 * - signUp prevents duplicate email registration
 * - All chainable methods return proper Promise-like objects
 */

interface QueryResult<T> {
  data: T | null;
  error: Error | null;
}

class DBClient {
  // ─── Auth ────────────────────────────────────────────────────────────────────

  auth = {
    getSession: async () => {
      try {
        const raw = localStorage.getItem('kgomos_session');
        return { data: { session: raw ? JSON.parse(raw) : null } };
      } catch {
        return { data: { session: null } };
      }
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Emit current session state immediately
      const raw = localStorage.getItem('kgomos_session');
      const session = raw ? JSON.parse(raw) : null;
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      if (!email || !password) throw new Error('Email and password are required.');
      if (password.length < 6) throw new Error('Invalid credentials.');

      // Check stored users
      const users: any[] = JSON.parse(localStorage.getItem('kgomos_users') || '[]');
      const existing = users.find((u) => u.email === email);

      if (!existing) throw new Error('No account found. Please sign up first.');
      if (existing.password !== password) throw new Error('Incorrect password.');

      const session = { user: { id: existing.id, email } };
      localStorage.setItem('kgomos_session', JSON.stringify(session));
      return { data: { session }, error: null };
    },

    signUp: async ({ email, password }: { email: string; password: string }) => {
      if (!email || !password) throw new Error('Email and password are required.');
      if (password.length < 6) throw new Error('Password must be at least 6 characters.');

      const users: any[] = JSON.parse(localStorage.getItem('kgomos_users') || '[]');
      if (users.find((u) => u.email === email)) {
        throw new Error('An account with this email already exists.');
      }

      const newUser = { id: 'u-' + Date.now().toString(36), email, password };
      users.push(newUser);
      localStorage.setItem('kgomos_users', JSON.stringify(users));

      const session = { user: { id: newUser.id, email } };
      localStorage.setItem('kgomos_session', JSON.stringify(session));
      return { data: { session }, error: null };
    },

    signOut: async () => {
      localStorage.removeItem('kgomos_session');
      window.location.reload();
    },
  };

  // ─── Table Operations ────────────────────────────────────────────────────────

  from(table: string) {
    const storageKey = `mock_${table}`;

    const getAll = (): any[] => {
      try {
        return JSON.parse(localStorage.getItem(storageKey) || '[]');
      } catch {
        return [];
      }
    };

    const saveAll = (data: any[]) => {
      localStorage.setItem(storageKey, JSON.stringify(data));
    };

    const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

    return {
      // ── SELECT ──────────────────────────────────────────────────────────────
      select: (_columns: string = '*') => {
        let filtered: any[] = getAll();

        const builder = {
          eq: (col: string, val: any) => {
            filtered = filtered.filter((i) => i[col] === val);

            const eqResult = {
              // Support chained .eq().eq()
              eq: (col2: string, val2: any) => {
                filtered = filtered.filter((i) => i[col2] === val2);
                return Promise.resolve({ data: filtered, error: null });
              },
              order: (_col: string, _opts: any) =>
                Promise.resolve({ data: filtered, error: null }),
              then: (resolve: any) =>
                resolve({ data: filtered, error: null }),
            };
            return eqResult;
          },
          order: (_col: string, _opts: any) =>
            Promise.resolve({ data: filtered, error: null }),
          then: (resolve: any) =>
            resolve({ data: filtered, error: null }),
        };

        return builder;
      },

      // ── INSERT ──────────────────────────────────────────────────────────────
      insert: (payload: any | any[]) => {
        const items = (Array.isArray(payload) ? payload : [payload]).map((i) => ({
          ...i,
          id: newId(),
          created_at: new Date().toISOString(),
          order_date: new Date().toISOString(),
        }));

        // Persist immediately
        const existing = getAll();
        saveAll([...existing, ...items]);

        const insertResult: any = {
          select: () => ({
            single: () => Promise.resolve({ data: items[0], error: null }),
          }),
          then: (resolve: any) =>
            resolve({ data: items, error: null }),
        };

        return insertResult;
      },

      // ── DELETE ──────────────────────────────────────────────────────────────
      delete: () => {
        let filters: Array<{ col: string; val: any }> = [];

        const deleteBuilder: any = {
          eq: (col: string, val: any) => {
            filters.push({ col, val });

            const eqChain: any = {
              // Support double .eq() for compound deletes (e.g. user_id AND menu_item_id)
              eq: (col2: string, val2: any) => {
                filters.push({ col: col2, val: val2 });
                let data = getAll();
                data = data.filter(
                  (item) => !filters.every((f) => item[f.col] === f.val)
                );
                saveAll(data);
                return Promise.resolve({ error: null });
              },
              then: (resolve: any) => {
                let data = getAll();
                data = data.filter(
                  (item) => !filters.every((f) => item[f.col] === f.val)
                );
                saveAll(data);
                return resolve({ error: null });
              },
            };

            return eqChain;
          },
        };

        return deleteBuilder;
      },
    };
  }
}

export const db = new DBClient();
