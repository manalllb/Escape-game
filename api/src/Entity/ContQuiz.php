<?php

namespace App\Entity;

use App\Repository\ContQuizRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ContQuizRepository::class)]
class ContQuiz
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $question = null;

    #[ORM\Column(length: 255)]
    private ?string $bonneReponse = null;

    #[ORM\Column]
    private array $mauvaisesReponses = [];

    #[ORM\ManyToOne(inversedBy: 'contQuizzes')]
    #[ORM\JoinColumn(nullable: false)]
    private ?MiniJeu $miniJeu = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getQuestion(): ?string
    {
        return $this->question;
    }

    public function setQuestion(string $question): static
    {
        $this->question = $question;

        return $this;
    }

    public function getBonneReponse(): ?string
    {
        return $this->bonneReponse;
    }

    public function setBonneReponse(string $bonneReponse): static
    {
        $this->bonneReponse = $bonneReponse;

        return $this;
    }

    public function getMauvaisesReponses(): array
    {
        return $this->mauvaisesReponses;
    }

    public function setMauvaisesReponses(array $mauvaisesReponses): static
    {
        $this->mauvaisesReponses = $mauvaisesReponses;

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
