<?php

namespace App\Entity;

use App\Repository\SessionJeuRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SessionJeuRepository::class)]
class SessionJeu
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 10)]
    private ?string $codePin = null;

    #[ORM\Column]
    private ?bool $estActive = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $dateCreation = null;

    #[ORM\Column(length: 12, nullable: true)]
    private ?string $codeSecret = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $dateDebut = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $dateFin = null;

    #[ORM\ManyToOne(inversedBy: 'sessionJeus')]
    #[ORM\JoinColumn(nullable: false)]
    private ?AdminJeu $admin = null;

    /** @var Collection<int, SessionJoueur> */
    #[ORM\OneToMany(mappedBy: 'session', targetEntity: SessionJoueur::class, orphanRemoval: true)]
    private Collection $sessionJoueurs;

    public function __construct()
    {
        $this->sessionJoueurs = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getCodePin(): ?string { return $this->codePin; }
    public function setCodePin(string $codePin): static { $this->codePin = $codePin; return $this; }
    public function isEstActive(): ?bool { return $this->estActive; }
    public function setEstActive(bool $estActive): static { $this->estActive = $estActive; return $this; }
    public function getDateCreation(): ?\DateTimeImmutable { return $this->dateCreation; }
    public function setDateCreation(\DateTimeImmutable $dateCreation): static { $this->dateCreation = $dateCreation; return $this; }
    public function getCodeSecret(): ?string { return $this->codeSecret; }
    public function setCodeSecret(?string $codeSecret): static { $this->codeSecret = $codeSecret; return $this; }
    public function getDateDebut(): ?\DateTimeImmutable { return $this->dateDebut; }
    public function setDateDebut(?\DateTimeImmutable $dateDebut): static { $this->dateDebut = $dateDebut; return $this; }
    public function getDateFin(): ?\DateTimeImmutable { return $this->dateFin; }
    public function setDateFin(?\DateTimeImmutable $dateFin): static { $this->dateFin = $dateFin; return $this; }
    public function getAdmin(): ?AdminJeu { return $this->admin; }
    public function setAdmin(?AdminJeu $admin): static { $this->admin = $admin; return $this; }

    /** @return Collection<int, SessionJoueur> */
    public function getSessionJoueurs(): Collection { return $this->sessionJoueurs; }
}

