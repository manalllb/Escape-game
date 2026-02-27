<h1> Intitalisation projet premiere fois : </h1>
docker --version
docker compose version

si pas de composer : sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker

creation du projet :
mkdir escape-game && cd escape-game
mkdir api front

creation du docker-compose et du dockerfile:
    working_dir: /app | volumes: - ./api:/app | sur le port 5173
Nous avons configuré l'utilisation de l'image Docker de PostgreSQL, nous avons ajouté cette ligne dans le fichier .env pour définir la connexion à la base de données :
DATABASE_URL="postgresql://escape:escape@db:5432/escape?serverVersion=16&charset=utf8"



creer Symfony (dans le container)
docker run --rm -it -v "$PWD/api:/app" -w /app composer:2 \
create-project symfony/skeleton .

creer React :
cd front
npm create vite@latest . -- --template react
npm install
cd ..

start docker:
docker compose up -d

relancer db :
docker compose exec api php bin/console doctrine:database:create

travailler dans le conteneur :
docker compose exec api bash


<h1>Commandes utiles au quotidien </h1>

Lancer / arrêter :
docker compose up -d
docker compose down

Voir ce qui tourne :
docker compose ps
docker compose logs -f api

Exécuter Symfony (sans entrer dans le conteneur) :
docker compose exec api php bin/console

Entrer dans le conteneur :
docker compose exec api bash 
puis :
php bin/console
ou symfony console 

start le server :
symfony server:start --no-tls --listen-ip=0.0.0.0 --d



