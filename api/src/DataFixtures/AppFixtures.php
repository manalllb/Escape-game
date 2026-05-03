<?php

namespace App\DataFixtures;

use App\Entity\AdminJeu;
use App\Entity\ContQuiz;
use App\Entity\ContSeq;
use App\Entity\ContTri;
use App\Entity\MiniJeu;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // AdminJeu
        $admins = [
            ['manal@gmail.com', 'admin'],
            ['admin@gmail.com', 'admin'],
            ['massylias@gmail.com', 'admin'],
            ['ryma@gmail.com', 'admin']
        ];

        foreach ($admins as $data) {
            $admin = new AdminJeu();
            $admin->setEmail($data[0]);
            $admin->setPassword(password_hash($data[1], PASSWORD_BCRYPT));
            $manager->persist($admin);
        }

        // MiniJeu
        $miniJeuTri = new MiniJeu();
        $miniJeuTri->setNom('Le Tri Express')
            ->setType('tri')
            ->setOrdre(1)
            ->setDureeMax(900)
            ->setActif(true);
        $manager->persist($miniJeuTri);

        $miniJeuSeq = new MiniJeu();
        $miniJeuSeq->setNom('Mission Peau Parfaite')
            ->setType('sequence')
            ->setOrdre(2)
            ->setDureeMax(900)
            ->setActif(true);
        $manager->persist($miniJeuSeq);

        $miniJeuQuiz = new MiniJeu();
        $miniJeuQuiz->setNom('L\'Énigme Écologique')
            ->setType('quiz')
            ->setOrdre(3)
            ->setDureeMax(900)
            ->setActif(true);
        $manager->persist($miniJeuQuiz);

        // ContTri
        $tris = [
            ['Dentifrice', false],
            ['Complément alimentaire', false],
            ['Shampoing purifiant', true],
            ['Rouge à lèvres mat', true],
            ['Eau de toilette', true],
            ['Crème solaire SPF 50', true],
            ['Masque hydratant', true],
            ['Solution lavage oculaire', false],
            ['Gélules de bronzage', false],
            ['Spray nasal salin', false],
        ];

        foreach ($tris as $data) {
            $contTri = new ContTri();
            $contTri->setNomProduit($data[0])
                ->setEstCosmetique($data[1])
                ->setMiniJeu($miniJeuTri);
            $manager->persist($contTri);
        }

        // ContSeq
        $seqs = [
            ['Nettoyage de la peau', 1, 'Visage'],
            ['Gommage exfoliant', 2, 'Visage'],
            ['Sérum anti-cernes', 3, 'Yeux'],
            ['Crème hydratante', 4, 'Visage'],
            ['Baume protecteur', 5, 'Lèvres'],
        ];

        foreach ($seqs as $data) {
            $contSeq = new ContSeq();
            $contSeq->setLibelle($data[0])
                ->setOrdreAttendu($data[1])
                ->setZoneApp($data[2])
                ->setMiniJeu($miniJeuSeq);
            $manager->persist($contSeq);
        }

        // ContQuiz
        $quizzes = [
            [
                'Où jeter un flacon en verre de labo non rincé ?',
                'Conteneur déchets spécifiques',
                ["Poubelle ménagère","Bac de tri verre classique","Évier du laboratoire"]
            ],
            [
                'Quel est l\'impact majeur mesuré par l\'ACV ?',
                'Effet de serre',
                ["Consommation d'eau","Bruit industriel","Nombre de ventes"]
            ],
            [
                'Quelle est la première étape du cycle de vie d\'un produit cosmétique ?',
                'Matières Premières',
                ["Packaging","Distribution","Utilisation client"]
            ],
            [
                'Que signifie l\'acronyme ACV dans une démarche d\'éco-conception ?',
                'Analyse du Cycle de Vie',
                ["Action Chimique Valide","Apport de Carbone Vert","Achat de Cosmétique Végan"]
            ],
            [
                'Dans quelle poubelle doit-on jeter l\'emballage en carton propre d\'une matière première ?',
                'Bac de tri Papier/Carton',
                ["Poubelle de chimie","Conteneur à verre","Incinérateur de sécurité"]
            ],
        ];

        foreach ($quizzes as $data) {
            $contQuiz = new ContQuiz();
            $contQuiz->setQuestion($data[0])
                ->setBonneReponse($data[1])
                ->setMauvaisesReponses($data[2])
                ->setMiniJeu($miniJeuQuiz);
            $manager->persist($contQuiz);
        }

        $manager->flush();
    }
}
