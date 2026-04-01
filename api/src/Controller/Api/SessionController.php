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
use App\Entity\CodeJeu;
use App\Entity\InventaireCode;
use App\Repository\InventaireCodeRepository;

#[Route('/api', name: 'api_')] //ecrit ici travail en moins :)
class SessionController extends AbstractController
{
    #[Route('/sessions', name: 'sessions_create', methods: ['POST'])]

    public function createSession(Request $request, EntityManagerInterface $em, 
    AdminJeuRepository $adminRepo, SessionJeuRepository $sessionRepo, MiniJeuRepository $miniJeuRepo): JsonResponse 
    {
        // on recupère l'admin par email envoyé (plus tard: vraie auth /session) DONE now !!! 
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


    

        // Générer un PIN unique (6 chiffres)
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
            ->setDateFin($now->modify('+45 minutes'))
            ->setScore(0);
        // joueur reste null jusqu'au join

        $em->persist($session);


        $codeSecret = $session->getCodeSecret();

$frag1 = substr($codeSecret, 0, 4);
$frag2 = substr($codeSecret, 4, 4);
$frag3 = substr($codeSecret, 8, 4);

$fragments = [
    ['fragment' => $frag1, 'ordre' => 1],
    ['fragment' => $frag2, 'ordre' => 2],
    ['fragment' => $frag3, 'ordre' => 3],
];

foreach ($fragments as $dataCode) {
    $code = (new CodeJeu())
        ->setFragment($dataCode['fragment'])
        ->setOrdre($dataCode['ordre']);

    $em->persist($code);

    $inventaire = (new InventaireCode())
        ->setSession($session)
        ->setCode($code)
        ->setEstValide(false);

    $em->persist($inventaire);
}
        
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

        if ($session->getDateFin() && new \DateTimeImmutable() > $session->getDateFin()) {
            $session->setEstActive(false);
            $em->flush();
            return $this->json(['error' => 'Session expirée'], 403);
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
public function state(
    int $id,
    SessionJeuRepository $sessionRepo,
    EntityManagerInterface $em
): JsonResponse
{
    $session = $sessionRepo->find($id);
    if (!$session) {
        return $this->json(['error' => 'Session not found'], 404);
    }

    $now = new \DateTimeImmutable();
    $dateFin = $session->getDateFin();

    $sessionExpiree = $dateFin ? $now > $dateFin : false;
    $tempsRestant = 0;

    if ($dateFin && !$sessionExpiree) {
        $tempsRestant = $dateFin->getTimestamp() - $now->getTimestamp();
    }

    if ($sessionExpiree && $session->isEstActive()) {
        $session->setEstActive(false);
        $em->flush();
    }

    return $this->json([
        'sessionId' => $session->getId(),
        'codePin' => $session->getCodePin(),
        'estActive' => $session->isEstActive(),
        'sessionExpiree' => $sessionExpiree,
        'tempsRestant' => $tempsRestant,
        'dateCreation' => $session->getDateCreation()?->format(DATE_ATOM),
        'dateDebut' => $session->getDateDebut()?->format(DATE_ATOM),
        'dateFin' => $session->getDateFin()?->format(DATE_ATOM),
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
            'aGagneCode' => $s->isAGagneCode(),
        ], $session->getSuivis()->toArray()),
        'inventaireCodes' => array_map(fn($inv) => [
            'id' => $inv->getId(),
            'estValide' => $inv->isEstValide(),
            'code' => [
                'id' => $inv->getCode()?->getId(),
                'fragment' => $inv->getCode()?->getFragment(),
                'ordre' => $inv->getCode()?->getOrdre(),
                ],
            ], $session->getInventaireCodes()->toArray()),
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
    SuiviProgRepository $suiviRepo,
    InventaireCodeRepository $inventaireRepo
): JsonResponse {
    $session = $sessionRepo->find($sessionId);
    if (!$session) {
        return $this->json(['error' => 'Session not found'], 404);
    }

    if ($session->getDateFin() && new \DateTimeImmutable() > $session->getDateFin()) {
        $session->setEstActive(false);
        $em->flush();

        return $this->json(['error' => 'Temps écoulé, session terminée'], 403);
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

    if ($suivi->isTermine()) {
    return $this->json([
        'error' => 'Ce mini-jeu est déjà validé'
    ], 400);
    }

    $data = json_decode($request->getContent(), true) ?? [];

    $score = (int) ($data['score'] ?? 0);
    $temps = (int) ($data['temps'] ?? 0);
    $nbCosmetiqueAtt = (int) ($data['nbCosmetiqueAtt'] ?? 0);
    $nbNonCosmetiqueAtt = (int) ($data['nbNonCosmetiqueAtt'] ?? 0);

    $totalContenu = 0;

    if ($miniJeu->getType() === 'quiz') {
        $totalContenu = count($miniJeu->getContQuizzes());
    } elseif ($miniJeu->getType() === 'tri') {
        $totalContenu = count($miniJeu->getContTris());
    } elseif ($miniJeu->getType() === 'sequence') {
        $totalContenu = count($miniJeu->getContSeqs());
    }


    if ($totalContenu <= 0) {
    return $this->json([
        'error' => 'Aucune donnée disponible pour ce mini-jeu'
    ], 400);
}


    $seuil = (int) ceil($totalContenu / 2);
    $aGagneCode = $score >= $seuil;

    if ($aGagneCode) {
    $inventaires = $inventaireRepo->findBy(
        ['session' => $session],
        ['id' => 'ASC']
    );

    foreach ($inventaires as $inventaire) {
        if (
            $inventaire->getCode() &&
            $inventaire->getCode()->getOrdre() === $miniJeu->getOrdre()
        ) {
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

    $em->flush();

    $scoreTotal = 0;
    foreach ($session->getSuivis() as $s) {
        $scoreTotal += $s->getScore();
    }

    $session->setScore($scoreTotal);
    $em->flush();

    return $this->json([
        'message' => $aGagneCode ? 'Mini-jeu réussi, code débloqué' : 'Score insuffisant, rejouez',
        'sessionId' => $session->getId(),
        'miniJeuId' => $miniJeu->getId(),
        'suiviId' => $suivi->getId(),
        'termine' => $suivi->isTermine(),
        'score' => $suivi->getScore(),
        'temps' => $suivi->getTemps(),
        'seuil' => $seuil,
        'aGagneCode' => $suivi->isAGagneCode(),
        'nbCosmetiqueAtt' => $suivi->getNbCosmetiqueAtt(),
        'nbNonCosmetiqueAtt' => $suivi->getNbNonCosmetiqueAtt(),
        'scoreSession' => $session->getScore(),
    ]);
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
    return $this->randomLetters(4)
        . random_int(1000, 9999)
        . $this->randomLetters(4);
}


#[Route('/sessions/{id}/validate-code', name: 'sessions_validate_code', methods: ['POST'])]
public function validateCode(
    int $id,
    Request $request,
    SessionJeuRepository $sessionRepo,
    EntityManagerInterface $em
): JsonResponse {
    $session = $sessionRepo->find($id);

    if (!$session) {
        return $this->json(['error' => 'Session not found'], 404);
    }

    if ($session->getDateFin() && new \DateTimeImmutable() > $session->getDateFin()) {
        $session->setEstActive(false);
        $em->flush();

        return $this->json(['error' => 'Temps écoulé, session terminée'], 403);
    }

    $data = json_decode($request->getContent(), true) ?? [];
    $codeSaisi = strtoupper(trim($data['code'] ?? ''));

    if ($codeSaisi === '') {
        return $this->json(['error' => 'Le code est obligatoire'], 400);
    }

    $inventaires = $session->getInventaireCodes()->toArray();
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
            'error' => 'Tous les fragments n’ont pas encore été débloqués'
        ], 400);
    }

    $codeSecret = strtoupper((string) $session->getCodeSecret());
    $success = $codeSaisi === $codeSecret;

    return $this->json([
        'success' => $success,
        'message' => $success
            ? 'Code correct, coffre déverrouillé'
            : 'Code incorrect',
        'scoreFinal' => $session->getScore(),
    ]);
}


}