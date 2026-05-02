<?php

namespace App\Entity;

use App\Repository\InventaireCodeRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Représente un fragment de code secret collecté par une session.
 * Chaque inventaire lie un fragment de code (CodeJeu) à une session de jeu.
 * Le statut estValide indique si le fragment a été débloqué par le joueur.
 *
 * @see SessionJeu La session qui possède ce fragment
 * @see CodeJeu Le fragment de code associé
 */
#[ORM\Entity(repositoryClass: InventaireCodeRepository::class)]
class InventaireCode
{
    /**
     * Identifiant unique de l'inventaire de code.
     * Généré automatiquement par la base de données.
     *
     * @var int|null
     */
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * Indique si le fragment de code a été validé/débloqué.
     * Initialisé à false, passe à true lorsque le joueur réussit le mini-jeu associé.
     *
     * @var bool|null
     */
    #[ORM\Column]
    private ?bool $estValide = null;

    /**
     * Session de jeu associée à cet inventaire.
     * Relation many-to-one : une session a plusieurs fragments de code.
     * La relation est requise (nullable: false).
     *
     * @var SessionJeu|null
     */
    #[ORM\ManyToOne(inversedBy: 'inventaireCodes')]
    #[ORM\JoinColumn(nullable: false)]
    private ?SessionJeu $session = null;

    /**
     * Fragment de code associé à cet inventaire.
     * Relation many-to-one : un fragment peut appartenir à plusieurs sessions.
     * La relation est requise (nullable: false).
     *
     * @var CodeJeu|null
     */
    #[ORM\ManyToOne(inversedBy: 'inventaireCodes')]
    #[ORM\JoinColumn(nullable: false)]
    private ?CodeJeu $code = null;

    /**
     * Récupère l'identifiant unique de l'inventaire.
     *
     * @return int|null L'ID de l'inventaire ou null si non persisté
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Vérifie si le fragment de code est validé.
     *
     * @return bool|null true si le fragment est débloqué, false sinon
     */
    public function isEstValide(): ?bool
    {
        return $this->estValide;
    }

    /**
     * Définit l'état de validation du fragment de code.
     *
     * @param bool $estValide true pour valider le fragment
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setEstValide(bool $estValide): static
    {
        $this->estValide = $estValide;

        return $this;
    }

    /**
     * Récupère la session associée à cet inventaire.
     *
     * @return SessionJeu|null La session ou null
     */
    public function getSession(): ?SessionJeu
    {
        return $this->session;
    }

    /**
     * Définit la session associée à cet inventaire.
     *
     * @param SessionJeu|null $session La nouvelle session
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setSession(?SessionJeu $session): static
    {
        $this->session = $session;

        return $this;
    }

    /**
     * Récupère le fragment de code associé à cet inventaire.
     *
     * @return CodeJeu|null Le fragment de code ou null
     */
    public function getCode(): ?CodeJeu
    {
        return $this->code;
    }

    /**
     * Définit le fragment de code associé à cet inventaire.
     *
     * @param CodeJeu|null $code Le nouveau fragment de code
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setCode(?CodeJeu $code): static
    {
        $this->code = $code;

        return $this;
    }
}
