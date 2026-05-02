<?php

namespace App\Entity;

use App\Repository\MiniJeuRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Représente un mini-jeu disponible dans la session de jeu.
 * Chaque mini-jeu possède un type (quiz, tri, sequence), un ordre de passage,
 * une durée maximale et un statut d'activation. Il est associé à plusieurs
 * contenus (questions, items à trier, étapes de séquence) et suit la progression
 * des joueurs via la relation avec SuiviProg.
 *
 * @see SuiviProg Pour le suivi de la progression des joueurs sur ce mini-jeu
 * @see ContQuiz Pour les questions de type quiz
 * @see ContTri Pour les items à trier
 * @see ContSeq Pour les étapes de séquence
 */
#[ORM\Entity(repositoryClass: MiniJeuRepository::class)]
class MiniJeu
{
    /**
     * Identifiant unique du mini-jeu.
     * Généré automatiquement par la base de données.
     *
     * @var int|null
     */
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * Nom affiché du mini-jeu (ex: "Le Tri Express", "L'Énigme Écologique").
     * Longueur maximale : 100 caractères.
     *
     * @var string|null
     */
    #[ORM\Column(length: 100)]
    private ?string $nom = null;

    /**
     * Type de mini-jeu : "quiz", "tri" ou "sequence".
     * Détermine le contenu associé (ContQuiz, ContTri, ContSeq) et la logique de jeu.
     * Longueur maximale : 50 caractères.
     *
     * @var string|null
     */
    #[ORM\Column(length: 50)]
    private ?string $type = null;

    /**
     * Ordre de passage du mini-jeu dans la session.
     * Permet de définir la séquence de jeu pour les joueurs.
     *
     * @var int|null
     */
    #[ORM\Column]
    private ?int $ordre = null;

    /**
     * Durée maximale allouée pour ce mini-jeu, en secondes.
     * Par exemple, 900 secondes = 15 minutes.
     *
     * @var int|null
     */
    #[ORM\Column]
    private ?int $dureeMax = null;

    /**
     * Indique si le mini-jeu est actuellement actif et disponible pour les joueurs.
     * Par défaut à true lors de la création.
     *
     * @var bool
     */
    #[ORM\Column]
    private bool $actif = true;

    /**
     * Collection des suivis de progression associés à ce mini-jeu.
     * Chaque suivi représente la progression d'un joueur sur ce mini-jeu.
     * Relation one-to-many : un mini-jeu peut avoir plusieurs suivis.
     *
     * @var Collection<int, SuiviProg>
     */
    #[ORM\OneToMany(mappedBy: 'miniJeu', targetEntity: SuiviProg::class, orphanRemoval: true)]
    private Collection $suivis;

    /**
     * Collection des questions de type quiz associées à ce mini-jeu.
     * Utilisé uniquement lorsque le type du mini-jeu est "quiz".
     * Relation one-to-many : un mini-jeu peut avoir plusieurs questions.
     *
     * @var Collection<int, ContQuiz>
     */
    #[ORM\OneToMany(targetEntity: ContQuiz::class, mappedBy: 'miniJeu', orphanRemoval: true)]
    private Collection $contQuizzes;


    /**
     * Collection des étapes de séquence associées à ce mini-jeu.
     * Utilisé uniquement lorsque le type du mini-jeu est "sequence".
     * Relation one-to-many : un mini-jeu peut avoir plusieurs étapes.
     *
     * @var Collection<int, ContSeq>
     */
    #[ORM\OneToMany(mappedBy: 'miniJeu', targetEntity: ContSeq::class, orphanRemoval: true)]
    private Collection $contSeqs;


    /**
     * Collection des items à trier associés à ce mini-jeu.
     * Utilisé uniquement lorsque le type du mini-jeu est "tri".
     * Relation one-to-many : un mini-jeu peut avoir plusieurs items.
     *
     * @var Collection<int, ContTri>
     */
    #[ORM\OneToMany(mappedBy: 'miniJeu', targetEntity: ContTri::class, orphanRemoval: true)]
    private Collection $contTris;

    /**
     * Constructeur du mini-jeu.
     * Initialise les collections de relations comme des ArrayCollection vides.
     */
    public function __construct()
    {
        $this->suivis = new ArrayCollection();
        $this->contQuizzes = new ArrayCollection();
        $this->contSeqs = new ArrayCollection();
        $this->contTris = new ArrayCollection();
    }

    /**
     * Récupère l'identifiant unique du mini-jeu.
     *
     * @return int|null L'ID du mini-jeu ou null si non persisté
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Récupère le nom du mini-jeu.
     *
     * @return string|null Le nom du mini-jeu
     */
    public function getNom(): ?string
    {
        return $this->nom;
    }

    /**
     * Définit le nom du mini-jeu.
     *
     * @param string $nom Le nouveau nom du mini-jeu
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    /**
     * Récupère le type du mini-jeu (quiz, tri, sequence).
     *
     * @return string|null Le type du mini-jeu
     */
    public function getType(): ?string
    {
        return $this->type;
    }

    /**
     * Définit le type du mini-jeu.
     * Les valeurs valides sont : "quiz", "tri", "sequence".
     *
     * @param string $type Le nouveau type du mini-jeu
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setType(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    /**
     * Récupère l'ordre de passage du mini-jeu.
     *
     * @return int|null L'ordre du mini-jeu
     */
    public function getOrdre(): ?int
    {
        return $this->ordre;
    }

