import time
import json
import requests
import pika
import os
from dotenv import load_dotenv

# Carrega variáveis do .env (se houver), mas vamos usar padrões para facilitar
load_dotenv()

# Configurações (Lembre-se: rodando local, o host é 'localhost')
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
QUEUE_NAME = 'weather_data'
CITY_LAT = '-25.2974' # Medianeira, PR (Sua localização aproximada)
CITY_LON = '-54.0950'

def get_weather():
    """Busca dados na API Open-Meteo (Não precisa de chave API)"""
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={CITY_LAT}&longitude={CITY_LON}&current=temperature_2m,relative_humidity_2m,is_day,precipitation&timezone=America%2FSao_Paulo"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Erro ao buscar clima: {e}")
        return None

def send_to_queue(data):
    """Envia o JSON para o RabbitMQ"""
    try:
        # 1. Conecta no RabbitMQ
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
        channel = connection.channel()

        # 2. Garante que a fila existe (Idempotência)
        channel.queue_declare(queue=QUEUE_NAME, durable=True)

        # 3. Publica a mensagem
        message = json.dumps(data)
        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_NAME,
            body=message,
            properties=pika.BasicProperties(
                delivery_mode=2,  # Torna a mensagem persistente
            ))
        
        print(f"✅ [x] Enviado para fila: Temperatura {data['current']['temperature_2m']}°C")
        connection.close()
    except Exception as e:
        print(f"❌ Erro no RabbitMQ: {e}")

if __name__ == '__main__':
    print("🚀 Iniciando Coletor de Clima...")
    
    # Loop infinito (roda a cada 10 segundos para testar, depois aumentamos)
    while True:
        weather_data = get_weather()
        if weather_data:
            send_to_queue(weather_data)
        
        # Espera 10 segundos antes da próxima coleta
        time.sleep(10)