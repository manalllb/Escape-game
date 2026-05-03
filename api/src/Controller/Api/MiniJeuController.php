<?php

namespace App\Controller\Api;

use App\Repository\MiniJeuRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Contrôleur pour la gestion des mini-jeux.
 */
#[Route('/api', name: 'api_')]
final class MiniJeuController extends AbstractController
{
    /**
     * Récupère la liste de tous les mini-jeux actifs.
     * Les mini-jeux sont triés par ordre croissant (ordre de passage dans la session).
     * Seuls les mini-jeux avec le statut actif=true sont retournés.
     */
    #[Route('/minijeux', name: 'minijeux_list', methods: ['GET'])]
    public function listMiniJeux(MiniJeuRepository $repo): JsonResponse
    {
        // Récupération de tous les mini-jeux actifs, triés par ordre
        $miniJeux = $repo->findBy(['actif' => true], ['ordre' => 'ASC']);

        // Transformation des entités en tableau JSON sérialisable
        return $this->json(array_map(fn($m) => [
            'id' => $m->getId(),
            'nom' => $m->getNom(),
            'type' => $m->getType(),
            'ordre' => $m->getOrdre(),
            'dureeMax' => $m->getDureeMax(),
        ], $miniJeux));
    }

    /**
     * Récupère le contenu détaillé d'un mini-jeu spécifique.
     *
     * Le contenu retourné dépend du type du mini-jeu :
     * quiz : tableau de questions avec bonnes et mauvaises réponses
     * tri : tableau d'items avec leur statut cosmétique
     * sequence : tableau d'étapes avec libellé, ordre et zone d'application
     *
     */
    #[Route('/minijeux/{id}/contenu', name: 'minijeu_contenu', methods: ['GET'])]
    public function contenuMiniJeu(int $id, MiniJeuRepository $repo): JsonResponse
    {
        // Recherche du mini-jeu par son ID
        $miniJeu = $repo->find($id);

        if (!$miniJeu) {
            return $this->json(['error' => 'MiniJeu not found'], 404);
        }

        // Récupération du contenu selon le type du mini-jeu
        if ($miniJeu->getType() === 'quiz') {
            // Pour un quiz, on retourne toutes les questions
            $questions = array_map(fn($q) => [
                'id' => $q->getId(),
                'question' => $q->getQuestion(),
                'bonneReponse' => $q->getBonneReponse(),
                'mauvaisesReponses' => $q->getMauvaisesReponses(),
            ], $miniJeu->getContQuizzes()->toArray());

            return $this->json([
                'id' => $miniJeu->getId(),
                'nom' => $miniJeu->getNom(),
                'type' => $miniJeu->getType(),
                'questions' => $questions,
            ]);
        }

        // Pour un tri, on retourne tous les items à trier
        if ($miniJeu->getType() === 'tri') {
            $items = array_map(fn($t) => [
                'id' => $t->getId(),
                'nomProduit' => $t->getNomProduit(),
                'estCosmetique' => $t->isEstCosmetique(),
            ], $miniJeu->getContTris()->toArray());

            return $this->json([
                'id' => $miniJeu->getId(),
                'nom' => $miniJeu->getNom(),
                'type' => $miniJeu->getType(),
                'items' => $items,
            ]);
        }

        // Pour une séquence, on retourne toutes les étapes
        if ($miniJeu->getType() === 'sequence') {
            $etapes = array_map(fn($s) => [
                'id' => $s->getId(),
                'libelle' => $s->getLibelle(),
                'ordreAttendu' => $s->getOrdreAttendu(),
                'zoneApp' => $s->getZoneApp(),
            ], $miniJeu->getContSeqs()->toArray());

            return $this->json([
                'id' => $miniJeu->getId(),
                'nom' => $miniJeu->getNom(),
                'type' => $miniJeu->getType(),
                'etapes' => $etapes,
            ]);
        }

        // Erreur si le type du mini-jeu n'est pas reconnu
        return $this->json(['error' => 'Type de mini-jeu non géré'], 400);
    }
}