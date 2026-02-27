#!/usr/bin/env bash
# ============================================================
# LoreOS — Script de lancement (dev)
# Usage : ./start.sh          → lance les deux services
#         ./start.sh --build  → rebuild les images puis lance
#         ./start.sh --stop   → arrête tout
#         ./start.sh --logs   → affiche les logs en live
# ============================================================

set -e

cd "$(dirname "$0")"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

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

case "${1:-}" in
    --stop)
        echo -e "${CYAN}⏹  Arrêt des services...${NC}"
        docker compose down
        echo -e "${GREEN}✓ Services arrêtés.${NC}"
        ;;
    --logs)
        docker compose logs -f --tail=50
        ;;
    --build)
        banner
        check_env
        echo -e "${CYAN}🔨 Rebuild des images...${NC}"
        docker compose up --build -d
        echo ""
        echo -e "${GREEN}✓ Backend  → http://localhost:8000${NC}"
        echo -e "${GREEN}✓ Frontend → http://localhost:3000${NC}"
        echo -e "${GREEN}✓ Swagger  → http://localhost:8000/docs${NC}"
        echo ""
        echo -e "Logs : ${BOLD}./start.sh --logs${NC}"
        echo -e "Stop : ${BOLD}./start.sh --stop${NC}"
        ;;
    "")
        banner
        check_env
        echo -e "${CYAN}🚀 Lancement des services...${NC}"
        docker compose up -d
        echo ""
        echo -e "${GREEN}✓ Backend  → http://localhost:8000${NC}"
        echo -e "${GREEN}✓ Frontend → http://localhost:3000${NC}"
        echo -e "${GREEN}✓ Swagger  → http://localhost:8000/docs${NC}"
        echo ""
        echo -e "Logs : ${BOLD}./start.sh --logs${NC}"
        echo -e "Stop : ${BOLD}./start.sh --stop${NC}"
        ;;
    *)
        echo "Usage : ./start.sh [--build|--stop|--logs]"
        exit 1
        ;;
esac
