import time
import json
import requests
import pika
import os
from dotenv import load_dotenv

load_dotenv()

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
QUEUE_NAME = 'weather_data'
# Medianeira, PR
CITY_LAT = '-25.2974' 
CITY_LON = '-54.0950'

def get_weather():
    try:
        # ADICIONEI: wind_speed_10m e weather_code (condição do céu)
        url = f"https://api.open-meteo.com/v1/forecast?latitude={CITY_LAT}&longitude={CITY_LON}&current=temperature_2m,relative_humidity_2m,precipitation,is_day,wind_speed_10m,weather_code&timezone=America%2FSao_Paulo"
        
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Erro ao buscar clima: {e}")
        return None

def send_to_queue(data):
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
        channel = connection.channel()
        channel.queue_declare(queue=QUEUE_NAME, durable=True)

        message = json.dumps(data)
        
        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_NAME,
            body=message,
            properties=pika.BasicProperties(delivery_mode=2))
        
        # Log mais detalhado para você ver os campos novos
        curr = data['current']
        print(f"✅ [x] Enviado: {curr['temperature_2m']}°C | Vento: {curr['wind_speed_10m']}km/h | Code: {curr['weather_code']}")
        
        connection.close()
    except Exception as e:
        print(f"❌ Erro no RabbitMQ: {e}")

if __name__ == '__main__':
    print("🚀 Iniciando Coletor de Clima (Versão Completa)...")
    while True:
        weather_data = get_weather()
        if weather_data:
            send_to_queue(weather_data)
        
        time.sleep(10)