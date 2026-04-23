import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';

// Interfaces
interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  banner?: string;
  welcomeMessage?: string;
  isOwner?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  type: 'text' | 'media';
  mediaUrl?: string;
}

interface Room {
  id: string;
  name: string;
  type: 'fixed' | 'adhoc';
  distance: number;
  isOpen?: boolean;
  photo?: string;
  isVerified?: boolean;
  expiresAt?: number;
  participants?: User[];
  createdBy?: string;
}

interface RecentInteraction {
  user: User;
  timestamp: number;
}

interface EphemeralState {
  user: User | null;
  location: { lat: number; lng: number } | null;
  activeRoom: Room | null;
  messages: Message[];
  contacts: User[];
  recentInteractions: RecentInteraction[];
  rooms: Room[];
  socket: Socket | null;
  
  // Actions
  initSocket: () => void;
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => void;
  setLocation: (location: { lat: number; lng: number }) => void;
  setActiveRoom: (room: Room | null) => void;
  addRoom: (room: Omit<Room, 'participants'>) => void;
  addMessage: (msg: Omit<Message, 'timestamp'>) => void;
  pruneMessages: () => void;
  setRooms: (rooms: Room[]) => void;
  addContact: (user: User) => void;
  removeContact: (userId: string) => void;
  addRecentInteraction: (user: User) => void;
  pruneRecentInteractions: () => void;
  joinRoom: (roomId: string, user: User) => void;
  leaveRoom: (roomId: string, userId: string) => void;
}

const SERVER_URL = `http://${window.location.hostname}:3001`;

export const useEphemeralStore = create<EphemeralState>()(
  persist(
    (set, get) => ({
      user: null,
      location: null,
      activeRoom: null,
      messages: [],
      contacts: [],
      recentInteractions: [],
      rooms: [],
      socket: null,

      initSocket: () => {
        if (get().socket) return;
        const socket = io(SERVER_URL);
        
        socket.on('update-rooms', (rooms) => {
          set({ rooms });
          const currentActive = get().activeRoom;
          if (currentActive) {
            const updated = rooms.find(r => r.id === currentActive.id);
            if (updated) {
              set({ activeRoom: updated });
            } else if (currentActive.type === 'adhoc') {
              // Ad-hoc room was closed/deleted, return to discovery
              set({ activeRoom: null });
            }
          }
        });
        socket.on('new-message', (msg) => set(state => ({ messages: [...state.messages, msg] })));
        socket.on('room-history', (history) => set({ messages: history }));

        set({ socket });
      },

      setUser: (user) => set({ user }),
      setLocation: (location) => set({ location }),
      
      setActiveRoom: (room) => {
        const { socket, user } = get();
        if (socket && room && user) {
          socket.emit('join-room', { roomId: room.id, user });
        }
        set({ activeRoom: room, messages: [] });
      },
      
      addMessage: (msg) => {
        const { socket, activeRoom } = get();
        if (socket && activeRoom) {
          socket.emit('send-message', { roomId: activeRoom.id, message: msg });
        }
      },

      pruneMessages: () => {
        const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
        set((state) => ({
          messages: state.messages.filter((m) => m.timestamp > tenMinutesAgo)
        }));
      },

      setRooms: (rooms) => set({ rooms }),
      
      addRoom: (room) => {
        const { socket } = get();
        if (socket) {
          socket.emit('create-room', room);
        }
      },

      updateUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
      })),
      
      addContact: (user) => set((state) => {
        if (state.contacts.find(c => c.id === user.id)) return state;
        return { contacts: [...state.contacts, user] };
      }),

      removeContact: (userId) => set((state) => ({
        contacts: state.contacts.filter(c => c.id !== userId)
      })),

      addRecentInteraction: (user) => set((state) => {
        const filtered = state.recentInteractions.filter(ri => ri.user.id !== user.id);
        return {
          recentInteractions: [{ user, timestamp: Date.now() }, ...filtered]
        };
      }),

      pruneRecentInteractions: () => {
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        set((state) => ({
          recentInteractions: state.recentInteractions.filter(ri => ri.timestamp > oneHourAgo)
        }));
      },

      joinRoom: (roomId, user) => {
        const { socket } = get();
        if (socket) socket.emit('join-room', { roomId, user });
      },

      leaveRoom: (roomId, userId) => {
        const { socket } = get();
        if (socket) socket.emit('leave-room', { roomId, userId });
      }
    }),
    {
      name: 'ephemeral-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist user profile and contacts list. 
      // Messages and recent interactions are ephemeral and handled by the server or transient state.
      partialize: (state) => ({
        user: state.user,
        contacts: state.contacts
      })
    }
  )
);

export const getUserColor = (id?: string) => {
  if (!id) return '#ccc';
  const colors = ['#8A88FB', '#FF7E67', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
  const charSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[charSum % colors.length];
};
