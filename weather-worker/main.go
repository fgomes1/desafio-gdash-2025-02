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

// Structs (iguais ao anterior)
type WeatherFromQueue struct {
	Current struct {
		Temperature2m      float64 `json:"temperature_2m"`
		RelativeHumidity2m int     `json:"relative_humidity_2m"`
		Precipitation      float64 `json:"precipitation"`
		WindSpeed10m       float64 `json:"wind_speed_10m"`
		WeatherCode        int     `json:"weather_code"`
	} `json:"current"`
}

type WeatherPayload struct {
	Temperature   float64 `json:"temperature"`
	Humidity      int     `json:"humidity"`
	Precipitation float64 `json:"precipitation"`
	WindSpeed     float64 `json:"windSpeed"`
	WeatherCode   int     `json:"weatherCode"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

// 🔥 NOVO: Função de envio com RETRY BÁSICO
// Retorna erro se falhar todas as tentativas
func sendToAPIWithRetry(data WeatherFromQueue) error {
	apiURL := os.Getenv("API_URL")
	if apiURL == "" {
		apiURL = "http://localhost:3000/weather"
	}

	payload := WeatherPayload{
		Temperature:   data.Current.Temperature2m,
		Humidity:      data.Current.RelativeHumidity2m,
		Precipitation: data.Current.Precipitation,
		WindSpeed:     data.Current.WindSpeed10m,
		WeatherCode:   data.Current.WeatherCode,
	}

	jsonData, _ := json.Marshal(payload)
	client := &http.Client{Timeout: 10 * time.Second}

	// Tenta até 3 vezes (Retry)
	maxRetries := 3
	for i := 0; i < maxRetries; i++ {
		resp, err := client.Post(apiURL, "application/json", bytes.NewBuffer(jsonData))

		if err == nil && resp.StatusCode == 201 {
			log.Printf("✅ [API] Sucesso! Temp: %.1f", payload.Temperature)
			resp.Body.Close()
			return nil // Sucesso!
		}

		// Se deu erro, loga e espera um pouco (Backoff)
		log.Printf("⚠️ [Tentativa %d/%d] Falha ao enviar para API. Retentando em 2s...", i+1, maxRetries)
		time.Sleep(2 * time.Second)
	}

	return os.ErrNotExist // Retorna erro genérico indicando falha total
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

	q, err := ch.QueueDeclare("weather_data", true, false, false, false, nil)
	failOnError(err, "❌ Falha ao declarar a fila")

	// 🔥 MUDANÇA 1: auto-ack agora é FALSE
	msgs, err := ch.Consume(
		q.Name,
		"",
		false, // <--- auto-ack = FALSE (Importante!)
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
				log.Printf("❌ Erro: JSON inválido. Descartando mensagem.")
				d.Nack(false, false) // Nack sem requeue (lixo)
				continue
			}

			// Tenta enviar com Retry
			err = sendToAPIWithRetry(data)

			if err == nil {
				// 🔥 MUDANÇA 2: Ack Manual (Sucesso)
				d.Ack(false)
			} else {
				// 🔥 MUDANÇA 3: Nack com Requeue (Falha total)
				// Devolve a mensagem para a fila para tentar depois
				log.Printf("❌ Falha total na API. Devolvendo para fila (Nack).")
				d.Nack(false, true)
			}
		}
	}()

	log.Printf("🐹 Worker (Resiliente) rodando! Aguardando...")
	<-forever
}
