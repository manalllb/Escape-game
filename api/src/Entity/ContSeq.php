<?php

namespace App\Entity;

use App\Repository\ContSeqRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Représente une étape dans un mini-jeu de type séquence.
 * Chaque étape possède un libellé, un ordre attendu et une zone d'application.
 * Le joueur doit remettre les étapes dans le bon ordre pour réussir le mini-jeu.
 *
 * @see MiniJeu Le mini-jeu auquel appartient cette étape
 */
#[ORM\Entity(repositoryClass: ContSeqRepository::class)]
class ContSeq
{
    /**
     * Identifiant unique de l'étape de séquence.
     * Généré automatiquement par la base de données.
     *
     * @var int|null
     */
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * Libellé descriptif de l'étape (ex: "Nettoyage de la peau").
     * Longueur maximale : 100 caractères.
     *
     * @var string|null
     */
    #[ORM\Column(length: 100)]
    private ?string $libelle = null;

    /**
     * Ordre attendu pour cette étape dans la séquence.
     * Le joueur doit retrouver cet ordre pour valider le mini-jeu.
     *
     * @var int|null
     */
    #[ORM\Column]
    private ?int $ordreAttendu = null;

    /**
     * Zone d'application associée à l'étape (ex: "Visage", "Yeux", "Lèvres").
     * Utilisée pour afficher l'étape dans la bonne zone du corps.
     * Longueur maximale : 50 caractères.
     *
     * @var string|null
     */
    #[ORM\Column(length: 50)]
    private ?string $zoneApp = null;

    /**
     * Mini-jeu auquel appartient cette étape.
     * Relation many-to-one : un mini-jeu peut avoir plusieurs étapes.
     * La relation est requise (nullable: false).
     *
     * @var MiniJeu|null
     */
    #[ORM\ManyToOne(inversedBy: 'contSeqs')]
    #[ORM\JoinColumn(nullable: false)]
    private ?MiniJeu $miniJeu = null;

    /**
     * Récupère l'identifiant unique de l'étape.
     *
     * @return int|null L'ID de l'étape ou null si non persistée
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Récupère le libellé de l'étape.
     *
     * @return string|null Le libellé descriptif
     */
    public function getLibelle(): ?string
    {
        return $this->libelle;
    }

    /**
     * Définit le libellé de l'étape.
     *
     * @param string $libelle Le nouveau libellé
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setLibelle(string $libelle): static
    {
        $this->libelle = $libelle;

        return $this;
    }

    /**
     * Récupère l'ordre attendu pour cette étape.
     *
     * @return int|null L'ordre attendu (1 = premier, 2 = deuxième, etc.)
     */
    public function getOrdreAttendu(): ?int
    {
        return $this->ordreAttendu;
    }

    /**
     * Définit l'ordre attendu pour cette étape.
     *
     * @param int $ordreAttendu Le nouvel ordre attendu
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setOrdreAttendu(int $ordreAttendu): static
    {
        $this->ordreAttendu = $ordreAttendu;

        return $this;
    }

    /**
     * Récupère la zone d'application de l'étape.
     *
     * @return string|null La zone du corps associée
     */
    public function getZoneApp(): ?string
    {
        return $this->zoneApp;
    }

    /**
     * Définit la zone d'application de l'étape.
     *
     * @param string $zoneApp La nouvelle zone d'application
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setZoneApp(string $zoneApp): static
    {
        $this->zoneApp = $zoneApp;

        return $this;
    }

    /**
     * Récupère le mini-jeu associé à cette étape.
     *
     * @return MiniJeu|null Le mini-jeu parent ou null
     */
    public function getMiniJeu(): ?MiniJeu
    {
        return $this->miniJeu;
    }

    /**
     * Définit le mini-jeu associé à cette étape.
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
