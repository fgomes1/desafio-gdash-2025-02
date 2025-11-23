import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(dateString: string): string {
    if (!dateString) return '';
    return format(new Date(dateString), "dd 'de' MMMM 'às' HH:mm", {
        locale: ptBR,
    });
}
