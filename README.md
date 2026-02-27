<h1>Intitalisation projet premiere fois :</h1>

<ul>
    <li>docker --version</li>
    <li>docker compose version</li>
</ul>

<p>si pas de composer :</p>
<pre>
sudo apt update
sudo apt install -y docker.io docker-compose-plugin 
sudo usermod -aG docker $USER
newgrp docker
</pre>

<p>creation du projet :</p>
<pre>
mkdir escape-game && cd escape-game
mkdir api front
</pre>

<p>creation du docker-compose et du dockerfile:</p>
<p>
working_dir: /app | volumes: - ./api:/app | sur le port 5173
</p>

<p>Nous avons configuré l'utilisation de l'image Docker de PostgreSQL, nous avons ajouté cette ligne dans le fichier .env pour définir la connexion à la base de données :</p>
<pre>
DATABASE_URL="postgresql://escape:escape@db:5432/escape?serverVersion=16&charset=utf8"
</pre>

<p>creer Symfony (dans le container)</p>
<pre>
docker run --rm -it -v "$PWD/api:/app" -w /app composer:2 \
create-project symfony/skeleton .
</pre>

<p>creer React :</p>
<pre>
cd front
npm create vite@latest . -- --template react
npm install
cd ..
</pre>

<p>start docker:</p>
<pre>
docker compose up -d
</pre>

<p>relancer db :</p>
<pre>
docker compose exec api php bin/console doctrine:database:create
</pre>

<p>travailler dans le conteneur :</p>
<pre>
docker compose exec api bash
</pre>

<h1>Commandes utiles au quotidien</h1>

<p>Lancer / arrêter :</p>
<pre>
docker compose up -d
docker compose down
</pre>

<p>Voir ce qui tourne :</p>
<pre>
docker compose ps
docker compose logs -f api
</pre>

<p>Exécuter Symfony (sans entrer dans le conteneur) :</p>
<pre>
docker compose exec api php bin/console
</pre>

<p>Entrer dans le conteneur :</p>
<pre>
docker compose exec api bash 
puis :
php bin/console
ou symfony console 
</pre>

<p>start le server :</p>
<pre>
symfony server:start --no-tls --listen-ip=0.0.0.0 --d
</pre>

