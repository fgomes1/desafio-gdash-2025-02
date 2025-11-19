package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// 1. O que recebemos da Fila (Do Python)
type WeatherFromQueue struct {
	Current struct {
		Temperature2m      float64 `json:"temperature_2m"`
		RelativeHumidity2m int     `json:"relative_humidity_2m"`
		Precipitation      float64 `json:"precipitation"`
	} `json:"current"`
}

// 2. O que enviamos para a API (Para o NestJS)
// Tem que bater com o DTO do NestJS
type WeatherPayload struct {
	Temperature   float64 `json:"temperature"`
	Humidity      int     `json:"humidity"`
	Precipitation float64 `json:"precipitation"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

// Função que manda o POST para o NestJS
func sendToAPI(data WeatherFromQueue) {
	apiURL := os.Getenv("API_URL")
	if apiURL == "" {
		apiURL = "http://localhost:3000/weather" // Endereço da sua API
	}

	// Transforma o dado da Fila no formato da API
	payload := WeatherPayload{
		Temperature:   data.Current.Temperature2m,
		Humidity:      data.Current.RelativeHumidity2m,
		Precipitation: data.Current.Precipitation,
	}

	jsonData, _ := json.Marshal(payload)

	// Tenta enviar com timeout de 5 segundos
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Post(apiURL, "application/json", bytes.NewBuffer(jsonData))

	if err != nil {
		log.Printf("❌ Erro ao chamar API: %s", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 201 {
		log.Printf("✅ [API] Salvo com sucesso! Temp: %.1f°C", payload.Temperature)
	} else {
		log.Printf("⚠️ [API] Erro: Status %d", resp.StatusCode)
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
			var data WeatherFromQueue
			err := json.Unmarshal(d.Body, &data)
			
			if err != nil {
				log.Printf("⚠️ JSON inválido: %s", err)
				continue
			}

			log.Printf("📥 [Fila] Recebido da fila. Processando...")
			
			// 🔥 AQUI ACONTECE O ENVIO
			sendToAPI(data)
		}
	}()

	log.Printf("🐹 Worker conectado na API! Aguardando dados...")
	<-forever
}