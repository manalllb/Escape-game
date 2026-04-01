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
    private ?bool $estValide = null;

    #[ORM\ManyToOne(inversedBy: 'inventaireCodes')]
    #[ORM\JoinColumn(nullable: false)]
    private ?SessionJeu $session = null;

    #[ORM\ManyToOne(inversedBy: 'inventaireCodes')]
    #[ORM\JoinColumn(nullable: false)]
    private ?CodeJeu $code = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function isEstValide(): ?bool
    {
        return $this->estValide;
    }

    public function setEstValide(bool $estValide): static
    {
        $this->estValide = $estValide;

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

    public function getCode(): ?CodeJeu
    {
        return $this->code;
    }

    public function setCode(?CodeJeu $code): static
    {
        $this->code = $code;

        return $this;
    }
}
