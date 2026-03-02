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
     * @var Collection<int, SuiviProg>
     */
    #[ORM\OneToMany(mappedBy: 'miniJeu', targetEntity: SuiviProg::class, orphanRemoval: true)]
    private Collection $suivis;

    /**
     * @var Collection<int, ContQuiz>
     */
    #[ORM\OneToMany(targetEntity: ContQuiz::class, mappedBy: 'miniJeu', orphanRemoval: true)]
    private Collection $contQuizzes;


    /**
     * @var Collection<int, ContSeq>
     */
    #[ORM\OneToMany(mappedBy: 'miniJeu', targetEntity: ContSeq::class, orphanRemoval: true)]
    private Collection $contSeqs;


    /**
     * @var Collection<int, ContTri>
     */
    #[ORM\OneToMany(mappedBy: 'miniJeu', targetEntity: ContTri::class, orphanRemoval: true)]
    private Collection $contTris;

    public function __construct()
    {
        $this->suivis = new ArrayCollection();
        $this->contQuizzes = new ArrayCollection();
        $this->contSeqs = new ArrayCollection();
        $this->contTris = new ArrayCollection();
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


     public function getSuivis(): Collection
    {
        return $this->suivis;
    }

    public function addSuivi(SuiviProg $suivi): static
    {
        if (!$this->suivis->contains($suivi)) {
            $this->suivis->add($suivi);
            $suivi->setMiniJeu($this);
        }
        return $this;
    }

    public function removeSuivi(SuiviProg $suivi): static
    {
        if ($this->suivis->removeElement($suivi)) {
            if ($suivi->getMiniJeu() === $this) {
                $suivi->setMiniJeu(null);
            }
        }
        return $this;
    }


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


    public function getContSeqs(): Collection
    {
        return $this->contSeqs;
    }

    public function addContSeq(ContSeq $contSeq): static
    {
        if (!$this->contSeqs->contains($contSeq)) {
            $this->contSeqs->add($contSeq);
            $contSeq->setMiniJeu($this);
        }
        return $this;
    }

    public function removeContSeq(ContSeq $contSeq): static
    {
        if ($this->contSeqs->removeElement($contSeq)) {
            if ($contSeq->getMiniJeu() === $this) {
                $contSeq->setMiniJeu(null);
            }
        }
        return $this;
    }

    public function getContTris(): Collection
    {
        return $this->contTris;
    }

    public function addContTri(ContTri $contTri): static
    {
        if (!$this->contTris->contains($contTri)) {
            $this->contTris->add($contTri);
            $contTri->setMiniJeu($this);
        }
        return $this;
    }

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



