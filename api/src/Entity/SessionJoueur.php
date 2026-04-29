<?php

namespace App\Entity;

use App\Repository\SessionJoueurRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SessionJoueurRepository::class)]
class SessionJoueur
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private int $score = 0;

    #[ORM\Column]
    private int $tentativesCodeFinal = 0;

    #[ORM\Column]
    private bool $estGameOver = false;

    #[ORM\Column]
    private bool $aGagne = false;

    #[ORM\Column]
    private ?\DateTimeImmutable $dateConnexion = null;

    #[ORM\ManyToOne(inversedBy: 'sessionJoueurs')]
    #[ORM\JoinColumn(nullable: false)]
    private ?SessionJeu $session = null;

    #[ORM\ManyToOne(inversedBy: 'sessionJoueurs')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Joueur $joueur = null;

    /**
     * @var Collection<int, SuiviProg>
     */
    #[ORM\OneToMany(mappedBy: 'sessionJoueur', targetEntity: SuiviProg::class, orphanRemoval: true)]
    private Collection $suivis;

    /**
     * @var Collection<int, InventaireCode>
     */
    #[ORM\OneToMany(mappedBy: 'sessionJoueur', targetEntity: InventaireCode::class, orphanRemoval: true)]
    private Collection $inventaireCodes;

    public function __construct()
    {
        $this->suivis = new ArrayCollection();
        $this->inventaireCodes = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getScore(): int
    {
        return $this->score;
    }

    public function setScore(int $score): static
    {
        $this->score = $score;
        return $this;
    }

    public function getTentativesCodeFinal(): int
    {
        return $this->tentativesCodeFinal;
    }

    public function setTentativesCodeFinal(int $tentativesCodeFinal): static
    {
        $this->tentativesCodeFinal = $tentativesCodeFinal;
        return $this;
    }

    public function isEstGameOver(): bool
    {
        return $this->estGameOver;
    }

    public function setEstGameOver(bool $estGameOver): static
    {
        $this->estGameOver = $estGameOver;
        return $this;
    }

    public function isAGagne(): bool
    {
        return $this->aGagne;
    }

    public function setAGagne(bool $aGagne): static
    {
        $this->aGagne = $aGagne;
        return $this;
    }

    public function getDateConnexion(): ?\DateTimeImmutable
    {
        return $this->dateConnexion;
    }

    public function setDateConnexion(\DateTimeImmutable $dateConnexion): static
    {
        $this->dateConnexion = $dateConnexion;
        return $this;
    }

    public function getSession(): ?SessionJeu
    {
        return $this->session;
    }

    public function setSession(?SessionJeu $session): static
    {
        $this->session = $session;
        return $this;
    }

    public function getJoueur(): ?Joueur
    {
        return $this->joueur;
    }

    public function setJoueur(?Joueur $joueur): static
    {
        $this->joueur = $joueur;
        return $this;
    }

    /**
     * @return Collection<int, SuiviProg>
     */
    public function getSuivis(): Collection
    {
        return $this->suivis;
    }

    public function addSuivi(SuiviProg $suivi): static
    {
        if (!$this->suivis->contains($suivi)) {
            $this->suivis->add($suivi);
            $suivi->setSessionJoueur($this);
        }

        return $this;
    }

    public function removeSuivi(SuiviProg $suivi): static
    {
        if ($this->suivis->removeElement($suivi)) {
            if ($suivi->getSessionJoueur() === $this) {
                $suivi->setSessionJoueur(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, InventaireCode>
     */
    public function getInventaireCodes(): Collection
    {
        return $this->inventaireCodes;
    }

    public function addInventaireCode(InventaireCode $inventaireCode): static
    {
        if (!$this->inventaireCodes->contains($inventaireCode)) {
            $this->inventaireCodes->add($inventaireCode);
            $inventaireCode->setSessionJoueur($this);
        }

        return $this;
    }

    public function removeInventaireCode(InventaireCode $inventaireCode): static
    {
        if ($this->inventaireCodes->removeElement($inventaireCode)) {
            if ($inventaireCode->getSessionJoueur() === $this) {
                $inventaireCode->setSessionJoueur(null);
            }
        }

        return $this;
    }
}