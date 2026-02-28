<?php

namespace App\Entity;

use App\Repository\SuiviProgRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SuiviProgRepository::class)]
class SuiviProg
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?bool $termine = null;

    #[ORM\Column]
    private ?int $score = null;

    #[ORM\Column]
    private ?int $temps = null;

    #[ORM\Column]
    private ?int $nbCosmetiqueAtt = null;

    #[ORM\Column]
    private ?int $nbNonCosmetiqueAtt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?SessionJeu $session = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?MiniJeu $miniJeu = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function isTermine(): ?bool
    {
        return $this->termine;
    }

    public function setTermine(bool $termine): static
    {
        $this->termine = $termine;

        return $this;
    }

    public function getScore(): ?int
    {
        return $this->score;
    }

    public function setScore(int $score): static
    {
        $this->score = $score;

        return $this;
    }

    public function getTemps(): ?int
    {
        return $this->temps;
    }

    public function setTemps(int $temps): static
    {
        $this->temps = $temps;

        return $this;
    }

    public function getNbCosmetiqueAtt(): ?int
    {
        return $this->nbCosmetiqueAtt;
    }

    public function setNbCosmetiqueAtt(int $nbCosmetiqueAtt): static
    {
        $this->nbCosmetiqueAtt = $nbCosmetiqueAtt;

        return $this;
    }

    public function getNbNonCosmetiqueAtt(): ?int
    {
        return $this->nbNonCosmetiqueAtt;
    }

    public function setNbNonCosmetiqueAtt(int $nbNonCosmetiqueAtt): static
    {
        $this->nbNonCosmetiqueAtt = $nbNonCosmetiqueAtt;

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
