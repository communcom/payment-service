# Payment service

#### Clone the repository

```bash
git clone https://github.com/communcom/payment-service.git
cd payment-service
```

#### Create .env file

```bash
cp .env.example .env
```

Add variables

```bash
CYBERWAY_HTTP_URL=http://cyberway
GLS_API_KEY=secret
GLS_PROVIDER_KEY=
GLS_SENDER=
GLS_SENDER_KEY=
```

#### Create docker-compose file

```bash
cp docker-compose.example.yml docker-compose.yml
```

#### Run

```bash
docker-compose up -d --build
```
