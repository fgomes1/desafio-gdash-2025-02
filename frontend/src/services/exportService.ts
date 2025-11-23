import { api } from './api';

export const exportService = {
    async exportToCSV() {
        const response = await api.get('/weather/export/csv', {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `weather_data_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    async exportToXLSX() {
        const response = await api.get('/weather/export/xlsx', {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `weather_data_${new Date().toISOString()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};
