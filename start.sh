#!/usr/bin/env bash
# ============================================================
# LoreOS — Script de lancement (dev, natif)
# Usage : ./start.sh          → lance backend + frontend
#         ./start.sh --stop   → arrête les deux
#         ./start.sh --logs   → tail les logs en live
#         ./start.sh --install → installe les dépendances
# ============================================================

set -e

cd "$(dirname "$0")"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

LOG_DIR=".logs"
BACK_PID_FILE="$LOG_DIR/backend.pid"
FRONT_PID_FILE="$LOG_DIR/frontend.pid"

mkdir -p "$LOG_DIR"

banner() {
    echo -e "${CYAN}${BOLD}"
    echo "  ╔═══════════════════════════════════╗"
    echo "  ║          🌌  LoreOS  🌌           ║"
    echo "  ║   Le cerveau de ton univers       ║"
    echo "  ╚═══════════════════════════════════╝"
    echo -e "${NC}"
}

check_env() {
    local missing=0
    if [ ! -f backend/.env ]; then
        echo -e "${RED}✗ backend/.env manquant — copie backend/.env.example${NC}"
        missing=1
    fi
    if [ ! -f frontend/.env.local ]; then
        echo -e "${RED}✗ frontend/.env.local manquant — copie frontend/.env.example${NC}"
        missing=1
    fi
    if [ $missing -eq 1 ]; then
        exit 1
    fi
}

stop_services() {
    echo -e "${CYAN}⏹  Arrêt des services...${NC}"
    for pidfile in "$BACK_PID_FILE" "$FRONT_PID_FILE"; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
                # Attendre un peu puis forcer si nécessaire
                sleep 1
                kill -0 "$pid" 2>/dev/null && kill -9 "$pid" 2>/dev/null || true
            fi
            rm -f "$pidfile"
        fi
    done
    # Nettoyage au cas où des processus orphelins traînent
    pkill -f "uvicorn main:app" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    echo -e "${GREEN}✓ Services arrêtés.${NC}"
}

install_deps() {
    echo -e "${CYAN}📦 Installation des dépendances backend...${NC}"
    if [ ! -d backend/venv ]; then
        python3 -m venv backend/venv
    fi
    backend/venv/bin/pip install -q -r backend/requirements.txt
    echo -e "${GREEN}✓ Backend prêt${NC}"

    echo -e "${CYAN}📦 Installation des dépendances frontend...${NC}"
    cd frontend && npm install --legacy-peer-deps --silent && cd ..
    echo -e "${GREEN}✓ Frontend prêt${NC}"
}

start_services() {
    banner
    check_env

    # Vérifier que le venv existe
    if [ ! -d backend/venv ]; then
        echo -e "${CYAN}Première exécution — installation des dépendances...${NC}"
        install_deps
    fi

    # Arrêter les éventuels processus précédents
    stop_services 2>/dev/null || true

    echo -e "${CYAN}🚀 Lancement des services...${NC}"

    # Backend (uvicorn avec hot reload)
    cd backend
    ../backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload \
        > "../$LOG_DIR/backend.log" 2>&1 &
    echo $! > "../$BACK_PID_FILE"
    cd ..

    # Frontend (next dev)
    cd frontend
    npx next dev --port 3000 \
        > "../$LOG_DIR/frontend.log" 2>&1 &
    echo $! > "../$FRONT_PID_FILE"
    cd ..

    # Attendre que le backend soit prêt
    echo -ne "  Backend "
    for i in $(seq 1 30); do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done

    # Attendre que le frontend soit prêt
    echo -ne "  Frontend "
    for i in $(seq 1 30); do
        if curl -s -o /dev/null http://localhost:3000 2>/dev/null; then
            echo -e "${GREEN}✓${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done

    echo ""
    echo -e "${GREEN}✓ Backend  → http://localhost:8000${NC}"
    echo -e "${GREEN}✓ Frontend → http://localhost:3000${NC}"
    echo -e "${GREEN}✓ Swagger  → http://localhost:8000/docs${NC}"
    echo ""
    echo -e "Logs : ${BOLD}./start.sh --logs${NC}"
    echo -e "Stop : ${BOLD}./start.sh --stop${NC}"
}

case "${1:-}" in
    --stop)
        stop_services
        ;;
    --logs)
        tail -f "$LOG_DIR"/backend.log "$LOG_DIR"/frontend.log
        ;;
    --install)
        install_deps
        ;;
    "")
        start_services
        ;;
    *)
        echo "Usage : ./start.sh [--stop|--logs|--install]"
        exit 1
        ;;
esac
