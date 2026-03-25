<?php

namespace App\Controller\Api;

use App\Entity\AdminJeu;
use App\Entity\Joueur;
use App\Entity\SessionJeu;
use App\Entity\SuiviProg;
use App\Repository\MiniJeuRepository;
use App\Repository\AdminJeuRepository;
use App\Repository\JoueurRepository;
use App\Repository\SessionJeuRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\SuiviProgRepository;

#[Route('/api', name: 'api_')] //ecrit ici travail en moins :)
class SessionController extends AbstractController
{
    #[Route('/sessions', name: 'sessions_create', methods: ['POST'])]

    public function createSession(Request $request, EntityManagerInterface $em, 
    AdminJeuRepository $adminRepo, SessionJeuRepository $sessionRepo, MiniJeuRepository $miniJeuRepo ): JsonResponse 
    {
        // on recupère l'admin par email envoyé (plus tard: vraie auth /session)
        $data = json_decode($request->getContent(), true) ?? [];
        $adminEmail = $data['adminEmail'] ?? null;

        if (!$adminEmail) {
            return $this->json(['error' => 'adminEmail est obligatoire'], 400);
        }

        $admin = $adminRepo->findOneBy(['email' => $adminEmail]);
        if (!$admin) {
            // auto création admin si inexistant (a retirer plus tard)
            $admin = (new AdminJeu())
                ->setEmail($adminEmail)
                ->setPassword('temp'); // TODO: hash + vrai login
            $em->persist($admin);
        }

        // Générer un PIN unique (6 chiffres)
        do {
            $pin = (string) random_int(100000, 999999);
            $exists = $sessionRepo->findOneBy(['codePin' => $pin]);
        } while ($exists);

        $session = (new SessionJeu())
            ->setAdmin($admin)
            ->setCodePin($pin)
            ->setEstActive(true)
            ->setDateCreation(new \DateTimeImmutable())
            ->setScore(0);
        // joueur reste null jusqu'au join

        $em->persist($session);
        
$miniJeux = $miniJeuRepo->findBy(['actif' => true], ['ordre' => 'ASC']);

foreach ($miniJeux as $miniJeu) {
    $suivi = (new SuiviProg())
        ->setSession($session)
        ->setMiniJeu($miniJeu)
        ->setTermine(false)
        ->setScore(0)
        ->setTemps(0)
        ->setNbCosmetiqueAtt(0)
        ->setNbNonCosmetiqueAtt(0);

    $em->persist($suivi);
}
        $em->flush();

        return $this->json([
            'sessionId' => $session->getId(),
            'codePin' => $session->getCodePin(),
            'estActive' => $session->isEstActive(),
            'dateCreation' => $session->getDateCreation()?->format(DATE_ATOM),
        ], 201);
    }

    #[Route('/sessions/join', name: 'sessions_join', methods: ['POST'])]
    public function joinSession(Request $request, EntityManagerInterface $em,
    SessionJeuRepository $sessionRepo, JoueurRepository $joueurRepo ): JsonResponse 
        {
        $data = json_decode($request->getContent(), true) ?? [];
        $pin = $data['codePin'] ?? null;
        $pseudo = $data['pseudo'] ?? null;

        if (!$pin || !$pseudo) {
            return $this->json(['error' => 'codePin et pseudo obligatoire'], 400);
        }

        $session = $sessionRepo->findOneBy(['codePin' => $pin, 'estActive' => true]);
        if (!$session) {
            return $this->json(['error' => 'PIN invalide ou session inactive'], 404);
        }

        // MVP: un joueur est identifié par pseudo 
        $joueur = $joueurRepo->findOneBy(['pseudo' => $pseudo]);
        if (!$joueur) { //si pas de joueur on le creer on peut changer apres aussi
            $joueur = (new Joueur())->setPseudo($pseudo);
            $em->persist($joueur);
        }

        $session->setJoueur($joueur);
        $em->flush();

        return $this->json([
            'sessionId' => $session->getId(),
            'codePin' => $session->getCodePin(),
            'joueurId' => $joueur->getId(),
            'pseudo' => $joueur->getPseudo(),
        ]);
        }

