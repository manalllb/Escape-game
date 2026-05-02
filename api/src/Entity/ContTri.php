<?php

namespace App\Entity;

use App\Repository\ContTriRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Représente un produit à trier dans un mini-jeu de type "tri".
 * Chaque produit doit être classé comme cosmétique ou non cosmétique.
 * Le joueur doit identifier la bonne catégorie pour chaque produit.
 *
 * @see MiniJeu Le mini-jeu auquel appartient ce produit
 */
#[ORM\Entity(repositoryClass: ContTriRepository::class)]
class ContTri
{
    /**
     * Identifiant unique du produit à trier.
     * Généré automatiquement par la base de données.
     *
     * @var int|null
     */
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * Nom du produit à trier (ex: "Dentifrice", "Shampoing purifiant").
     * Longueur maximale : 100 caractères.
     *
     * @var string|null
     */
    #[ORM\Column(length: 100)]
    private ?string $nomProduit = null;

    /**
     * Indique si le produit est un produit cosmétique.
     * true = cosmétique, false = non cosmétique (médicament, complément, etc.).
     *
     * @var bool|null
     */
    #[ORM\Column]
    private ?bool $estCosmetique = null;

    /**
     * Mini-jeu auquel appartient ce produit.
     * Relation many-to-one : un mini-jeu peut avoir plusieurs produits à trier.
     * La relation est requise (nullable: false).
     *
     * @var MiniJeu|null
     */
    #[ORM\ManyToOne(inversedBy: 'contTris')]
    #[ORM\JoinColumn(nullable: false)]
    private ?MiniJeu $miniJeu = null;

    /**
     * Récupère l'identifiant unique du produit.
     *
     * @return int|null L'ID du produit ou null si non persisté
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Récupère le nom du produit.
     *
     * @return string|null Le nom du produit
     */
    public function getNomProduit(): ?string
    {
        return $this->nomProduit;
    }

    /**
     * Définit le nom du produit.
     *
     * @param string $nomProduit Le nouveau nom du produit
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setNomProduit(string $nomProduit): static
    {
        $this->nomProduit = $nomProduit;

        return $this;
    }

    /**
     * Vérifie si le produit est cosmétique.
     *
     * @return bool|null true si le produit est cosmétique, false sinon
     */
    public function isEstCosmetique(): ?bool
    {
        return $this->estCosmetique;
    }

    /**
     * Définit si le produit est cosmétique.
     *
     * @param bool $estCosmetique true pour cosmétique, false pour non cosmétique
     * @return static Retourne l'instance courante pour le chaînage
     */
    public function setEstCosmetique(bool $estCosmetique): static
    {
        $this->estCosmetique = $estCosmetique;

        return $this;
    }

    /**
     * Récupère le mini-jeu associé à ce produit.
     *
     * @return MiniJeu|null Le mini-jeu parent ou null
     */
    public function getMiniJeu(): ?MiniJeu
    {
        return $this->miniJeu;
    }

    /**
     * Définit le mini-jeu associé à ce produit.
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
