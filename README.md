<h1>Intitalisation projet premiere fois :</h1>

<ul>
    <li>docker --version</li>
    <li>docker compose version</li>
</ul>

<p>si pas de docker :</p>
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
working_dir: /app | volumes: - ./api:/app | ports: 5173 pour le front / 8000 pour le back
</p>

<p>configuration base de données (.env) :</p>
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

<p>creer la base :</p>
<pre>
docker compose exec api php bin/console doctrine:database:create
</pre>

<p>faire les migrations :</p>
<pre>
docker compose exec api php bin/console doctrine:migrations:migrate
</pre>

<p>travailler dans le conteneur :</p>
<pre>
docker compose exec api bash
</pre>

<hr>

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

<p>Exécuter Symfony :</p>
<pre>
docker compose exec api php bin/console
</pre>

<p>Entrer dans le conteneur :</p>
<pre>
docker compose exec api bash
</pre>

<p>start le server :</p>
<pre>
symfony server:start --no-tls --listen-ip=0.0.0.0 --d
</pre>

<p>a chaque modif des entités :</p>
<pre>
symfony console make:migration
symfony console doctrine:migrations:migrate
</pre>

<hr>

<h3>étape de la creation du projet :</h3>

<pre>
symfony console make:entity AdminJeu
symfony console make:entity Joueur
symfony console make:entity SessionJeu
</pre>

<p>
relations :
SessionJeu -> ManyToOne AdminJeu
SessionJeu -> ManyToOne Joueur (nullable au début)
</p>

<p>ajout du multi joueur ( amelioration c'etait pas present dans le mldr principale) :</p>
<pre>
symfony console make:entity SessionJoueur
</pre>

<p>
SessionJoueur permet de lier :
- une session
- un joueur
avec score, progression, etc.
</p>

<pre>
symfony console make:controller Api/SessionController
</pre>

<p>fonctions principales :</p>
<ul>
    <li>createSession</li>
    <li>joinSession</li>
    <li>state</li>
</ul>

<hr>

<h3>logique backend</h3>

<p>createSession :</p>
<ul>
    <li>verifie admin (email + password)</li>
    <li>genere un code PIN</li>
    <li>genere un code secret</li>
    <li>cree la session</li>
</ul>

<p>joinSession :</p>
<ul>
    <li>le joueur rejoint avec PIN + pseudo</li>
    <li>creation d’un SessionJoueur</li>
    <li>initialisation des SuiviProg (mini jeux)</li>
    <li>initialisation des InventaireCode (fragments)</li>
</ul>

<p>state :</p>
<ul>
    <li>retourne la session</li>
    <li>retourne tous les joueurs</li>
    <li>retourne leur progression</li>
</ul>

<hr>

<h3>dans le front</h3>

<p>dans front/src :</p>

<pre>
api.js :
- apiGet
- apiPost
</pre>

<p>composants principaux :</p>
<ul>
    <li>JoinSession</li>
    <li>GameFlow</li>
    <li>AdminDashboard</li>
</ul>

<p>le front utilise :</p>
<pre>
GET /api/sessions/{id}/state
</pre>

<hr>

<h3>CORS</h3>

<pre>
docker run --rm -it -v "$PWD/api:/app" -w /app composer:2 require nelmio/cors-bundle
</pre>

<p>modifier nelmio_cors.yaml :</p>
<pre>
allow_origin: ['http://localhost:5173']
</pre>

<pre>
docker compose restart api
</pre>

<hr>

<h3>CREATION DES MINIS JEUX</h3>

<pre>
symfony console make:entity MiniJeu
symfony console make:entity ContQuiz
symfony console make:entity ContSeq
symfony console make:entity ContTri
symfony console make:entity SuiviProg
symfony console make:entity InventaireCode
symfony console make:entity CodeJeu
</pre>

<p>types :</p>
<ul>
    <li>tri</li>
    <li>sequence</li>
    <li>quiz</li>
</ul>

<p>logique :</p>
<ul>
    <li>chaque mini jeu donne un score</li>
    <li>si réussi -> debloque un fragment</li>
    <li>les fragments forment le code final</li>
</ul>

<hr>

<h3>IMPORTANT</h3>

<h3>reset base</h3>

<pre>
docker compose down
docker compose up -d db
docker compose exec db psql -U escape -d postgres
</pre>

<pre>
DROP DATABASE IF EXISTS escape;
CREATE DATABASE escape OWNER escape;
</pre>

<p>puis :</p>

<pre>
docker compose up -d
symfony console doctrine:migrations:migrate
</pre>

<hr>

<h3>sauvegarde base dans escape_clean.sql</h3>

<pre>
docker compose exec -T db pg_dump -U escape -d escape > backups/escape_clean.sql
</pre>

<h3> RESTAURATION DE BASE A CHAQUE PULL </h3>
<p>restauration :</p>

<pre>
docker compose exec -T db psql -U escape -d escape < backups/escape_clean.sql
</pre>