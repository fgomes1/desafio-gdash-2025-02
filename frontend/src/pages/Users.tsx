import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import type { User, CreateUserDto } from '@/types/user';
import { Pencil, Trash2, UserPlus, X } from 'lucide-react';

export function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<CreateUserDto>({
        email: '',
        password: '',
        name: '',
        role: 'user',
    });
    const { toast } = useToast();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            console.log('🔍 Buscando usuários...');
            const data = await userService.findAll();
            console.log('✅ Usuários carregados:', data);
            setUsers(data);
        } catch (error: any) {
            console.error('❌ Erro ao carregar usuários:', error);
            console.error('Response:', error.response);
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);

            let errorMessage = 'Erro desconhecido';

            if (error.response?.status === 401) {
                errorMessage = 'Não autorizado. Faça login novamente.';
            } else if (error.response?.status === 403) {
                errorMessage = 'Acesso negado. Apenas administradores podem ver usuários.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast({
                title: 'Erro ao carregar usuários',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingUser(null);
        setFormData({ email: '', password: '', name: '', role: 'user' });
        setShowModal(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            password: '',
            name: user.name,
            role: user.role,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await userService.update(editingUser._id, formData);
                toast({
                    title: 'Usuário atualizado',
                    description: 'Usuário atualizado com sucesso!',
                });
            } else {
                await userService.create(formData);
                toast({
                    title: 'Usuário criado',
                    description: 'Novo usuário criado com sucesso!',
                });
            }
            setShowModal(false);
            loadUsers();
        } catch (error: any) {
            toast({
                title: 'Erro',
                description: error.response?.data?.message || 'Erro ao salvar usuário',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja deletar o usuário "${name}"?`)) {
            return;
        }

        try {
            await userService.delete(id);
            toast({
                title: 'Usuário deletado',
                description: 'Usuário removido com sucesso!',
            });
            loadUsers();
        } catch (error: any) {
            toast({
                title: 'Erro ao deletar',
                description: error.response?.data?.message || 'Erro ao deletar usuário',
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gdash-primary mx-auto mb-4"></div>
                    <p className="text-slate-400">Carregando usuários...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        👥 Gerenciamento de <span className="text-gdash-primary">Usuários</span>
                    </h1>
                    <p className="text-slate-400">Gerencie usuários do sistema</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-gdash-primary text-gdash-dark px-6 py-3 rounded-lg font-bold hover:bg-emerald-400 transition-colors shadow-lg"
                >
                    <UserPlus size={20} />
                    Novo Usuário
                </button>
            </div>

            {/* Tabela de Usuários */}
            <div className="bg-gdash-card border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-800/50">
                        <tr>
                            <th className="text-left p-4 text-slate-400 font-semibold">Nome</th>
                            <th className="text-left p-4 text-slate-400 font-semibold">Email</th>
                            <th className="text-left p-4 text-slate-400 font-semibold">Role</th>
                            <th className="text-left p-4 text-slate-400 font-semibold">Criado em</th>
                            <th className="text-right p-4 text-slate-400 font-semibold">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} className="border-t border-slate-700 hover:bg-slate-800/30 transition-colors">
                                <td className="p-4 text-white font-medium">{user.name || 'Sem nome'}</td>
                                <td className="p-4 text-slate-300">{user.email}</td>
                                <td className="p-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin'
                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            }`}
                                    >
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-400">
                                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user._id, user.name)}
                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                            title="Deletar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        Nenhum usuário encontrado
                    </div>
                )}
            </div>

            {/* Modal de Criar/Editar */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-gdash-card border border-slate-700 rounded-2xl p-8 max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">
                                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-slate-400 mb-2 text-sm">Nome</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gdash-primary"
                                    placeholder="Nome do usuário"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 mb-2 text-sm">Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gdash-primary"
                                    placeholder="email@exemplo.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 mb-2 text-sm">
                                    Senha {editingUser ? '(deixe vazio para não alterar)' : '*'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gdash-primary"
                                    placeholder="••••••"
                                    required={!editingUser}
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 mb-2 text-sm">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gdash-primary"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-gdash-primary text-gdash-dark px-6 py-3 rounded-lg font-bold hover:bg-emerald-400 transition-colors"
                                >
                                    {editingUser ? 'Salvar' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
