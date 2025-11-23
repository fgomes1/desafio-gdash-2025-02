import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        console.log('Tentando fazer login...', { email });

        try {
            const data = await authService.login({ email, password });
            console.log('Login bem sucedido:', data);
            login(data.access_token, data.user);
            console.log('Estado de login atualizado, navegando para /dashboard');
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Erro no login:', error);
            alert('Erro no login: ' + (error.response?.data?.message || error.message));
            toast({
                variant: "destructive",
                title: "Erro no login",
                description: error.response?.status === 401
                    ? "Credenciais inválidas"
                    : "Ocorreu um erro ao tentar entrar: " + error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gdash-dark p-4">
            <Card className="w-full max-w-md border-slate-800 bg-gdash-card text-white">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        <span className="text-gdash-primary">GDASH</span> Login
                    </CardTitle>
                    <CardDescription className="text-center text-slate-400">
                        Entre com suas credenciais para acessar o painel
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-slate-900 border-slate-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-slate-900 border-slate-700 text-white"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full bg-gdash-primary text-gdash-dark hover:bg-emerald-400 font-bold"
                            disabled={loading}
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Button>
                        <p className="text-sm text-center text-slate-400">
                            Não tem uma conta?{' '}
                            <Link to="/register" className="text-gdash-primary hover:underline">
                                Registre-se
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
