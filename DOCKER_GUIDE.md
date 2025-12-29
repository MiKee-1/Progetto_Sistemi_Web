# Guida Docker per Progetto Sistemi Web

## Problema Risolto

Il progetto è stato configurato per eseguire **tutto dentro Docker** con i permessi corretti. Questo elimina i problemi di "readonly database" e garantisce che tutti i file creati dal container abbiano i permessi giusti (UID 1000:1000 = mike:mike).

## Come Funziona

### Configurazione
- **Dockerfile.dev**: Il container esegue come user `rails` con UID/GID 1000 (stesso del tuo utente host)
- **docker-compose.yml**: Configura il mapping UID/GID per garantire permessi corretti
- **Volumi**: `./Backend:/rails` monta il codice, permettendo live-reload durante lo sviluppo

### Permessi
Tutti i file creati dal container (database, log, etc.) saranno automaticamente owned da `mike:mike`, permettendoti di modificarli anche dall'host se necessario.

## Comandi Fondamentali

### Gestione Container

```bash
# Avviare i servizi
docker compose up -d

# Vedere i log in tempo reale
docker compose logs -f

# Fermare i servizi
docker compose down

# Ricostruire i container (dopo modifiche a Dockerfile/Gemfile)
docker compose build backend
docker compose up -d
```

### Comandi Rails (SEMPRE dentro Docker)

**IMPORTANTE**: NON eseguire mai comandi Rails direttamente sull'host (tipo `rails db:migrate`). Usa sempre gli script helper o docker compose exec.

#### Metodo 1: Script Helper (Raccomandato)

```bash
# Migrazioni
./bin/docker-rails db:migrate
./bin/docker-rails db:rollback
./bin/docker-rails db:seed
./bin/docker-rails db:reset

# Console Rails
./bin/docker-rails console

# Generatori
./bin/docker-rails generate model Product name:string
./bin/docker-rails generate controller Products

# Test
./bin/docker-rails test
```

#### Metodo 2: Script Generico

```bash
# Eseguire qualsiasi comando nel container
./bin/docker-exec bash                 # Shell interattiva
./bin/docker-exec bundle install       # Installare gems
./bin/docker-exec rake routes          # Vedere le routes
./bin/docker-exec rails runner "puts User.count"
```

#### Metodo 3: Docker Compose Exec (Manuale)

```bash
# Forma completa (se preferisci)
docker compose exec backend rails db:migrate
docker compose exec backend bash
```

## Workflow di Sviluppo Tipico

### 1. Avvio Giornaliero
```bash
cd /home/mike/Desktop/Progetto_Sistemi_Web
docker compose up -d
# Backend disponibile su http://localhost:3000
# Frontend disponibile su http://localhost:4200
```

### 2. Durante lo Sviluppo
```bash
# Vedere i log in tempo reale
docker compose logs -f backend

# Aprire una console Rails per testing
./bin/docker-rails console

# Eseguire migrazioni quando cambia il DB
./bin/docker-rails db:migrate
```

### 3. Quando Aggiungi Gem
```bash
# 1. Modifica Gemfile localmente
# 2. Installa le gems nel container
./bin/docker-exec bundle install
# 3. Riavvia il container per applicare le modifiche
docker compose restart backend
```

### 4. Fine Giornata
```bash
docker compose down
```

## Risoluzione Problemi

### Container non si avvia
```bash
# Vedere i log dettagliati
docker compose logs backend

# Ricostruire da zero
docker compose down
docker compose build --no-cache backend
docker compose up -d
```

### Problemi con le Gem
```bash
# Reinstallare tutte le gems
./bin/docker-exec bundle install
docker compose restart backend
```

### Database corrotto o problemi di permessi
```bash
# Fermare i container
docker compose down

# Rimuovere il database e ricrearlo
rm Backend/storage/development.sqlite3*
docker compose up -d
./bin/docker-rails db:migrate
./bin/docker-rails db:seed
```

### File con permessi sbagliati
Se trovi file owned da root:
```bash
# Fermare i container
docker compose down

# Rimuovere il file problematico
rm path/to/problematic/file

# Riavviare e lasciare che il container lo ricrei
docker compose up -d
```

## Best Practices

1. **Mai eseguire Rails sull'host**: Usa sempre Docker per i comandi Rails
2. **Commit regolari**: Non committare file come `log/*.log` o `storage/*.sqlite3`
3. **Environment**: Assicurati che `RAILS_ENV=development` nel docker-compose.yml
4. **Rebuild quando necessario**: Dopo modifiche a Dockerfile o Gemfile, ricostruisci l'immagine

## Vantaggi di Questo Approccio

- **Ambiente consistente**: Tutti i developer hanno la stessa versione di Ruby, Rails, gems
- **Zero setup locale**: Non serve installare Ruby/Rails sull'host
- **Permessi corretti**: Nessun problema di "readonly database"
- **Isolamento**: Il progetto non interferisce con altri progetti Ruby
- **Portabilità**: Funziona identicamente su Linux, macOS, Windows (con WSL2)

## File Modificati

Per riferimento, ecco i file che sono stati modificati per risolvere il problema:

1. **Backend/Dockerfile.dev**: Aggiunto user non-root con UID/GID matching
2. **docker-compose.yml**: Aggiunto mapping UID/GID nei build args
3. **bin/docker-rails**: Script helper per comandi Rails
4. **bin/docker-exec**: Script helper generico per comandi nel container

## Prossimi Passi

Se lavori in team, assicurati che tutti usino lo stesso approccio:
1. Condividere questa guida con il team
2. Aggiungere al `.gitignore`: `storage/*.sqlite3*`, `log/*.log`
3. Documentare nel README principale che il progetto usa Docker
