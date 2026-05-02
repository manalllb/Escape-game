<?php

namespace App\Entity;

use App\Repository\SessionJeuRepository;
use Doctrine\ORM\Mapping as ORM;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

/**
 * Représente une session de jeu active.
 * Une session est créée par un administrateur et rejointe par un joueur.
 * Elle contient un code PIN pour la rejoindre, un score global, et suit
 * la progression du joueur à travers les mini-jeux via SuiviProg.
 * La session possède également un code secret à découvrir pour gagner.
 *
 * @see AdminJeu L'administrateur qui a créé la session
 * @see Joueur Le joueur qui participe à la session
 * @see SuiviProg Le suivi de progression des mini-jeux
 * @see InventaireCode Les fragments de code secret collectés
 */
#[ORM\Entity(repositoryClass: SessionJeuRepository::class)]
class SessionJeu
{
    /**
     * Collection des suivis de progression pour cette session.
     * Chaque suivi représente l'état d'un mini-jeu pour le joueur.
     *
     * @var Collection<int, SuiviProg>
     */
    #[ORM\OneToMany(mappedBy: 'session', targetEntity: SuiviProg::class, orphanRemoval: true)]
    private Collection $suivis;

    /**
     * Constructeur de la session de jeu.
     * Initialise les collections de relations comme des ArrayCollection vides.
     */
    public function __construct()
    {
        $this->suivis = new ArrayCollection();
        $this->inventaireCodes = new ArrayCollection();
    }

    /**
     * Récupère la collection des suivis de progression.
     *
     * @return Collection<int, SuiviProg> Collection des suivis
     */
    public function getSuivis(): Collection
    {
        return $this->suivis;
    }

    /**
     * Identifiant unique de la session.
     * Généré automatiquement par la base de données.
     *
     * @var int|null
     */
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * Code PIN à 6 chiffres pour rejoindre la session.
     * Doit être unique parmi toutes les sessions actives.
     * Longueur maximale : 10 caractères.
     *
     * @var string|null
     */
    #[ORM\Column(length: 10)]
    private ?string $codePin = null;

    /**
     * Indique si la session est actuellement active.
     * Une session inactive ne peut plus être rejointe ou jouée.
     *
     * @var bool|null
     */
    #[ORM\Column]
    private ?bool $estActive = null;

    /**
     * Date et heure de création de la session par l'administrateur.
     * Définie automatiquement lors de la création de la session.
     *
     * @var \DateTimeImmutable|null
     */
    #[ORM\Column]
    private ?\DateTimeImmutable $dateCreation = null;

    /**
     * Score total accumulé par le joueur durant la session.
     * Calculé comme la somme des scores de tous les mini-jeux terminés.
     * Initialisé à 0.
     *
     * @var int
     */
    #[ORM\Column]
    private int $score = 0;

    /**
     * Code secret à découvrir pour gagner le jeu.
     * Composé de 12 caractères (lettres et chiffres), divisé en 3 fragments.
     * Les fragments sont débloqués en réussissant les mini-jeux.
     * Nullable pour rétrocompatibilité.
     *
     * @var string|null
     */
    #[ORM\Column(length: 12, nullable: true)]
    private ?string $codeSecret = null;

    /**
     * Date et heure de début de la partie pour le joueur.
     * Définie lorsque le joueur rejoint la session.
     * Nullable car peut être initialisée plus tard.
     *
     * @var \DateTimeImmutable|null
     */
    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $dateDebut = null;

    /**
     * Date et heure de fin de la partie.
     * Définie lorsque la session se termine (temps écoulé ou défaite).
     * Nullable car la session peut être en cours.
     *
     * @var \DateTimeImmutable|null
     */
    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $dateFin = null;

    /**
     * Administrateur qui a créé cette session.
     * Relation many-to-one : un admin peut créer plusieurs sessions.
     * La relation est requise (nullable: false).
     *
     * @var AdminJeu|null
     */
    #[ORM\ManyToOne(inversedBy: 'sessionJeus')]
    #[ORM\JoinColumn(nullable: false)]
    private ?AdminJeu $admin = null;

    /**
     * Joueur qui participe à cette session.
     * Relation many-to-one : un joueur peut avoir plusieurs sessions.
     * La relation est optionnelle (nullable: true) car la session peut
     * exister avant qu'un joueur ne la rejoigne.
     *
     * @var Joueur|null
     */
    #[ORM\ManyToOne(inversedBy: 'sessionJeus')]
    #[ORM\JoinColumn(nullable: true)]
    private ?Joueur $joueur = null;

    /**
     * Collection des inventaires de codes pour cette session.
     * Chaque inventaire représente un fragment du code secret.
     *
     * @var Collection<int, InventaireCode>
     */
    #[ORM\OneToMany(targetEntity: InventaireCode::class, mappedBy: 'session', orphanRemoval: true)]
    private Collection $inventaireCodes;

    /**
     * Récupère l'identifiant unique de la session.
     *
     * @return int|null L'ID de la session ou null si non persistée
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Récupère le code PIN de la session.
     *
     * @return string|null Le code PIN à 6 chiffres
     */
    public function getCodePin(): ?string
    {
        return $this->codePin;
    }

    /**
     * Définit le code PIN de la session.
     *
     * @param string $codePin Le nouveau code PIN
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setCodePin(string $codePin): static
    {
        $this->codePin = $codePin;

        return $this;
    }

    /**
     * Vérifie si la session est active.
     *
     * @return bool|null true si la session est active, false sinon
     */
    public function isEstActive(): ?bool
    {
        return $this->estActive;
    }

