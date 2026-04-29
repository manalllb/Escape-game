<?php

namespace App\Entity;

use App\Repository\InventaireCodeRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InventaireCodeRepository::class)]
class InventaireCode
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private bool $estValide = false;

    #[ORM\ManyToOne(inversedBy: 'inventaireCodes')]
    #[ORM\JoinColumn(nullable: false)]
    private ?SessionJoueur $sessionJoueur = null;

    #[ORM\ManyToOne(inversedBy: 'inventaireCodes')]
    #[ORM\JoinColumn(nullable: false)]
    private ?CodeJeu $code = null;

    public function getId(): ?int { return $this->id; }
    public function isEstValide(): bool { return $this->estValide; }
    public function setEstValide(bool $estValide): static { $this->estValide = $estValide; return $this; }
    public function getSessionJoueur(): ?SessionJoueur { return $this->sessionJoueur; }
    public function setSessionJoueur(?SessionJoueur $sessionJoueur): static { $this->sessionJoueur = $sessionJoueur; return $this; }
    public function getCode(): ?CodeJeu { return $this->code; }
    public function setCode(?CodeJeu $code): static { $this->code = $code; return $this; }
}
