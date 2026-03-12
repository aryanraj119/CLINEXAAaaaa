import { initDatabase, runQuery, insertRecord, updateRecord, deleteRecord, generateId, hashPassword } from './client';

let currentUser: { id: string; email: string } | null = null;

interface QueryBuilder {
  eq(column: string, value: unknown): QueryBuilder;
  neq(column: string, value: unknown): QueryBuilder;
  gte(column: string, value: unknown): QueryBuilder;
  lte(column: string, value: unknown): QueryBuilder;
  like(column: string, value: string): QueryBuilder;
  in(column: string, values: unknown[]): QueryBuilder;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder;
  limit(count: number): QueryBuilder;
  single(): Promise<{ data: unknown; error: { message: string } | null }>;
  then(resolve: (value: { data: unknown[]; error: null }) => void, reject?: (reason?: any) => void): void;
}

function createQueryBuilder(table: string): QueryBuilder {
  let conditions: { column: string; value: unknown; op: string }[] = [];
  let orderBy: { column: string; asc: boolean } | null = null;
  let limitCount: number | null = null;
  
  const executeQuery = (): any[] => {
    let data = runQuery(table);
    
    for (const cond of conditions) {
      data = data.filter((row: any) => {
        if (cond.op === '=') return row[cond.column] === cond.value;
        if (cond.op === '!=') return row[cond.column] !== cond.value;
        if (cond.op === '>=') return row[cond.column] >= cond.value;
        if (cond.op === '<=') return row[cond.column] <= cond.value;
        if (cond.op === 'LIKE') return String(row[cond.column] || '').toLowerCase().includes(String(cond.value).replace('%', '').toLowerCase());
        if (cond.op === 'IN') return (cond.value as any[]).includes(row[cond.column]);
        return true;
      });
    }
    
    if (orderBy) {
      data.sort((a: any, b: any) => {
        const aVal = a[orderBy!.column];
        const bVal = b[orderBy!.column];
        if (orderBy!.asc) {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });
    }
    
    if (limitCount) {
      data = data.slice(0, limitCount);
    }
    
    return data;
  };
  
  const builder: QueryBuilder = {
    eq: (column: string, value: unknown) => {
      conditions.push({ column, value, op: '=' });
      return builder;
    },
    neq: (column: string, value: unknown) => {
      conditions.push({ column, value, op: '!=' });
      return builder;
    },
    gte: (column: string, value: unknown) => {
      conditions.push({ column, value, op: '>=' });
      return builder;
    },
    lte: (column: string, value: unknown) => {
      conditions.push({ column, value, op: '<=' });
      return builder;
    },
    like: (column: string, value: string) => {
      conditions.push({ column, value, op: 'LIKE' });
      return builder;
    },
    in: (column: string, values: unknown[]) => {
      conditions.push({ column, value: values, op: 'IN' });
      return builder;
    },
    order: (column: string, options: { ascending?: boolean } = {}) => {
      orderBy = { column, asc: options.ascending !== false };
      return builder;
    },
    limit: (count: number) => {
      limitCount = count;
      return builder;
    },
    single: async () => {
      const data = executeQuery();
      return { data: data[0] || null, error: data.length === 0 ? { message: 'Not found' } : null };
    },
    then: (resolve: (value: { data: unknown[]; error: null }) => void) => {
      const data = executeQuery();
      resolve({ data, error: null });
    }
  };
  
  return builder;
}

export const localDb = {
  auth: {
    getSession: async () => {
      return { data: { session: currentUser ? { user: currentUser } : null }, error: null };
    },
    onAuthStateChange: (callback: (event: string, session: { user: { id: string; email: string } } | null) => void) => {
      callback('SIGNED_IN', currentUser ? { user: currentUser } : null);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const hashedPassword = await hashPassword(password);
      const users = runQuery('users').filter((u: any) => u.email === email && u.password === hashedPassword);
      if (users.length > 0) {
        currentUser = { id: users[0].id, email: users[0].email };
        return { data: { user: currentUser, session: { user: currentUser } }, error: null };
      }
      
      const id = generateId();
      insertRecord('users', { email, password: hashedPassword, full_name: email.split('@')[0], created_at: new Date().toISOString() });
      currentUser = { id, email };
      insertRecord('profiles', { id, full_name: email.split('@')[0], created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      insertRecord('user_roles', { user_id: id, role: 'patient', created_at: new Date().toISOString() });
      return { data: { user: currentUser, session: { user: currentUser } }, error: null };
    },
    signUp: async ({ email, password }: { email: string; password: string }) => {
      const existing = runQuery('users').filter((u: any) => u.email === email);
      if (existing.length > 0) {
        return { data: { user: null, session: null }, error: { message: 'User already exists' } };
      }
      const id = generateId();
      const hashedPassword = await hashPassword(password);
      insertRecord('users', { email, password: hashedPassword, full_name: email.split('@')[0], created_at: new Date().toISOString() });
      currentUser = { id, email };
      insertRecord('profiles', { id, full_name: email.split('@')[0], created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      insertRecord('user_roles', { user_id: id, role: 'patient', created_at: new Date().toISOString() });
      return { data: { user: currentUser, session: { user: currentUser } }, error: null };
    },
    signOut: async () => {
      currentUser = null;
      return { error: null };
    },
    getUser: async () => {
      return { data: { user: currentUser }, error: null };
    }
  },
  from: (table: string) => {
    return {
      select: (_columns?: string) => createQueryBuilder(table),
      insert: async (data: Record<string, unknown>) => {
        const id = insertRecord(table, data);
        return { data: [{ id, ...data }], error: null };
      },
      update: (data: Record<string, unknown>) => {
        return {
          eq: async (column: string, value: unknown) => {
            const records = runQuery(table).filter((r: any) => r[column] === value);
            if (records.length > 0) {
              updateRecord(table, records[0].id, data);
            }
            return { data: null, error: null };
          }
        };
      },
      delete: () => {
        return {
          eq: async (column: string, value: unknown) => {
            const records = runQuery(table).filter((r: any) => r[column] === value);
            if (records.length > 0) {
              deleteRecord(table, records[0].id);
            }
            return { data: null, error: null };
          }
        };
      }
    };
  },
  adminAuth: {
    login: async (email: string, password: string) => {
      const hashedPassword = await hashPassword(password);
      const users = runQuery('users').filter((u: any) => u.email === email && u.password === hashedPassword && u.is_admin);
      if (users.length > 0) {
        currentUser = { id: users[0].id, email: users[0].email };
        return { success: true, error: null };
      }
      return { success: false, error: 'Invalid admin credentials' };
    },
    logout: async () => {
      currentUser = null;
      return { success: true };
    },
    isAdmin: () => {
      return currentUser !== null;
    },
    getAdminUser: () => {
      return currentUser;
    }
  }
};

export async function initLocalDb() {
  try {
    initDatabase();
    console.log('Local database initialized');
  } catch (error) {
    console.error('Failed to initialize local database:', error);
    throw error;
  }
}

export function getCurrentUser() {
  return currentUser;
}

export { runQuery, insertRecord, updateRecord, generateId, hashPassword } from './client';
