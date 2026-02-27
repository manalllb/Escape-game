<?php

namespace App\Entity;

use App\Repository\SessionJeuRepository;
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

    #[ORM\Column]
    private int $score = 0;

    #[ORM\ManyToOne(inversedBy: 'sessionJeus')]
    #[ORM\JoinColumn(nullable: false)]
    private ?AdminJeu $admin = null;

    #[ORM\ManyToOne(inversedBy: 'sessionJeus')]
    #[ORM\JoinColumn(nullable: true)]
    private ?Joueur $joueur = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCodePin(): ?string
    {
        return $this->codePin;
    }

    public function setCodePin(string $codePin): static
    {
        $this->codePin = $codePin;

        return $this;
    }

    public function isEstActive(): ?bool
    {
        return $this->estActive;
    }

    public function setEstActive(bool $estActive): static
    {
        $this->estActive = $estActive;

        return $this;
    }

    public function getDateCreation(): ?\DateTimeImmutable
    {
        return $this->dateCreation;
    }

    public function setDateCreation(\DateTimeImmutable $dateCreation): static
    {
        $this->dateCreation = $dateCreation;

        return $this;
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

    public function getAdmin(): ?AdminJeu
    {
        return $this->admin;
    }

    public function setAdmin(?AdminJeu $admin): static
    {
        $this->admin = $admin;

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
}
