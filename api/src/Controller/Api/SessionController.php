<?php

namespace App\Controller\Api;

use App\Entity\CodeJeu;
use App\Entity\InventaireCode;
use App\Entity\Joueur;
use App\Entity\SessionJeu;
use App\Entity\SessionJoueur;
use App\Entity\SuiviProg;
use App\Repository\AdminJeuRepository;
use App\Repository\InventaireCodeRepository;
use App\Repository\JoueurRepository;
use App\Repository\MiniJeuRepository;
use App\Repository\SessionJeuRepository;
use App\Repository\SessionJoueurRepository;
use App\Repository\SuiviProgRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api', name: 'api_')]
class SessionController extends AbstractController
{
    #[Route('/sessions', name: 'sessions_create', methods: ['POST'])]
    public function createSession(
        Request $request,
        EntityManagerInterface $em,
        AdminJeuRepository $adminRepo,
        SessionJeuRepository $sessionRepo
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];
        $adminEmail = $data['adminEmail'] ?? null;
        $password = $data['password'] ?? null;

        if (!$adminEmail || !$password) {
            return $this->json(['error' => 'Email et mot de passe obligatoires'], 400);
        }

        $admin = $adminRepo->findOneBy([
            'email' => $adminEmail,
            'password' => $password,
        ]);

        if (!$admin) {
            return $this->json(['error' => 'Identifiants admin invalides'], 401);
        }

        do {
            $pin = (string) random_int(100000, 999999);
            $exists = $sessionRepo->findOneBy(['codePin' => $pin]);
        } while ($exists);

        $now = new \DateTimeImmutable();

        $session = (new SessionJeu())
            ->setAdmin($admin)
            ->setCodePin($pin)
            ->setCodeSecret($this->generateSecretCode())
            ->setEstActive(true)
            ->setDateCreation($now)
            ->setDateDebut($now)
            ->setDateFin($now->modify('+45 minutes'));

        $em->persist($session);
        $em->flush();

