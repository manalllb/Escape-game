<?php

namespace App\Entity;

use App\Repository\JoueurRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: JoueurRepository::class)]
class Joueur
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $pseudo = null;


    /**
     * @var Collection<int, SessionJeu>
     */
    #[ORM\OneToMany(targetEntity: SessionJeu::class, mappedBy: 'joueur')]
    private Collection $sessionJeus;

    public function __construct()
    {
        $this->sessionJeus = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPseudo(): ?string
    {
        return $this->pseudo;
    }

    public function setPseudo(string $pseudo): static
    {
        $this->pseudo = $pseudo;

        return $this;
    }


    /**
     * @return Collection<int, SessionJeu>
     */
    public function getSessionJeus(): Collection
    {
        return $this->sessionJeus;
    }

    public function addSessionJeu(SessionJeu $sessionJeu): static
    {
        if (!$this->sessionJeus->contains($sessionJeu)) {
            $this->sessionJeus->add($sessionJeu);
            $sessionJeu->setJoueur($this);
        }

        return $this;
    }

    public function removeSessionJeu(SessionJeu $sessionJeu): static
    {
        if ($this->sessionJeus->removeElement($sessionJeu)) {
            // set the owning side to null (unless already changed)
            if ($sessionJeu->getJoueur() === $this) {
                $sessionJeu->setJoueur(null);
            }
        }

        return $this;
    }

}
