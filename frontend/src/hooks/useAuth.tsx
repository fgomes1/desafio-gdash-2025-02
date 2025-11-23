import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface User {
    _id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        // Check local storage on mount
        const storedToken = localStorage.getItem('gdash_token');
        const storedUser = localStorage.getItem('gdash_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('gdash_token', newToken);
        localStorage.setItem('gdash_user', JSON.stringify(newUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        toast({
            title: "Bem-vindo!",
            description: `Login realizado com sucesso. Olá, ${newUser.name}!`,
        });
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('gdash_token');
        localStorage.removeItem('gdash_user');
        delete api.defaults.headers.common['Authorization'];

        toast({
            title: "Logout",
            description: "Você saiu do sistema.",
        });
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            isAuthenticated: !!token,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
