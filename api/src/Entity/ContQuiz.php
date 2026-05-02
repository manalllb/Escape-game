<?php

namespace App\Entity;

use App\Repository\ContQuizRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * Représente une question de type quiz dans un mini-jeu.
 * Chaque question possède un énoncé, une bonne réponse et plusieurs mauvaises réponses.
 * Les questions sont associées à un mini-jeu de type "quiz".
 *
 * @see MiniJeu Le mini-jeu auquel appartient cette question
 */
#[ORM\Entity(repositoryClass: ContQuizRepository::class)]
class ContQuiz
{
    /**
     * Identifiant unique de la question.
     * Généré automatiquement par la base de données.
     *
     * @var int|null
     */
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * Énoncé de la question posée au joueur.
     * Stocké en tant que texte pour permettre des questions longues.
     *
     * @var string|null
     */
    #[ORM\Column(type: Types::TEXT)]
    private ?string $question = null;

    /**
     * La bonne réponse attendue pour cette question.
     * Longueur maximale : 255 caractères.
     *
     * @var string|null
     */
    #[ORM\Column(length: 255)]
    private ?string $bonneReponse = null;

    /**
     * Liste des mauvaises réponses proposées au joueur.
     * Stocké en tant que tableau JSON dans la base de données.
     *
     * @var array Liste de chaînes de caractères représentant les mauvaises réponses
     */
    #[ORM\Column]
    private array $mauvaisesReponses = [];

    /**
     * Mini-jeu auquel appartient cette question.
     * Relation many-to-one : un mini-jeu peut avoir plusieurs questions.
     * La relation est requise (nullable: false).
     *
     * @var MiniJeu|null
     */
    #[ORM\ManyToOne(inversedBy: 'contQuizzes')]
    #[ORM\JoinColumn(nullable: false)]
    private ?MiniJeu $miniJeu = null;

    /**
     * Récupère l'identifiant unique de la question.
     *
     * @return int|null L'ID de la question ou null si non persistée
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Récupère l'énoncé de la question.
     *
     * @return string|null L'énoncé de la question
     */
    public function getQuestion(): ?string
    {
        return $this->question;
    }

    /**
     * Définit l'énoncé de la question.
     *
     * @param string $question Le nouvel énoncé
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setQuestion(string $question): static
    {
        $this->question = $question;

        return $this;
    }

    /**
     * Récupère la bonne réponse attendue.
     *
     * @return string|null La bonne réponse
     */
    public function getBonneReponse(): ?string
    {
        return $this->bonneReponse;
    }

    /**
     * Définit la bonne réponse attendue.
     *
     * @param string $bonneReponse La nouvelle bonne réponse
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setBonneReponse(string $bonneReponse): static
    {
        $this->bonneReponse = $bonneReponse;

        return $this;
    }

    /**
     * Récupère la liste des mauvaises réponses.
     *
     * @return array Liste des mauvaises réponses possibles
     */
    public function getMauvaisesReponses(): array
    {
        return $this->mauvaisesReponses;
    }

    /**
     * Définit la liste des mauvaises réponses.
     *
     * @param array $mauvaisesReponses La nouvelle liste de mauvaises réponses
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setMauvaisesReponses(array $mauvaisesReponses): static
    {
        $this->mauvaisesReponses = $mauvaisesReponses;

        return $this;
    }

    /**
     * Récupère le mini-jeu associé à cette question.
     *
     * @return MiniJeu|null Le mini-jeu parent ou null
     */
    public function getMiniJeu(): ?MiniJeu
    {
        return $this->miniJeu;
    }

    /**
     * Définit le mini-jeu associé à cette question.
     *
     * @param MiniJeu|null $miniJeu Le nouveau mini-jeu parent
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setMiniJeu(?MiniJeu $miniJeu): static
    {
        $this->miniJeu = $miniJeu;

        return $this;
    }
}
