<?php

namespace App\Entity;

use App\Repository\MiniJeuRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MiniJeuRepository::class)]
class MiniJeu
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $nom = null;

    #[ORM\Column(length: 50)]
    private ?string $type = null;

    #[ORM\Column]
    private ?int $ordre = null;

    #[ORM\Column]
    private ?int $dureeMax = null;

    #[ORM\Column]
    private ?bool $actif = null;

    /**
     * @var Collection<int, ContQuiz>
     */
    #[ORM\OneToMany(targetEntity: ContQuiz::class, mappedBy: 'miniJeu')]
    private Collection $contQuizzes;

    public function __construct()
    {
        $this->contQuizzes = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getOrdre(): ?int
    {
        return $this->ordre;
    }

    public function setOrdre(int $ordre): static
    {
        $this->ordre = $ordre;

        return $this;
    }

    public function getDureeMax(): ?int
    {
        return $this->dureeMax;
    }

    public function setDureeMax(int $dureeMax): static
    {
        $this->dureeMax = $dureeMax;

        return $this;
    }

    public function isActif(): ?bool
    {
        return $this->actif;
    }

    public function setActif(bool $actif): static
    {
        $this->actif = $actif;

        return $this;
    }

    /**
     * @return Collection<int, ContQuiz>
     */
    public function getContQuizzes(): Collection
    {
        return $this->contQuizzes;
    }

    public function addContQuiz(ContQuiz $contQuiz): static
    {
        if (!$this->contQuizzes->contains($contQuiz)) {
            $this->contQuizzes->add($contQuiz);
            $contQuiz->setMiniJeu($this);
        }

        return $this;
    }

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
}
