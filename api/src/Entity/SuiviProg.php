<?php

namespace App\Entity;

use App\Repository\SuiviProgRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SuiviProgRepository::class)]
#[ORM\Table(name: 'suivi_prog')]
#[ORM\UniqueConstraint(name: 'uniq_session_minijeu', columns: ['session_id', 'mini_jeu_id'])]
class SuiviProg
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?bool $termine = false;

    #[ORM\Column]
    private ?int $score = 0;

    #[ORM\Column]
    private ?int $temps = 0;

    #[ORM\Column]
    private ?int $nbCosmetiqueAtt = 0;

    #[ORM\Column]
    private ?int $nbNonCosmetiqueAtt = 0;

    #[ORM\Column]
    private bool $aGagneCode = false;

    #[ORM\ManyToOne(inversedBy: 'suivis')]
    #[ORM\JoinColumn(nullable: false)]
    private ?SessionJeu $session = null;

    #[ORM\ManyToOne(inversedBy: 'suivis')]
    #[ORM\JoinColumn(nullable: false)]
    private ?MiniJeu $miniJeu = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function isTermine(): bool
    {
        return $this->termine;
    }

    public function setTermine(bool $termine): static
    {
        $this->termine = $termine;

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

    public function getTemps(): int
    {
        return $this->temps;
    }

    public function setTemps(int $temps): static
    {
        $this->temps = $temps;

        return $this;
    }

    public function getNbCosmetiqueAtt(): int
    {
        return $this->nbCosmetiqueAtt;
    }

    public function setNbCosmetiqueAtt(int $nbCosmetiqueAtt): static
    {
        $this->nbCosmetiqueAtt = $nbCosmetiqueAtt;

        return $this;
    }

    public function getNbNonCosmetiqueAtt(): int
    {
        return $this->nbNonCosmetiqueAtt;
    }

    public function setNbNonCosmetiqueAtt(int $nbNonCosmetiqueAtt): static
    {
        $this->nbNonCosmetiqueAtt = $nbNonCosmetiqueAtt;

        return $this;
    }

    public function isAGagneCode(): bool
    {
        return $this->aGagneCode;
    }

    public function setAGagneCode(bool $aGagneCode): static
    {
        $this->aGagneCode = $aGagneCode;

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