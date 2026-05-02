<?php

namespace App\Entity;

use App\Repository\CodeJeuRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Représente un fragment du code secret à découvrir.
 * Le code secret complet est divisé en plusieurs fragments (généralement 3).
 * Chaque fragment a un ordre et est associé à un mini-jeu spécifique.
 *
 * @see InventaireCode Les inventaires qui lient ce fragment aux sessions
 */
#[ORM\Entity(repositoryClass: CodeJeuRepository::class)]
class CodeJeu
{
    /**
     * Identifiant unique du fragment de code.
     * Généré automatiquement par la base de données.
     *
     * @var int|null
     */
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * Le fragment de code (portion du code secret).
     * Composé de 4 caractères (lettres ou chiffres).
     * Longueur maximale : 12 caractères.
     *
     * @var string|null
     */
    #[ORM\Column(length: 12)]
    private ?string $fragment = null;

    /**
     * Ordre du fragment dans le code secret complet.
     * Permet de reconstituer le code dans le bon ordre (1, 2, 3...).
     *
     * @var int|null
     */
    #[ORM\Column]
    private ?int $ordre = null;

    /**
     * Collection des inventaires associés à ce fragment.
     * Relation one-to-many : un fragment peut appartenir à plusieurs sessions.
     *
     * @var Collection<int, InventaireCode>
     */
    #[ORM\OneToMany(targetEntity: InventaireCode::class, mappedBy: 'code')]
    private Collection $inventaireCodes;

    /**
     * Constructeur du fragment de code.
     * Initialise la collection des inventaires comme un ArrayCollection vide.
     */
    public function __construct()
    {
        $this->inventaireCodes = new ArrayCollection();
    }

    /**
     * Récupère l'identifiant unique du fragment.
     *
     * @return int|null L'ID du fragment ou null si non persisté
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Récupère le fragment de code.
     *
     * @return string|null Le fragment (4 caractères)
     */
    public function getFragment(): ?string
    {
        return $this->fragment;
    }

    /**
     * Définit le fragment de code.
     *
     * @param string $fragment Le nouveau fragment
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setFragment(string $fragment): static
    {
        $this->fragment = $fragment;

        return $this;
    }

    /**
     * Récupère l'ordre du fragment dans le code secret.
     *
     * @return int|null L'ordre (1, 2 ou 3)
     */
    public function getOrdre(): ?int
    {
        return $this->ordre;
    }

    /**
     * Définit l'ordre du fragment dans le code secret.
     *
     * @param int $ordre Le nouvel ordre
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setOrdre(int $ordre): static
    {
        $this->ordre = $ordre;

        return $this;
    }

    /**
     * Récupère la collection des inventaires contenant ce fragment.
     *
     * @return Collection<int, InventaireCode> Collection des inventaires
     */
    public function getInventaireCodes(): Collection
    {
        return $this->inventaireCodes;
    }

    /**
     * Ajoute un inventaire à la collection.
     * Établit également la relation inverse (côté owning).
     *
     * @param InventaireCode $inventaireCode L'inventaire à ajouter
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function addInventaireCode(InventaireCode $inventaireCode): static
    {
        if (!$this->inventaireCodes->contains($inventaireCode)) {
            $this->inventaireCodes->add($inventaireCode);
            $inventaireCode->setCode($this);
        }

        return $this;
    }

    /**
     * Supprime un inventaire de la collection.
     * Réinitialise la relation inverse si nécessaire.
     *
     * @param InventaireCode $inventaireCode L'inventaire à supprimer
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function removeInventaireCode(InventaireCode $inventaireCode): static
    {
        if ($this->inventaireCodes->removeElement($inventaireCode)) {
            // set the owning side to null (unless already changed)
            if ($inventaireCode->getCode() === $this) {
                $inventaireCode->setCode(null);
            }
        }

        return $this;
    }
}
