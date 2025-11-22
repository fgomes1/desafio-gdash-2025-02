import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExportService {
    async generateCSV(data: any[]): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Dados Climáticos');

        // Define colunas
        worksheet.columns = [
            { header: 'ID', key: '_id', width: 30 },
            { header: 'Localização', key: 'location', width: 20 },
            { header: 'Temperatura (°C)', key: 'temperature', width: 18 },
            { header: 'Umidade (%)', key: 'humidity', width: 15 },
            { header: 'Velocidade do Vento (km/h)', key: 'windSpeed', width: 25 },
            { header: 'Precipitação (mm)', key: 'precipitation', width: 20 },
            { header: 'Código do Clima', key: 'weatherCode', width: 18 },
            { header: 'Data de Coleta', key: 'collectedAt', width: 25 },
            { header: 'Criado em', key: 'createdAt', width: 25 },
        ];

        // Adiciona dados
        data.forEach(item => {
            worksheet.addRow({
                _id: item._id?.toString() || '',
                location: item.location || '',
                temperature: item.temperature || 0,
                humidity: item.humidity || 0,
                windSpeed: item.windSpeed || 0,
                precipitation: item.precipitation || 0,
                weatherCode: item.weatherCode || 0,
                collectedAt: item.collectedAt ? new Date(item.collectedAt).toLocaleString('pt-BR') : '',
                createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : '',
            });
        });

        // Gera CSV
        const buffer = await workbook.csv.writeBuffer();
        return Buffer.from(buffer);
    }

    async generateXLSX(data: any[]): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Dados Climáticos');

        // Define colunas com estilo
        worksheet.columns = [
            { header: 'ID', key: '_id', width: 30 },
            { header: 'Localização', key: 'location', width: 20 },
            { header: 'Temperatura (°C)', key: 'temperature', width: 18 },
            { header: 'Umidade (%)', key: 'humidity', width: 15 },
            { header: 'Velocidade do Vento (km/h)', key: 'windSpeed', width: 25 },
            { header: 'Precipitação (mm)', key: 'precipitation', width: 20 },
            { header: 'Código do Clima', key: 'weatherCode', width: 18 },
            { header: 'Data de Coleta', key: 'collectedAt', width: 25 },
            { header: 'Criado em', key: 'createdAt', width: 25 },
        ];

        // Estiliza cabeçalho
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        // Adiciona dados
        data.forEach(item => {
            worksheet.addRow({
                _id: item._id?.toString() || '',
                location: item.location || '',
                temperature: item.temperature || 0,
                humidity: item.humidity || 0,
                windSpeed: item.windSpeed || 0,
                precipitation: item.precipitation || 0,
                weatherCode: item.weatherCode || 0,
                collectedAt: item.collectedAt ? new Date(item.collectedAt).toLocaleString('pt-BR') : '',
                createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : '',
            });
        });

        // Adiciona bordas
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });

        // Gera XLSX
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
