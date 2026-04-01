<?php

namespace App\Entity;

use App\Repository\CodeJeuRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CodeJeuRepository::class)]
class CodeJeu
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 12)]
    private ?string $fragment = null;

    #[ORM\Column]
    private ?int $ordre = null;

    /**
     * @var Collection<int, InventaireCode>
     */
    #[ORM\OneToMany(targetEntity: InventaireCode::class, mappedBy: 'code')]
    private Collection $inventaireCodes;

    public function __construct()
    {
        $this->inventaireCodes = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFragment(): ?string
    {
        return $this->fragment;
    }

    public function setFragment(string $fragment): static
    {
        $this->fragment = $fragment;

        return $this;
    }

    public function getOrdre(): ?int
    {
        return $this->ordre;
    }

    public function setOrdre(int $ordre): static
    {
        $this->ordre = $ordre;

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
            $inventaireCode->setCode($this);
        }

        return $this;
    }

    public function removeInventaireCode(InventaireCode $inventaireCode): static
    {
        if ($this->inventaireCodes->removeElement($inventaireCode)) {
            // set the owning side to null (unless already changed)
            if ($inventaireCode->getCode() === $this) {
                $inventaireCode->setCode(null);
            }
        }

        return $this;
    }
}
