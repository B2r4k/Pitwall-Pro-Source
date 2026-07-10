#!/bin/bash

# Renkli çıktılar için
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Pitwall Pro - Firebase Deploy Script ===${NC}"

# 1. Derleme
echo -e "${BLUE}[1/2]${NC} Derleme (Build) işlemi başlatılıyor..."
if npm run build; then
    echo -e "${GREEN}✓ Build başarılı!${NC}"
else
    echo -e "${RED}✗ Build başarısız oldu. Lütfen hataları kontrol edin.${NC}"
    exit 1
fi

# 2. Firebase deploy
echo -e "${BLUE}[2/2]${NC} Firebase Hosting'e yükleniyor..."
if npx firebase-tools deploy --only hosting; then
    echo -e "${GREEN}✓ Deploy başarılı!${NC}"
else
    echo -e "${RED}✗ Deploy başarısız oldu. Firebase'e giriş yapmış olduğunuzdan emin olun (npx firebase-tools login).${NC}"
    exit 1
fi

echo -e "${GREEN}=== Tüm işlemler tamamlandı! ===${NC}"
