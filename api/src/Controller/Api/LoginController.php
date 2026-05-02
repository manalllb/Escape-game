<?php

namespace App\Controller\Api;

use App\Repository\AdminJeuRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api', name: 'api_')]
class LoginController extends AbstractController
{
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(
        Request $request,
        AdminJeuRepository $adminRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (!$email || !$password) {
            return $this->json(['error' => 'Email et mot de passe obligatoires'], 400);
        }

        $admin = $adminRepo->findOneBy(['email' => $email]);
        if (!$admin || !password_verify($password, $admin->getPassword())) {
            return $this->json(['error' => 'Identifiants invalides'], 401);
        }

        // Régénérer le token à chaque login
        $token = bin2hex(random_bytes(16));
        $admin->setApiToken($token);
        $em->flush();

        return $this->json([
            'token' => $token,
            'email' => $admin->getEmail(),
        ]);
    }

    #[Route('/logout', name: 'logout', methods: ['POST'])]
    public function logout(
        Request $request,
        AdminJeuRepository $adminRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $token = $request->headers->get('X-Api-Token');
        if ($token) {
            $admin = $adminRepo->findOneBy(['apiToken' => $token]);
            if ($admin) {
                $admin->setApiToken(null);
                $em->flush();
            }
        }

        return $this->json(['message' => 'Déconnecté']);
    }
}