        return $this->json([
            'sessionId' => $session->getId(),
            'codePin' => $session->getCodePin(),
            'estActive' => $session->isEstActive(),
            'dateCreation' => $session->getDateCreation()?->format(DATE_ATOM),
            'adminEmail' => $admin->getEmail(),
        ], 201);
    }

    #[Route('/sessions/join', name: 'sessions_join', methods: ['POST'])]
    public function joinSession(
        Request $request,
        EntityManagerInterface $em,
        SessionJeuRepository $sessionRepo,
        JoueurRepository $joueurRepo,
        MiniJeuRepository $miniJeuRepo
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];
        $pin = $data['codePin'] ?? null;
        $pseudo = trim((string) ($data['pseudo'] ?? ''));

        if (!$pin || !$pseudo) {
            return $this->json(['error' => 'codePin et pseudo obligatoires'], 400);
        }

        $session = $sessionRepo->findOneBy(['codePin' => $pin, 'estActive' => true]);
        if (!$session) {
            return $this->json(['error' => 'PIN invalide ou session inactive'], 404);
        }

        if ($session->getDateFin() && new \DateTimeImmutable() > $session->getDateFin()) {
            $session->setEstActive(false);
            $em->flush();
            return $this->json(['error' => 'Session expirée'], 403);
        }

        $joueur = $joueurRepo->findOneBy(['pseudo' => $pseudo]);
        if (!$joueur) {
            $joueur = (new Joueur())->setPseudo($pseudo);
            $em->persist($joueur);
        }

        $sessionJoueur = (new SessionJoueur())
            ->setSession($session)
            ->setJoueur($joueur)
            ->setDateConnexion(new \DateTimeImmutable())
            ->setScore(0)
            ->setTentativesCodeFinal(0)
            ->setEstGameOver(false)
            ->setAGagne(false);

        $em->persist($sessionJoueur);

        $miniJeux = $miniJeuRepo->findBy(['actif' => true], ['ordre' => 'ASC']);

        foreach ($miniJeux as $miniJeu) {
            $suivi = (new SuiviProg())
                ->setSessionJoueur($sessionJoueur)
                ->setMiniJeu($miniJeu)
                ->setTermine(false)
                ->setScore(0)
                ->setTemps(0)
                ->setNbCosmetiqueAtt(0)
                ->setNbNonCosmetiqueAtt(0)
                ->setAGagneCode(false);

            $em->persist($suivi);
        }

        $codeSecret = $session->getCodeSecret() ?? $this->generateSecretCode();
        $session->setCodeSecret($codeSecret);

        $fragments = [
            ['fragment' => substr($codeSecret, 0, 4), 'ordre' => 1],
            ['fragment' => substr($codeSecret, 4, 4), 'ordre' => 2],
            ['fragment' => substr($codeSecret, 8, 4), 'ordre' => 3],
        ];

        foreach ($fragments as $dataCode) {
            $code = (new CodeJeu())
                ->setFragment($dataCode['fragment'])
                ->setOrdre($dataCode['ordre']);

            $em->persist($code);

            $inventaire = (new InventaireCode())
                ->setSessionJoueur($sessionJoueur)
                ->setCode($code)
                ->setEstValide(false);

            $em->persist($inventaire);
        }

        $em->flush();

        return $this->json([
            'sessionId' => $session->getId(),
            'sessionJoueurId' => $sessionJoueur->getId(),
            'codePin' => $session->getCodePin(),
            'joueurId' => $joueur->getId(),
            'pseudo' => $joueur->getPseudo(),
        ]);
    }

    #[Route('/sessions/{id}/state', name: 'sessions_state_admin', methods: ['GET'])]
    public function adminState(
        int $id,
        SessionJeuRepository $sessionRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $session = $sessionRepo->find($id);
        if (!$session) {
            return $this->json(['error' => 'Session not found'], 404);
        }

        $time = $this->getSessionTimeData($session, $em);

        $joueurs = [];
        $scoreTotal = 0;

        foreach ($session->getSessionJoueurs() as $sessionJoueur) {
            $scoreTotal += $sessionJoueur->getScore();

            $joueurs[] = [
                'sessionJoueurId' => $sessionJoueur->getId(),
                'joueurId' => $sessionJoueur->getJoueur()?->getId(),
                'pseudo' => $sessionJoueur->getJoueur()?->getPseudo(),
                'score' => $sessionJoueur->getScore(),
                'aGagne' => $sessionJoueur->isAGagne(),
                'estGameOver' => $sessionJoueur->isEstGameOver(),
                'dateConnexion' => $sessionJoueur->getDateConnexion()?->format(DATE_ATOM),
                'suivis' => $this->formatSuivis($sessionJoueur),
                'inventaireCodes' => $this->formatInventaireCodes($sessionJoueur),
            ];
        }

        return $this->json([
            'sessionId' => $session->getId(),
            'codePin' => $session->getCodePin(),
            'estActive' => $session->isEstActive(),
            'sessionExpiree' => $time['sessionExpiree'],
            'tempsRestant' => $time['tempsRestant'],
            'dateCreation' => $session->getDateCreation()?->format(DATE_ATOM),
            'dateDebut' => $session->getDateDebut()?->format(DATE_ATOM),
            'dateFin' => $session->getDateFin()?->format(DATE_ATOM),
            'admin' => $session->getAdmin()?->getEmail(),
            'score' => $scoreTotal,
            'joueurs' => $joueurs,
        ]);
    }

    #[Route('/session-joueurs/{id}/state', name: 'session_joueurs_state', methods: ['GET'])]
    public function playerState(
        int $id,
        SessionJoueurRepository $sessionJoueurRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $sessionJoueur = $sessionJoueurRepo->find($id);
        if (!$sessionJoueur) {
            return $this->json(['error' => 'Session joueur not found'], 404);
        }

        $session = $sessionJoueur->getSession();
        if (!$session) {
            return $this->json(['error' => 'Session not found'], 404);
        }

        $time = $this->getSessionTimeData($session, $em);

        return $this->json([
            'sessionId' => $session->getId(),
            'sessionJoueurId' => $sessionJoueur->getId(),
            'codePin' => $session->getCodePin(),
            'estActive' => $session->isEstActive(),
            'sessionExpiree' => $time['sessionExpiree'],
            'tempsRestant' => $time['tempsRestant'],
            'score' => $sessionJoueur->getScore(),
            'joueur' => [
                'id' => $sessionJoueur->getJoueur()?->getId(),
                'pseudo' => $sessionJoueur->getJoueur()?->getPseudo(),
            ],
            'suivis' => $this->formatSuivis($sessionJoueur),
            'inventaireCodes' => $this->formatInventaireCodes($sessionJoueur),
        ]);
    }

    #[Route('/session-joueurs/{sessionJoueurId}/minijeux/{miniJeuId}/complete', name: 'session_joueur_minijeu_complete', methods: ['POST'])]
    public function completeMiniJeu(
        int $sessionJoueurId,
        int $miniJeuId,
        Request $request,
        EntityManagerInterface $em,
        SessionJoueurRepository $sessionJoueurRepo,
        MiniJeuRepository $miniJeuRepo,
        SuiviProgRepository $suiviRepo,
        InventaireCodeRepository $inventaireRepo
    ): JsonResponse {
        $sessionJoueur = $sessionJoueurRepo->find($sessionJoueurId);
        if (!$sessionJoueur) {
            return $this->json(['error' => 'Session joueur not found'], 404);
        }

        $session = $sessionJoueur->getSession();
        if (!$session) {
            return $this->json(['error' => 'Session not found'], 404);
        }

        if ($session->getDateFin() && new \DateTimeImmutable() > $session->getDateFin()) {
            $session->setEstActive(false);
            $sessionJoueur->setEstGameOver(true);
            $em->flush();
            return $this->json(['error' => 'Temps écoulé, session terminée'], 403);
        }

        $miniJeu = $miniJeuRepo->find($miniJeuId);
        if (!$miniJeu) {
            return $this->json(['error' => 'MiniJeu not found'], 404);
        }

        $suivi = $suiviRepo->findOneBy([
            'sessionJoueur' => $sessionJoueur,
            'miniJeu' => $miniJeu,
        ]);

        if (!$suivi) {
            return $this->json(['error' => 'SuiviProg not found for this player and mini-game'], 404);
        }

        if ($suivi->isTermine()) {
            return $this->json(['error' => 'Ce mini-jeu est déjà validé'], 400);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $score = (int) ($data['score'] ?? 0);
        $temps = (int) ($data['temps'] ?? 0);
        $nbCosmetiqueAtt = (int) ($data['nbCosmetiqueAtt'] ?? 0);
        $nbNonCosmetiqueAtt = (int) ($data['nbNonCosmetiqueAtt'] ?? 0);

        $totalContenu = match ($miniJeu->getType()) {
            'quiz' => count($miniJeu->getContQuizzes()),
            'tri' => count($miniJeu->getContTris()),
            'sequence' => count($miniJeu->getContSeqs()),
            default => 0,
        };

        if ($totalContenu <= 0) {
            return $this->json(['error' => 'Aucune donnée disponible pour ce mini-jeu'], 400);
        }

        $seuil = (int) ceil($totalContenu / 2);
        $aGagneCode = $score >= $seuil;

        if ($aGagneCode) {
            $inventaires = $inventaireRepo->findBy(
                ['sessionJoueur' => $sessionJoueur],
                ['id' => 'ASC']
            );

            foreach ($inventaires as $inventaire) {
                if ($inventaire->getCode() && $inventaire->getCode()->getOrdre() === $miniJeu->getOrdre()) {
                    $inventaire->setEstValide(true);
                    break;
                }
            }
        }

        $suivi
            ->setTermine($aGagneCode)
            ->setScore($score)
            ->setTemps($temps)
            ->setNbCosmetiqueAtt($nbCosmetiqueAtt)
            ->setNbNonCosmetiqueAtt($nbNonCosmetiqueAtt)
            ->setAGagneCode($aGagneCode);

        $scoreTotal = 0;
        foreach ($sessionJoueur->getSuivis() as $s) {
            $scoreTotal += $s->getScore();
        }
        $sessionJoueur->setScore($scoreTotal);

        $em->flush();

        return $this->json([
            'message' => $aGagneCode ? 'Mini-jeu réussi, code débloqué' : 'Score insuffisant, rejouez',
            'sessionId' => $session->getId(),
            'sessionJoueurId' => $sessionJoueur->getId(),
            'miniJeuId' => $miniJeu->getId(),
            'suiviId' => $suivi->getId(),
            'termine' => $suivi->isTermine(),
            'score' => $suivi->getScore(),
            'temps' => $suivi->getTemps(),
            'seuil' => $seuil,
            'aGagneCode' => $suivi->isAGagneCode(),
            'scoreSessionJoueur' => $sessionJoueur->getScore(),
        ]);
    }

    #[Route('/session-joueurs/{id}/validate-code', name: 'session_joueurs_validate_code', methods: ['POST'])]
    public function validateCode(
        int $id,
        Request $request,
        SessionJoueurRepository $sessionJoueurRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $sessionJoueur = $sessionJoueurRepo->find($id);
        if (!$sessionJoueur) {
            return $this->json(['error' => 'Session joueur not found'], 404);
        }

        $session = $sessionJoueur->getSession();
        if (!$session) {
            return $this->json(['error' => 'Session not found'], 404);
        }

        if ($session->getDateFin() && new \DateTimeImmutable() > $session->getDateFin()) {
            $session->setEstActive(false);
            $sessionJoueur->setEstGameOver(true);
            $em->flush();
            return $this->json(['error' => 'Temps écoulé, session terminée'], 403);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $codeSaisi = strtoupper(trim($data['code'] ?? ''));

        if ($codeSaisi === '') {
            return $this->json(['error' => 'Le code est obligatoire'], 400);
        }

        $inventaires = $sessionJoueur->getInventaireCodes()->toArray();
        $tousCodesDebloques = count($inventaires) > 0;

        foreach ($inventaires as $inventaire) {
            if (!$inventaire->isEstValide()) {
                $tousCodesDebloques = false;
                break;
            }
        }

        if (!$tousCodesDebloques) {
            return $this->json([
                'success' => false,
                'error' => 'Tous les fragments n’ont pas encore été débloqués',
            ], 400);
        }

        $success = $codeSaisi === strtoupper((string) $session->getCodeSecret());

        if ($success) {
            $sessionJoueur->setAGagne(true);
            $em->flush();
        }

        return $this->json([
            'success' => $success,
            'message' => $success ? 'Code correct, coffre déverrouillé' : 'Code incorrect',
            'scoreFinal' => $sessionJoueur->getScore(),
        ]);
    }

    private function getSessionTimeData(SessionJeu $session, EntityManagerInterface $em): array
    {
        $now = new \DateTimeImmutable();
        $dateFin = $session->getDateFin();
        $sessionExpiree = $dateFin ? $now > $dateFin : false;
        $tempsRestant = ($dateFin && !$sessionExpiree) ? $dateFin->getTimestamp() - $now->getTimestamp() : 0;

        if ($sessionExpiree && $session->isEstActive()) {
            $session->setEstActive(false);
            $em->flush();
        }

        return [
            'sessionExpiree' => $sessionExpiree,
            'tempsRestant' => $tempsRestant,
        ];
    }

    private function formatSuivis(SessionJoueur $sessionJoueur): array
    {
        return array_map(fn($s) => [
            'id' => $s->getId(),
            'miniJeuId' => $s->getMiniJeu()?->getId(),
            'nom' => $s->getMiniJeu()?->getNom(),
            'type' => $s->getMiniJeu()?->getType(),
            'ordre' => $s->getMiniJeu()?->getOrdre(),
            'dureeMax' => $s->getMiniJeu()?->getDureeMax(),
            'termine' => $s->isTermine(),
            'score' => $s->getScore(),
            'temps' => $s->getTemps(),
            'nbCosmetiqueAtt' => $s->getNbCosmetiqueAtt(),
            'nbNonCosmetiqueAtt' => $s->getNbNonCosmetiqueAtt(),
            'aGagneCode' => $s->isAGagneCode(),
        ], $sessionJoueur->getSuivis()->toArray());
    }

    private function formatInventaireCodes(SessionJoueur $sessionJoueur): array
    {
        return array_map(fn($inv) => [
            'id' => $inv->getId(),
            'estValide' => $inv->isEstValide(),
            'code' => [
                'id' => $inv->getCode()?->getId(),
                'fragment' => $inv->getCode()?->getFragment(),
                'ordre' => $inv->getCode()?->getOrdre(),
            ],
        ], $sessionJoueur->getInventaireCodes()->toArray());
    }

    private function randomLetters(int $length): string
    {
        $letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $result = '';

        for ($i = 0; $i < $length; $i++) {
            $result .= $letters[random_int(0, strlen($letters) - 1)];
        }

        return $result;
    }

    private function generateSecretCode(): string
    {
        return $this->randomLetters(4) . random_int(1000, 9999) . $this->randomLetters(4);
    }
}
