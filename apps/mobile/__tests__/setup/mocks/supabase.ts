/**
 * Mocks pour Supabase
 */

import { mockSession, mockUser } from './data';

/**
 * Mock de l'authentification Supabase
 */
export const mockSupabaseAuth = {
  getSession: jest.fn(() =>
    Promise.resolve({
      data: { session: null },
      error: null,
    })
  ),
  
  signInWithPassword: jest.fn(() =>
    Promise.resolve({
      data: { user: mockUser, session: mockSession },
      error: null,
    })
  ),
  
  signUp: jest.fn(() =>
    Promise.resolve({
      data: { user: mockUser, session: mockSession },
      error: null,
    })
  ),
  
  signOut: jest.fn(() =>
    Promise.resolve({
      error: null,
    })
  ),
  
  resetPasswordForEmail: jest.fn(() =>
    Promise.resolve({
      data: {},
      error: null,
    })
  ),
  
  onAuthStateChange: jest.fn(() => ({
    data: {
      subscription: {
        unsubscribe: jest.fn(),
      },
    },
  })),
};

/**
 * Mock de la base de données Supabase
 */
export const mockSupabaseDatabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
  })),
};

/**
 * Mock du storage Supabase
 */
export const mockSupabaseStorage = {
  from: jest.fn(() => ({
    upload: jest.fn(() =>
      Promise.resolve({
        data: { path: 'test/file.jpg' },
        error: null,
      })
    ),
    download: jest.fn(() =>
      Promise.resolve({
        data: new Blob(['test']),
        error: null,
      })
    ),
    remove: jest.fn(() =>
      Promise.resolve({
        data: {},
        error: null,
      })
    ),
    getPublicUrl: jest.fn(() => ({
      data: {
        publicUrl: 'https://test.supabase.co/storage/v1/object/public/test/file.jpg',
      },
    })),
  })),
};

/**
 * Réinitialise tous les mocks Supabase
 */
export const resetSupabaseMocks = () => {
  Object.values(mockSupabaseAuth).forEach((mock) => {
    if (typeof mock === 'function' && mock.mockReset) {
      mock.mockReset();
    }
  });
};