    #[Route('/sessions/{id}/state', name: 'sessions_state', methods: ['GET'])]
    public function state(int $id, SessionJeuRepository $sessionRepo): JsonResponse
    {
        $session = $sessionRepo->find($id);
        if (!$session) {
            return $this->json(['error' => 'Session not found'], 404);
        }

return $this->json([
        'sessionId' => $session->getId(),
        'codePin' => $session->getCodePin(),
        'estActive' => $session->isEstActive(),
        'dateCreation' => $session->getDateCreation()?->format(DATE_ATOM),
        'score' => $session->getScore(),
        'admin' => $session->getAdmin()?->getEmail(),
        'joueur' => $session->getJoueur() ? [
            'id' => $session->getJoueur()->getId(),
            'pseudo' => $session->getJoueur()->getPseudo(),
        ] : null,
        'suivis' => array_map(fn($s) => [
            'id' => $s->getId(),
            'miniJeuId' => $s->getMiniJeu()->getId(),
            'nom' => $s->getMiniJeu()->getNom(),
            'type' => $s->getMiniJeu()->getType(),
            'ordre' => $s->getMiniJeu()->getOrdre(),
            'dureeMax' => $s->getMiniJeu()->getDureeMax(),
            'termine' => $s->isTermine(),
            'score' => $s->getScore(),
            'temps' => $s->getTemps(),
            'nbCosmetiqueAtt' => $s->getNbCosmetiqueAtt(),
            'nbNonCosmetiqueAtt' => $s->getNbNonCosmetiqueAtt(),
            'gagneTri' => $s->isGagneTri(),
        ], $session->getSuivis()->toArray()),
    ]);
    } 


    #[Route('/sessions/{sessionId}/minijeux/{miniJeuId}/complete', name: 'sessions_minijeu_complete', methods: ['POST'])]
public function completeMiniJeu(
    int $sessionId,
    int $miniJeuId,
    Request $request,
    EntityManagerInterface $em,
    SessionJeuRepository $sessionRepo,
    MiniJeuRepository $miniJeuRepo,
    SuiviProgRepository $suiviRepo
): JsonResponse {
    $session = $sessionRepo->find($sessionId);
    if (!$session) {
        return $this->json(['error' => 'Session not found'], 404);
    }

    $miniJeu = $miniJeuRepo->find($miniJeuId);
    if (!$miniJeu) {
        return $this->json(['error' => 'MiniJeu not found'], 404);
    }

    $suivi = $suiviRepo->findOneBy([
        'session' => $session,
        'miniJeu' => $miniJeu,
    ]);

    if (!$suivi) {
        return $this->json(['error' => 'SuiviProg not found for this session and mini-game'], 404);
    }

    $data = json_decode($request->getContent(), true) ?? [];

    $score = (int) ($data['score'] ?? 0);
    $temps = (int) ($data['temps'] ?? 0);
    $nbCosmetiqueAtt = (int) ($data['nbCosmetiqueAtt'] ?? 0);
    $nbNonCosmetiqueAtt = (int) ($data['nbNonCosmetiqueAtt'] ?? 0);

    $suivi
        ->setTermine(true)
        ->setScore($score)
        ->setTemps($temps)
        ->setNbCosmetiqueAtt($nbCosmetiqueAtt)
        ->setNbNonCosmetiqueAtt($nbNonCosmetiqueAtt);

    // recalcul score global session = somme des suivis
    $em->flush();

    $scoreTotal = 0;
    foreach ($session->getSuivis() as $s) {
        $scoreTotal += $s->getScore();
    }

    $session->setScore($scoreTotal);
    $em->flush();

    return $this->json([
        'message' => 'Mini-jeu completed',
        'sessionId' => $session->getId(),
        'miniJeuId' => $miniJeu->getId(),
        'suiviId' => $suivi->getId(),
        'termine' => $suivi->isTermine(),
        'score' => $suivi->getScore(),
        'temps' => $suivi->getTemps(),
        'nbCosmetiqueAtt' => $suivi->getNbCosmetiqueAtt(),
        'nbNonCosmetiqueAtt' => $suivi->getNbNonCosmetiqueAtt(),
        'gagneTri' => $suivi->isGagneTri(),
        'scoreSession' => $session->getScore(),
    ]);
}

    }