    /**
     * Définit le statut actif de la session.
     *
     * @param bool $estActive true pour activer la session, false pour la désactiver
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setEstActive(bool $estActive): static
    {
        $this->estActive = $estActive;

        return $this;
    }

    /**
     * Récupère la date de création de la session.
     *
     * @return \DateTimeImmutable|null La date de création
     */
    public function getDateCreation(): ?\DateTimeImmutable
    {
        return $this->dateCreation;
    }

    /**
     * Définit la date de création de la session.
     *
     * @param \DateTimeImmutable $dateCreation La nouvelle date de création
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setDateCreation(\DateTimeImmutable $dateCreation): static
    {
        $this->dateCreation = $dateCreation;

        return $this;
    }

    /**
     * Récupère le score total de la session.
     *
     * @return int Le score accumulé
     */
    public function getScore(): int
    {
        return $this->score;
    }

    /**
     * Définit le score total de la session.
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
     * Récupère l'administrateur propriétaire de la session.
     *
     * @return AdminJeu|null L'administrateur ou null
     */
    public function getAdmin(): ?AdminJeu
    {
        return $this->admin;
    }

    /**
     * Définit l'administrateur propriétaire de la session.
     *
     * @param AdminJeu|null $admin Le nouvel administrateur
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setAdmin(?AdminJeu $admin): static
    {
        $this->admin = $admin;

        return $this;
    }

    /**
     * Récupère le joueur participant à la session.
     *
     * @return Joueur|null Le joueur ou null si aucun joueur n'a rejoint
     */
    public function getJoueur(): ?Joueur
    {
        return $this->joueur;
    }

    /**
     * Définit le joueur participant à la session.
     *
     * @param Joueur|null $joueur Le nouveau joueur
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setJoueur(?Joueur $joueur): static
    {
        $this->joueur = $joueur;

        return $this;
    }

    /**
     * Récupère le code secret de la session.
     *
     * @return string|null Le code secret à 12 caractères
     */
    public function getCodeSecret(): ?string
    {
        return $this->codeSecret;
    }

    /**
     * Définit le code secret de la session.
     *
     * @param string|null $codeSecret Le nouveau code secret
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setCodeSecret(?string $codeSecret): static
    {
        $this->codeSecret = $codeSecret;
        return $this;
    }

    /**
     * Récupère la date de début de la partie.
     *
     * @return \DateTimeImmutable|null La date de début
     */
    public function getDateDebut(): ?\DateTimeImmutable
    {
        return $this->dateDebut;
    }

    /**
     * Définit la date de début de la partie.
     *
     * @param \DateTimeImmutable|null $dateDebut La nouvelle date de début
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setDateDebut(?\DateTimeImmutable $dateDebut): static
    {
        $this->dateDebut = $dateDebut;
        return $this;
    }

    /**
     * Récupère la date de fin de la partie.
     *
     * @return \DateTimeImmutable|null La date de fin
     */
    public function getDateFin(): ?\DateTimeImmutable
    {
        return $this->dateFin;
    }

    /**
     * Définit la date de fin de la partie.
     *
     * @param \DateTimeImmutable|null $dateFin La nouvelle date de fin
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setDateFin(?\DateTimeImmutable $dateFin): static
    {
        $this->dateFin = $dateFin;
        return $this;
    }

    /**
     * Ajoute un suivi de progression à la session.
     * Établit également la relation inverse (côté owning).
     *
     * @param SuiviProg $suivi Le suivi à ajouter
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function addSuivi(SuiviProg $suivi): static
    {
        if (!$this->suivis->contains($suivi)) {
            $this->suivis->add($suivi);
            $suivi->setSession($this);
        }

        return $this;
    }

    /**
     * Supprime un suivi de progression de la session.
     * Réinitialise la relation inverse si nécessaire.
     *
     * @param SuiviProg $suivi Le suivi à supprimer
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function removeSuivi(SuiviProg $suivi): static
    {
        if ($this->suivis->removeElement($suivi)) {
            if ($suivi->getSession() === $this) {
                $suivi->setSession(null);
            }
        }

        return $this;
    }

    /**
     * Récupère la collection des inventaires de codes.
     *
     * @return Collection<int, InventaireCode> Collection des inventaires
     */
    public function getInventaireCodes(): Collection
    {
        return $this->inventaireCodes;
    }

    /**
     * Ajoute un inventaire de code à la session.
     * Établit également la relation inverse (côté owning).
     *
     * @param InventaireCode $inventaireCode L'inventaire à ajouter
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function addInventaireCode(InventaireCode $inventaireCode): static
    {
        if (!$this->inventaireCodes->contains($inventaireCode)) {
            $this->inventaireCodes->add($inventaireCode);
            $inventaireCode->setSession($this);
        }

        return $this;
    }

    /**
     * Supprime un inventaire de code de la session.
     * Réinitialise la relation inverse si nécessaire.
     *
     * @param InventaireCode $inventaireCode L'inventaire à supprimer
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function removeInventaireCode(InventaireCode $inventaireCode): static
    {
        if ($this->inventaireCodes->removeElement($inventaireCode)) {
            // set the owning side to null (unless already changed)
            if ($inventaireCode->getSession() === $this) {
                $inventaireCode->setSession(null);
            }
        }

        return $this;
    }
}
