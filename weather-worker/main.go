package main

import (
	"encoding/json"
	"log"
	"os"

	amqp "github.com/rabbitmq/amqp091-go"
)

// 1. Definição do "Molde" (Struct)
// O Go vai procurar no JSON campos que batam com essas tags `json:"..."`
// Tudo que estiver no JSON mas não estiver aqui, será ignorado.
type WeatherResponse struct {
	Current struct {
		Temperature2m      float64 `json:"temperature_2m"`
		RelativeHumidity2m int     `json:"relative_humidity_2m"`
		Precipitation      float64 `json:"precipitation"`
		IsDay              int     `json:"is_day"`
	} `json:"current"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func main() {
	rabbitMQURL := os.Getenv("RABBITMQ_URL")
	if rabbitMQURL == "" {
		rabbitMQURL = "amqp://guest:guest@localhost:5672/"
	}

	conn, err := amqp.Dial(rabbitMQURL)
	failOnError(err, "❌ Falha ao conectar no RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "❌ Falha ao abrir um canal")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"weather_data", 
		true,           
		false,          
		false,          
		false,          
		nil,            
	)
	failOnError(err, "❌ Falha ao declarar a fila")

	msgs, err := ch.Consume(
		q.Name, 
		"",     
		true,   
		false,  
		false,  
		false,  
		nil,    
	)
	failOnError(err, "❌ Falha ao registrar consumidor")

	var forever chan struct{}

	go func() {
		for d := range msgs {
			// 2. A Mágica da Limpeza (Unmarshal)
			var data WeatherResponse
			err := json.Unmarshal(d.Body, &data) // Converte bytes -> Struct
			
			if err != nil {
				log.Printf("⚠️ Erro ao ler JSON: %s", err)
				continue
			}

			// Agora temos dados limpos e tipados!
			log.Printf("✅ [Processado] Temp: %.1f°C | Umidade: %d%% | Chuva: %.1fmm", 
				data.Current.Temperature2m, 
				data.Current.RelativeHumidity2m,
				data.Current.Precipitation,
			)

			// TODO: POST para o NestJS vai aqui
		}
	}()

	log.Printf("🐹 Worker rodando e filtrando dados! Aguardando...")
	<-forever
}