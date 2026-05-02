<?php

namespace App\Entity;

use App\Repository\JoueurRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Représente un joueur participant aux sessions de jeu.
 * Le joueur est identifié par un pseudo unique et peut participer à plusieurs sessions.
 *
 * @see SessionJeu Les sessions auxquelles le joueur a participé
 */
#[ORM\Entity(repositoryClass: JoueurRepository::class)]
class Joueur
{
    /**
     * Identifiant unique du joueur.
     * Généré automatiquement par la base de données.
     *
     * @var int|null
     */
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * Pseudo du joueur, utilisé pour l'identifier dans le jeu.
     * Longueur maximale : 100 caractères.
     *
     * @var string|null
     */
    #[ORM\Column(length: 100)]
    private ?string $pseudo = null;


    /**
     * Collection des sessions auxquelles le joueur a participé.
     * Relation one-to-many : un joueur peut avoir plusieurs sessions.
     *
     * @var Collection<int, SessionJeu>
     */
    #[ORM\OneToMany(targetEntity: SessionJeu::class, mappedBy: 'joueur')]
    private Collection $sessionJeus;

    /**
     * Constructeur du joueur.
     * Initialise la collection des sessions comme un ArrayCollection vide.
     */
    public function __construct()
    {
        $this->sessionJeus = new ArrayCollection();
    }

    /**
     * Récupère l'identifiant unique du joueur.
     *
     * @return int|null L'ID du joueur ou null si non persisté
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Récupère le pseudo du joueur.
     *
     * @return string|null Le pseudo du joueur
     */
    public function getPseudo(): ?string
    {
        return $this->pseudo;
    }

    /**
     * Définit le pseudo du joueur.
     *
     * @param string $pseudo Le nouveau pseudo
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setPseudo(string $pseudo): static
    {
        $this->pseudo = $pseudo;

        return $this;
    }


    /**
     * Récupère la collection des sessions du joueur.
     *
     * @return Collection<int, SessionJeu> Collection des sessions
     */
    public function getSessionJeus(): Collection
    {
        return $this->sessionJeus;
    }

    /**
     * Ajoute une session à la collection des sessions du joueur.
     * Établit également la relation inverse (côté owning).
     *
     * @param SessionJeu $sessionJeu La session à ajouter
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function addSessionJeu(SessionJeu $sessionJeu): static
    {
        if (!$this->sessionJeus->contains($sessionJeu)) {
            $this->sessionJeus->add($sessionJeu);
            $sessionJeu->setJoueur($this);
        }

        return $this;
    }

    /**
     * Supprime une session de la collection des sessions du joueur.
     * Réinitialise la relation inverse si nécessaire.
     *
     * @param SessionJeu $sessionJeu La session à supprimer
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function removeSessionJeu(SessionJeu $sessionJeu): static
    {
        if ($this->sessionJeus->removeElement($sessionJeu)) {
            // set the owning side to null (unless already changed)
            if ($sessionJeu->getJoueur() === $this) {
                $sessionJeu->setJoueur(null);
            }
        }

        return $this;
    }

}
