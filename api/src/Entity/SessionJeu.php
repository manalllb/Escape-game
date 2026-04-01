<?php

namespace App\Entity;

use App\Repository\SessionJeuRepository;
use Doctrine\ORM\Mapping as ORM;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity(repositoryClass: SessionJeuRepository::class)]
class SessionJeu
{
#[ORM\OneToMany(mappedBy: 'session', targetEntity: SuiviProg::class, orphanRemoval: true)]
private Collection $suivis;

public function __construct()
{
    $this->suivis = new ArrayCollection();
    $this->inventaireCodes = new ArrayCollection();
}

public function getSuivis(): Collection
{
    return $this->suivis;
}

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 10)]
    private ?string $codePin = null;

    #[ORM\Column]
    private ?bool $estActive = null;

    // moment de creation de la session par l'admin
    #[ORM\Column]
    private ?\DateTimeImmutable $dateCreation = null;

    #[ORM\Column]
    private int $score = 0;

    //ADDED !!
    #[ORM\Column(length: 12, nullable: true)]
    private ?string $codeSecret = null;


// date debut partie par joueur !!!!
    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $dateDebut = null;


// date fin partie par joueur !!!!
    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $dateFin = null;

    #[ORM\ManyToOne(inversedBy: 'sessionJeus')]
    #[ORM\JoinColumn(nullable: false)]
    private ?AdminJeu $admin = null;

    #[ORM\ManyToOne(inversedBy: 'sessionJeus')]
    #[ORM\JoinColumn(nullable: true)]
    private ?Joueur $joueur = null;

    /**
     * @var Collection<int, InventaireCode>
     */
    #[ORM\OneToMany(targetEntity: InventaireCode::class, mappedBy: 'session', orphanRemoval: true)]
    private Collection $inventaireCodes;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCodePin(): ?string
    {
        return $this->codePin;
    }

    public function setCodePin(string $codePin): static
    {
        $this->codePin = $codePin;

        return $this;
    }

    public function isEstActive(): ?bool
    {
        return $this->estActive;
    }

    public function setEstActive(bool $estActive): static
    {
        $this->estActive = $estActive;

        return $this;
    }

    public function getDateCreation(): ?\DateTimeImmutable
    {
        return $this->dateCreation;
    }

    public function setDateCreation(\DateTimeImmutable $dateCreation): static
    {
        $this->dateCreation = $dateCreation;

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

    public function getAdmin(): ?AdminJeu
    {
        return $this->admin;
    }

    public function setAdmin(?AdminJeu $admin): static
    {
        $this->admin = $admin;

        return $this;
    }

    public function getJoueur(): ?Joueur
    {
        return $this->joueur;
    }

    public function setJoueur(?Joueur $joueur): static
    {
        $this->joueur = $joueur;

        return $this;
    }

        public function getCodeSecret(): ?string
{
    return $this->codeSecret;
}

public function setCodeSecret(?string $codeSecret): static
{
    $this->codeSecret = $codeSecret;
    return $this;
}

public function getDateDebut(): ?\DateTimeImmutable
{
    return $this->dateDebut;
}

public function setDateDebut(?\DateTimeImmutable $dateDebut): static
{
    $this->dateDebut = $dateDebut;
    return $this;
}

public function getDateFin(): ?\DateTimeImmutable
{
    return $this->dateFin;
}

public function setDateFin(?\DateTimeImmutable $dateFin): static
{
    $this->dateFin = $dateFin;
    return $this;
}

    public function addSuivi(SuiviProg $suivi): static
{
    if (!$this->suivis->contains($suivi)) {
        $this->suivis->add($suivi);
        $suivi->setSession($this);
    }

    return $this;
}

public function removeSuivi(SuiviProg $suivi): static
{
    if ($this->suivis->removeElement($suivi)) {
        if ($suivi->getSession() === $this) {
            $suivi->setSession(null);
        }
    }

    return $this;
}

/**
 * @return Collection<int, InventaireCode>
 */
public function getInventaireCodes(): Collection
{
    return $this->inventaireCodes;
}

public function addInventaireCode(InventaireCode $inventaireCode): static
{
    if (!$this->inventaireCodes->contains($inventaireCode)) {
        $this->inventaireCodes->add($inventaireCode);
        $inventaireCode->setSession($this);
    }

    return $this;
}

public function removeInventaireCode(InventaireCode $inventaireCode): static
{
    if ($this->inventaireCodes->removeElement($inventaireCode)) {
        // set the owning side to null (unless already changed)
        if ($inventaireCode->getSession() === $this) {
            $inventaireCode->setSession(null);
        }
    }

    return $this;
}
}
