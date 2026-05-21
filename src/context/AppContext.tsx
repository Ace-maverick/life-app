import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Task, Notification, VerificationRequest, Dispute, TaskStatus, PaymentMethod, UserRole } from '../data/types';
import { DEMO_USERS, DEMO_TASKS, DEMO_NOTIFICATIONS, DEMO_VERIFICATIONS, DEMO_DISPUTES } from '../data/demoData';

// ─── State ───────────────────────────────────────────────────────────────────

interface AppState {
  isLoading: boolean;
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  notifications: Notification[];
  verifications: VerificationRequest[];
  disputes: Dispute[];
}

const initialState: AppState = {
  isLoading: true,
  currentUser: null,
  users: DEMO_USERS,
  tasks: DEMO_TASKS,
  notifications: DEMO_NOTIFICATIONS,
  verifications: DEMO_VERIFICATIONS,
  disputes: DEMO_DISPUTES,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> & { id: string } }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Partial<Task> & { id: string } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATIONS_READ'; payload: string } // userId
  | { type: 'ADD_VERIFICATION'; payload: VerificationRequest }
  | { type: 'UPDATE_VERIFICATION'; payload: Partial<VerificationRequest> & { id: string } }
  | { type: 'ADD_DISPUTE'; payload: Dispute }
  | { type: 'UPDATE_DISPUTE'; payload: Partial<Dispute> & { id: string } }
  | { type: 'RESTORE_STATE'; payload: Partial<AppState> };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN':
      return { ...state, currentUser: action.payload };
    case 'LOGOUT':
      return { ...state, currentUser: null };
    case 'UPDATE_USER': {
      const updatedUsers = state.users.map(u =>
        u.id === action.payload.id ? { ...u, ...action.payload } : u
      );
      const updatedCurrent =
        state.currentUser?.id === action.payload.id
          ? { ...state.currentUser, ...action.payload }
          : state.currentUser;
      return { ...state, users: updatedUsers, currentUser: updatedCurrent };
    }
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.userId === action.payload ? { ...n, isRead: true } : n
        ),
      };
    case 'ADD_VERIFICATION':
      return { ...state, verifications: [action.payload, ...state.verifications] };
    case 'UPDATE_VERIFICATION':
      return {
        ...state,
        verifications: state.verifications.map(v =>
          v.id === action.payload.id ? { ...v, ...action.payload } : v
        ),
      };
    case 'ADD_DISPUTE':
      return { ...state, disputes: [action.payload, ...state.disputes] };
    case 'UPDATE_DISPUTE':
      return {
        ...state,
        disputes: state.disputes.map(d =>
          d.id === action.payload.id ? { ...d, ...action.payload } : d
        ),
      };
    case 'RESTORE_STATE':
      return { ...state, ...action.payload, isLoading: false };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue extends AppState {
  // Auth
  login: (phone: string, pin: string) => Promise<User | null>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  // Tasks
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'tip' | 'discountApplied' | 'status'>) => Task;
  acceptTask: (taskId: string) => void;
  startTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  payTask: (taskId: string, method: PaymentMethod) => void;
  cancelTask: (taskId: string) => void;
  addTip: (taskId: string, amount: number) => void;
  rateTask: (taskId: string, rating: number, side: 'poster' | 'lifer') => void;
  // Notifications
  markAllRead: () => void;
  getMyNotifications: () => Notification[];
  getUnreadCount: () => number;
  // Verifications
  submitVerification: (data: Omit<VerificationRequest, 'id' | 'submittedAt' | 'status'>) => void;
  reviewVerification: (id: string, approved: boolean, note?: string) => void;
  // Disputes
  openDispute: (taskId: string, summary: string) => void;
  resolveDispute: (id: string, outcome: Dispute['outcome'], note?: string) => void;
  // Selectors
  getTaskById: (id: string) => Task | undefined;
  getUserById: (id: string) => User | undefined;
  getMyTasks: () => Task[];
  getOpenTasksForLifer: () => Task[];
  getActiveTaskForLifer: () => Task | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted session on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const stored = await AsyncStorage.getItem('@life_current_user_id');
        if (stored) {
          const user = DEMO_USERS.find(u => u.id === stored);
          if (user) {
            dispatch({ type: 'LOGIN', payload: user });
          }
        }
      } catch {
        // ignore
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    loadSession();
  }, []);

  // Auth
  const login = useCallback(async (phone: string, pin: string): Promise<User | null> => {
    const user = state.users.find(u => u.phone === phone && u.pin === pin);
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
      await AsyncStorage.setItem('@life_current_user_id', user.id);
      return user;
    }
    return null;
  }, [state.users]);

  const logout = useCallback(async () => {
    dispatch({ type: 'LOGOUT' });
    await AsyncStorage.removeItem('@life_current_user_id');
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    if (!state.currentUser) return;
    dispatch({ type: 'UPDATE_USER', payload: { id: state.currentUser.id, ...data } });
  }, [state.currentUser]);

  // Tasks
  const createTask = useCallback((data: Omit<Task, 'id' | 'createdAt' | 'tip' | 'discountApplied' | 'status'>): Task => {
    const task: Task = {
      ...data,
      id: `task_${Date.now()}`,
      tip: 0,
      discountApplied: 0,
      status: 'Open',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TASK', payload: task });
    // Notify matching lifers (demo)
    const lifer = state.users.find(u => u.role === 'lifer' && u.verificationStatus === 'approved');
    if (lifer) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `notif_${Date.now()}`,
          userId: lifer.id,
          title: 'New task nearby',
          body: `${task.title} – ETB ${task.basePrice + task.serviceCharge} – ${task.location.area}`,
          type: 'task',
          relatedTaskId: task.id,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      });
    }
    return task;
  }, [state.users]);

  const acceptTask = useCallback((taskId: string) => {
    if (!state.currentUser) return;
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: taskId,
        liferId: state.currentUser.id,
        status: 'Assigned',
        acceptedAt: new Date().toISOString(),
      },
    });
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `notif_${Date.now()}`,
          userId: task.posterId,
          title: 'Task accepted!',
          body: `${state.currentUser.name} accepted your ${task.title} task.`,
          type: 'task',
          relatedTaskId: taskId,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      });
    }
  }, [state.currentUser, state.tasks]);

  const startTask = useCallback((taskId: string) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { id: taskId, status: 'In Progress', startedAt: new Date().toISOString() },
    });
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `notif_${Date.now()}`,
          userId: task.posterId,
          title: 'Task started',
          body: `Your ${task.title} task has started.`,
          type: 'task',
          relatedTaskId: taskId,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      });
    }
  }, [state.tasks]);

  const completeTask = useCallback((taskId: string) => {
    const now = new Date().toISOString();
    const task = state.tasks.find(t => t.id === taskId);
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: taskId,
        status: 'Invoice Sent',
        completedAt: now,
        invoicedAt: now,
        invoiceId: `INV-${Date.now()}`,
      },
    });
    if (task) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `notif_${Date.now()}`,
          userId: task.posterId,
          title: 'Task complete – Invoice ready',
          body: `Your ${task.title} is done. ETB ${task.basePrice + task.serviceCharge + task.tip} ready for payment.`,
          type: 'payment',
          relatedTaskId: taskId,
          isRead: false,
          createdAt: now,
        },
      });
    }
  }, [state.tasks]);

  const payTask = useCallback((taskId: string, method: PaymentMethod) => {
    const now = new Date().toISOString();
    const task = state.tasks.find(t => t.id === taskId);
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: taskId,
        status: 'Receipt Issued',
        paidAt: now,
        receiptAt: now,
        paymentMethod: method,
        receiptId: `RCP-${Date.now()}`,
      },
    });
    if (task?.liferId) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `notif_${Date.now()}`,
          userId: task.liferId,
          title: 'Payment received',
          body: `ETB ${task.basePrice + task.serviceCharge + task.tip} paid for ${task.title}. Receipt issued.`,
          type: 'payment',
          relatedTaskId: taskId,
          isRead: false,
          createdAt: now,
        },
      });
    }
  }, [state.tasks]);

  const cancelTask = useCallback((taskId: string) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, status: 'Cancelled' } });
  }, []);

  const addTip = useCallback((taskId: string, amount: number) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, tip: task.tip + amount } });
    }
  }, [state.tasks]);

  const rateTask = useCallback((taskId: string, rating: number, side: 'poster' | 'lifer') => {
    const field = side === 'poster' ? 'liferRating' : 'posterRating';
    dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, [field]: rating } });
  }, []);

  // Notifications
  const markAllRead = useCallback(() => {
    if (state.currentUser) {
      dispatch({ type: 'MARK_NOTIFICATIONS_READ', payload: state.currentUser.id });
    }
  }, [state.currentUser]);

  const getMyNotifications = useCallback((): Notification[] => {
    if (!state.currentUser) return [];
    return state.notifications
      .filter(n => n.userId === state.currentUser!.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.currentUser, state.notifications]);

  const getUnreadCount = useCallback((): number => {
    if (!state.currentUser) return 0;
    return state.notifications.filter(n => n.userId === state.currentUser!.id && !n.isRead).length;
  }, [state.currentUser, state.notifications]);

  // Verifications
  const submitVerification = useCallback((data: Omit<VerificationRequest, 'id' | 'submittedAt' | 'status'>) => {
    dispatch({
      type: 'ADD_VERIFICATION',
      payload: { ...data, id: `ver_${Date.now()}`, status: 'submitted', submittedAt: new Date().toISOString() },
    });
    if (state.currentUser) {
      dispatch({ type: 'UPDATE_USER', payload: { id: state.currentUser.id, verificationStatus: 'submitted' } });
    }
  }, [state.currentUser]);

  const reviewVerification = useCallback((id: string, approved: boolean, note?: string) => {
    const status = approved ? 'approved' : 'rejected';
    const ver = state.verifications.find(v => v.id === id);
    dispatch({
      type: 'UPDATE_VERIFICATION',
      payload: { id, status, reviewedAt: new Date().toISOString(), reviewNote: note },
    });
    if (ver) {
      dispatch({ type: 'UPDATE_USER', payload: { id: ver.liferId, verificationStatus: status } });
    }
  }, [state.verifications]);

  // Disputes
  const openDispute = useCallback((taskId: string, summary: string) => {
    if (!state.currentUser) return;
    const dispute: Dispute = {
      id: `dispute_${Date.now()}`,
      taskId,
      raisedBy: state.currentUser.id,
      raisedByRole: state.currentUser.role,
      summary,
      status: 'Open',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_DISPUTE', payload: dispute });
    dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, status: 'Dispute Open' } });
  }, [state.currentUser]);

  const resolveDispute = useCallback((id: string, outcome: Dispute['outcome'], note?: string) => {
    dispatch({
      type: 'UPDATE_DISPUTE',
      payload: { id, outcome, status: 'Resolved', resolutionNote: note, resolvedAt: new Date().toISOString() },
    });
  }, []);

  // Selectors
  const getTaskById = useCallback((id: string) => state.tasks.find(t => t.id === id), [state.tasks]);
  const getUserById = useCallback((id: string) => state.users.find(u => u.id === id), [state.users]);

  const getMyTasks = useCallback((): Task[] => {
    if (!state.currentUser) return [];
    if (state.currentUser.role === 'poster') {
      return state.tasks
        .filter(t => t.posterId === state.currentUser!.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (state.currentUser.role === 'lifer') {
      return state.tasks
        .filter(t => t.liferId === state.currentUser!.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return state.tasks;
  }, [state.currentUser, state.tasks]);

  const getOpenTasksForLifer = useCallback((): Task[] => {
    if (!state.currentUser || state.currentUser.role !== 'lifer') return [];
    const workTypes = state.currentUser.workTypes ?? [];
    return state.tasks
      .filter(t => t.status === 'Open' && workTypes.includes(t.categoryId))
      .sort((a, b) => (b.tip + b.basePrice) - (a.tip + a.basePrice));
  }, [state.currentUser, state.tasks]);

  const getActiveTaskForLifer = useCallback((): Task | undefined => {
    if (!state.currentUser) return undefined;
    return state.tasks.find(
      t => t.liferId === state.currentUser!.id &&
        ['Assigned', 'In Progress', 'Completed', 'Invoice Sent'].includes(t.status)
    );
  }, [state.currentUser, state.tasks]);

  const value: AppContextValue = {
    ...state,
    login,
    logout,
    updateProfile,
    createTask,
    acceptTask,
    startTask,
    completeTask,
    payTask,
    cancelTask,
    addTip,
    rateTask,
    markAllRead,
    getMyNotifications,
    getUnreadCount,
    submitVerification,
    reviewVerification,
    openDispute,
    resolveDispute,
    getTaskById,
    getUserById,
    getMyTasks,
    getOpenTasksForLifer,
    getActiveTaskForLifer,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
