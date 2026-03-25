<?php

namespace App\Controller\Api;

use App\Repository\MiniJeuRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api', name: 'api_')]
final class MiniJeuController extends AbstractController
{
    #[Route('/minijeux', name: 'minijeux_list', methods: ['GET'])]
    public function listMiniJeux(MiniJeuRepository $repo): JsonResponse
{
    $miniJeux = $repo->findBy(['actif' => true], ['ordre' => 'ASC']);

    return $this->json(array_map(fn($m) => [
        'id' => $m->getId(),
        'nom' => $m->getNom(),
        'type' => $m->getType(),
        'ordre' => $m->getOrdre(),
        'dureeMax' => $m->getDureeMax(),
    ], $miniJeux));
}

#[Route('/minijeux/{id}/contenu', name: 'minijeu_contenu', methods: ['GET'])]
public function contenuMiniJeu(int $id, MiniJeuRepository $repo): JsonResponse
{
    $miniJeu = $repo->find($id);

    if (!$miniJeu) {
        return $this->json(['error' => 'MiniJeu not found'], 404);
    }

    if ($miniJeu->getType() === 'quiz') {
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

    return $this->json(['error' => 'Type de mini-jeu non géré'], 400);
}
}