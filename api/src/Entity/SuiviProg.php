<?php

namespace App\Entity;

use App\Repository\SuiviProgRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Représente le suivi de progression d'un joueur sur un mini-jeu spécifique.
 * Cette entité enregistre l'état d'avancement, le score, le temps passé,
 * et les statistiques de jeu pour chaque mini-jeu joué dans une session.
 * Une contrainte unique assure qu'il n'y a qu'un seul suivi par session/mini-jeu.
 *
 * @see SessionJeu La session de jeu associée
 * @see MiniJeu Le mini-jeu suivi
 */
#[ORM\Entity(repositoryClass: SuiviProgRepository::class)]
#[ORM\Table(name: 'suivi_prog')]
#[ORM\UniqueConstraint(name: 'uniq_session_minijeu', columns: ['session_id', 'mini_jeu_id'])]
class SuiviProg
{
    /**
     * Identifiant unique du suivi de progression.
     * Généré automatiquement par la base de données.
     *
     * @var int|null
     */
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * Indique si le mini-jeu est terminé par le joueur.
     * Initialisé à false lors de la création du suivi.
     *
     * @var bool
     */
    #[ORM\Column]
    private ?bool $termine = false;

    /**
     * Score obtenu par le joueur sur ce mini-jeu.
     * Représente le nombre de bonnes réponses ou d'actions correctes.
     * Initialisé à 0.
     *
     * @var int
     */
    #[ORM\Column]
    private ?int $score = 0;

    /**
     * Temps passé par le joueur sur ce mini-jeu, en secondes.
     * Initialisé à 0 et incrémenté pendant le jeu.
     *
     * @var int
     */
    #[ORM\Column]
    private ?int $temps = 0;

    /**
     * Nombre d'items cosmétiques correctement identifiés (pour le mini-jeu de tri).
     * Utilisé pour calculer le score et déterminer si le code est gagné.
     * Initialisé à 0.
     *
     * @var int
     */
    #[ORM\Column]
    private ?int $nbCosmetiqueAtt = 0;

    /**
     * Nombre d'items non cosmétiques correctement identifiés (pour le mini-jeu de tri).
     * Utilisé pour calculer le score et déterminer si le code est gagné.
     * Initialisé à 0.
     *
     * @var int
     */
    #[ORM\Column]
    private ?int $nbNonCosmetiqueAtt = 0;

    /**
     * Indique si le joueur a gagné le fragment de code secret pour ce mini-jeu.
     * Le code est gagné si le score atteint le seuil requis (50% de réussite minimum).
     * Initialisé à false.
     *
     * @var bool
     */
    #[ORM\Column]
    private bool $aGagneCode = false;

    /**
     * Session de jeu associée à ce suivi.
     * Relation many-to-one : une session a plusieurs suivis.
     * La relation est requise (nullable: false).
     *
     * @var SessionJeu|null
     */
    #[ORM\ManyToOne(inversedBy: 'suivis')]
    #[ORM\JoinColumn(nullable: false)]
    private ?SessionJeu $session = null;

    /**
     * Mini-jeu associé à ce suivi.
     * Relation many-to-one : un mini-jeu peut avoir plusieurs suivis.
     * La relation est requise (nullable: false).
     *
     * @var MiniJeu|null
     */
    #[ORM\ManyToOne(inversedBy: 'suivis')]
    #[ORM\JoinColumn(nullable: false)]
    private ?MiniJeu $miniJeu = null;

    /**
     * Récupère l'identifiant unique du suivi.
     *
     * @return int|null L'ID du suivi ou null si non persisté
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Vérifie si le mini-jeu est terminé.
     *
     * @return bool true si le mini-jeu est terminé, false sinon
     */
    public function isTermine(): bool
    {
        return $this->termine;
    }

    /**
     * Définit l'état de terminaison du mini-jeu.
     *
     * @param bool $termine true si le mini-jeu est terminé
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setTermine(bool $termine): static
    {
        $this->termine = $termine;

        return $this;
    }

    /**
     * Récupère le score obtenu sur ce mini-jeu.
     *
     * @return int Le score (nombre de bonnes réponses/actions)
     */
    public function getScore(): int
    {
        return $this->score;
    }

    /**
     * Définit le score obtenu sur ce mini-jeu.
     *
     * @param int $score Le nouveau score
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setScore(int $score): static
    {
        $this->score = $score;

        return $this;
    }

    /**
     * Récupère le temps passé sur ce mini-jeu.
     *
     * @return int Le temps en secondes
     */
    public function getTemps(): int
    {
        return $this->temps;
    }

    /**
     * Définit le temps passé sur ce mini-jeu.
     *
     * @param int $temps Le temps en secondes
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setTemps(int $temps): static
    {
        $this->temps = $temps;

        return $this;
    }

    /**
     * Récupère le nombre d'items cosmétiques correctement identifiés.
     *
     * @return int Nombre d'items cosmétiques attendus atteints
     */
    public function getNbCosmetiqueAtt(): int
    {
        return $this->nbCosmetiqueAtt;
    }

    /**
     * Définit le nombre d'items cosmétiques correctement identifiés.
     *
     * @param int $nbCosmetiqueAtt Le nouveau nombre
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setNbCosmetiqueAtt(int $nbCosmetiqueAtt): static
    {
        $this->nbCosmetiqueAtt = $nbCosmetiqueAtt;

        return $this;
    }

    /**
     * Récupère le nombre d'items non cosmétiques correctement identifiés.
     *
     * @return int Nombre d'items non cosmétiques attendus atteints
     */
    public function getNbNonCosmetiqueAtt(): int
    {
        return $this->nbNonCosmetiqueAtt;
    }

    /**
     * Définit le nombre d'items non cosmétiques correctement identifiés.
     *
     * @param int $nbNonCosmetiqueAtt Le nouveau nombre
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setNbNonCosmetiqueAtt(int $nbNonCosmetiqueAtt): static
    {
        $this->nbNonCosmetiqueAtt = $nbNonCosmetiqueAtt;

        return $this;
    }

    /**
     * Récupère la session associée à ce suivi.
     *
     * @return SessionJeu|null La session ou null
     */
    public function getSession(): ?SessionJeu
    {
        return $this->session;
    }

    /**
     * Définit la session associée à ce suivi.
     *
     * @param SessionJeu|null $session La nouvelle session
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setSession(?SessionJeu $session): static
    {
        $this->session = $session;

        return $this;
    }

    /**
     * Récupère le mini-jeu associé à ce suivi.
     *
     * @return MiniJeu|null Le mini-jeu ou null
     */
    public function getMiniJeu(): ?MiniJeu
    {
        return $this->miniJeu;
    }

    /**
     * Définit le mini-jeu associé à ce suivi.
     *
     * @param MiniJeu|null $miniJeu Le nouveau mini-jeu
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setMiniJeu(?MiniJeu $miniJeu): static
    {
        $this->miniJeu = $miniJeu;

        return $this;
    }

    /**
     * Vérifie si le joueur a gagné le fragment de code secret.
     *
     * @return bool true si le code est gagné, false sinon
     */
    public function isAGagneCode(): bool
    {
        return $this->aGagneCode;
    }

    /**
     * Définit l'état de gain du fragment de code secret.
     *
     * @param bool $aGagneCode true si le code est gagné
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setAGagneCode(bool $aGagneCode): static
    {
        $this->aGagneCode = $aGagneCode;
        return $this;
    }
}