    /**
     * Définit l'ordre de passage du mini-jeu.
     *
     * @param int $ordre Le nouvel ordre du mini-jeu
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setOrdre(int $ordre): static
    {
        $this->ordre = $ordre;

        return $this;
    }

    /**
     * Récupère la durée maximale allouée au mini-jeu (en secondes).
     *
     * @return int|null La durée maximale en secondes
     */
    public function getDureeMax(): ?int
    {
        return $this->dureeMax;
    }

    /**
     * Définit la durée maximale allouée au mini-jeu.
     *
     * @param int $dureeMax La nouvelle durée maximale en secondes
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setDureeMax(int $dureeMax): static
    {
        $this->dureeMax = $dureeMax;

        return $this;
    }

    /**
     * Vérifie si le mini-jeu est actif.
     *
     * @return bool true si le mini-jeu est actif, false sinon
     */
    public function isActif(): ?bool
    {
        return $this->actif;
    }

    /**
     * Définit le statut actif du mini-jeu.
     *
     * @param bool $actif true pour activer le mini-jeu, false pour le désactiver
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setActif(bool $actif): static
    {
        $this->actif = $actif;

        return $this;
    }

    /**
     * Récupère la collection des suivis de progression associés à ce mini-jeu.
     *
     * @return Collection<int, SuiviProg> Collection des suivis
     */
    public function getSuivis(): Collection
    {
        return $this->suivis;
    }

    /**
     * Ajoute un suivi de progression à ce mini-jeu.
     * Établit également la relation inverse (côté owning).
     *
     * @param SuiviProg $suivi Le suivi à ajouter
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function addSuivi(SuiviProg $suivi): static
    {
        if (!$this->suivis->contains($suivi)) {
            $this->suivis->add($suivi);
            $suivi->setMiniJeu($this);
        }
        return $this;
    }

    /**
     * Supprime un suivi de progression de ce mini-jeu.
     * Réinitialise la relation inverse si nécessaire.
     *
     * @param SuiviProg $suivi Le suivi à supprimer
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function removeSuivi(SuiviProg $suivi): static
    {
        if ($this->suivis->removeElement($suivi)) {
            if ($suivi->getMiniJeu() === $this) {
                $suivi->setMiniJeu(null);
            }
        }
        return $this;
    }

    /**
     * Récupère la collection des questions quiz associées à ce mini-jeu.
     *
     * @return Collection<int, ContQuiz> Collection des questions
     */
    public function getContQuizzes(): Collection
    {
        return $this->contQuizzes;
    }

    /**
     * Ajoute une question quiz à ce mini-jeu.
     * Établit également la relation inverse (côté owning).
     *
     * @param ContQuiz $contQuiz La question à ajouter
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function addContQuiz(ContQuiz $contQuiz): static
    {
        if (!$this->contQuizzes->contains($contQuiz)) {
            $this->contQuizzes->add($contQuiz);
            $contQuiz->setMiniJeu($this);
        }

        return $this;
    }

    /**
     * Supprime une question quiz de ce mini-jeu.
     * Réinitialise la relation inverse si nécessaire.
     *
     * @param ContQuiz $contQuiz La question à supprimer
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function removeContQuiz(ContQuiz $contQuiz): static
    {
        if ($this->contQuizzes->removeElement($contQuiz)) {
            // set the owning side to null (unless already changed)
            if ($contQuiz->getMiniJeu() === $this) {
                $contQuiz->setMiniJeu(null);
            }
        }

        return $this;
    }

    /**
     * Récupère la collection des étapes de séquence associées à ce mini-jeu.
     *
     * @return Collection<int, ContSeq> Collection des étapes
     */
    public function getContSeqs(): Collection
    {
        return $this->contSeqs;
    }

    /**
     * Ajoute une étape de séquence à ce mini-jeu.
     * Établit également la relation inverse (côté owning).
     *
     * @param ContSeq $contSeq L'étape à ajouter
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function addContSeq(ContSeq $contSeq): static
    {
        if (!$this->contSeqs->contains($contSeq)) {
            $this->contSeqs->add($contSeq);
            $contSeq->setMiniJeu($this);
        }
        return $this;
    }

    /**
     * Supprime une étape de séquence de ce mini-jeu.
     * Réinitialise la relation inverse si nécessaire.
     *
     * @param ContSeq $contSeq L'étape à supprimer
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function removeContSeq(ContSeq $contSeq): static
    {
        if ($this->contSeqs->removeElement($contSeq)) {
            if ($contSeq->getMiniJeu() === $this) {
                $contSeq->setMiniJeu(null);
            }
        }
        return $this;
    }

    /**
     * Récupère la collection des items à trier associés à ce mini-jeu.
     *
     * @return Collection<int, ContTri> Collection des items
     */
    public function getContTris(): Collection
    {
        return $this->contTris;
    }

    /**
     * Ajoute un item à trier à ce mini-jeu.
     * Établit également la relation inverse (côté owning).
     *
     * @param ContTri $contTri L'item à ajouter
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function addContTri(ContTri $contTri): static
    {
        if (!$this->contTris->contains($contTri)) {
            $this->contTris->add($contTri);
            $contTri->setMiniJeu($this);
        }
        return $this;
    }

    /**
     * Supprime un item à trier de ce mini-jeu.
     * Réinitialise la relation inverse si nécessaire.
     *
     * @param ContTri $contTri L'item à supprimer
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function removeContTri(ContTri $contTri): static
    {
        if ($this->contTris->removeElement($contTri)) {
            if ($contTri->getMiniJeu() === $this) {
                $contTri->setMiniJeu(null);
            }
        }
        return $this;
    }
}



