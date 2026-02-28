<?php

namespace App\Entity;

use App\Repository\ContTriRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ContTriRepository::class)]
class ContTri
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $nomProduit = null;

    #[ORM\Column]
    private ?bool $estCosmetique = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?MiniJeu $miniJeu = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNomProduit(): ?string
    {
        return $this->nomProduit;
    }

    public function setNomProduit(string $nomProduit): static
    {
        $this->nomProduit = $nomProduit;

        return $this;
    }

    public function isEstCosmetique(): ?bool
    {
        return $this->estCosmetique;
    }

    public function setEstCosmetique(bool $estCosmetique): static
    {
        $this->estCosmetique = $estCosmetique;

        return $this;
    }

    public function getMiniJeu(): ?MiniJeu
    {
        return $this->miniJeu;
    }

    public function setMiniJeu(?MiniJeu $miniJeu): static
    {
        $this->miniJeu = $miniJeu;

        return $this;
    }
}
