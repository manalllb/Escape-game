<?php

namespace App\Entity;

use App\Repository\AdminJeuRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AdminJeuRepository::class)]
class AdminJeu
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    /**
     * @var Collection<int, SessionJeu>
     */
    #[ORM\OneToMany(targetEntity: SessionJeu::class, mappedBy: 'admin')]
    private Collection $sessionJeus;

    public function __construct()
    {
        $this->sessionJeus = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

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
            $sessionJeu->setAdmin($this);
        }

        return $this;
    }

    public function removeSessionJeu(SessionJeu $sessionJeu): static
    {
        if ($this->sessionJeus->removeElement($sessionJeu)) {
            // set the owning side to null (unless already changed)
            if ($sessionJeu->getAdmin() === $this) {
                $sessionJeu->setAdmin(null);
            }
        }

        return $this;
    }
}
