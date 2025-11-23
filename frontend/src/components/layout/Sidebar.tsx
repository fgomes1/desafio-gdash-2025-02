import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Compass, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Usuários', path: '/dashboard/users' },
    { icon: Compass, label: 'Explorar', path: '/dashboard/pokemon' },
];

export function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="h-screen w-64 bg-gdash-card border-r border-slate-800 flex flex-col text-white">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-2xl font-bold tracking-tight">
                    <span className="text-gdash-primary">GDASH</span>
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link key={item.path} to={item.path}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-slate-800",
                                    isActive && "bg-slate-800 text-gdash-primary hover:bg-slate-800 hover:text-gdash-primary"
                                )}
                            >
                                <Icon size={20} />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                    <LogOut size={20} />
                    Sair
                </Button>
            </div>
        </div>
    );
}
