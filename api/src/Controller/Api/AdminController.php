<?php

namespace App\Controller\Api;

use App\Repository\AdminJeuRepository;
use App\Repository\SessionJeuRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api', name: 'api_')]
class AdminController extends AbstractController
{
    #[Route('/admin/me', name: 'admin_me', methods: ['GET'])]
    public function me(Request $request, AdminJeuRepository $adminRepo): JsonResponse
    {
        $token = $request->headers->get('X-Api-Token');
        if (!$token) {
            return $this->json(['error' => 'Token manquant'], 401);
        }

        $admin = $adminRepo->findOneBy(['apiToken' => $token]);
        if (!$admin) {
            return $this->json(['error' => 'Token invalide'], 401);
        }

        return $this->json([
            'id' => $admin->getId(),
            'email' => $admin->getEmail(),
        ]);
    }

    #[Route('/admin/sessions', name: 'admin_sessions', methods: ['GET'])]
    public function sessions(
        Request $request,
        AdminJeuRepository $adminRepo,
        SessionJeuRepository $sessionRepo
    ): JsonResponse {
        $token = $request->headers->get('X-Api-Token');
        if (!$token) {
            return $this->json(['error' => 'Token manquant'], 401);
        }

        $admin = $adminRepo->findOneBy(['apiToken' => $token]);
        if (!$admin) {
            return $this->json(['error' => 'Token invalide'], 401);
        }

        $sessions = $sessionRepo->findBy(['admin' => $admin], ['dateCreation' => 'DESC']);
        error_log('Admin ' . $admin->getEmail() . ' has ' . count($sessions) . ' sessions');

        return $this->json(array_map(fn($s) => [
            'id' => $s->getId(),
            'codePin' => $s->getCodePin(),
            'estActive' => $s->isEstActive(),
            'dateCreation' => $s->getDateCreation()?->format(DATE_ATOM),
            'dateDebut' => $s->getDateDebut()?->format(DATE_ATOM),
            'dateFin' => $s->getDateFin()?->format(DATE_ATOM),
            'score' => $s->getScore(),
            'joueur' => $s->getJoueur() ? [
                'id' => $s->getJoueur()->getId(),
                'pseudo' => $s->getJoueur()->getPseudo(),
            ] : null,
        ], $sessions));
    }
}
