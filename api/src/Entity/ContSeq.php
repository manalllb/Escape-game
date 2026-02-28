<?php

namespace App\Entity;

use App\Repository\ContSeqRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ContSeqRepository::class)]
class ContSeq
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $libelle = null;

    #[ORM\Column]
    private ?int $ordreAttendu = null;

    #[ORM\Column(length: 50)]
    private ?string $zoneApp = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?MiniJeu $miniJeu = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLibelle(): ?string
    {
        return $this->libelle;
    }

    public function setLibelle(string $libelle): static
    {
        $this->libelle = $libelle;

        return $this;
    }

    public function getOrdreAttendu(): ?int
    {
        return $this->ordreAttendu;
    }

    public function setOrdreAttendu(int $ordreAttendu): static
    {
        $this->ordreAttendu = $ordreAttendu;

        return $this;
    }

    public function getZoneApp(): ?string
    {
        return $this->zoneApp;
    }

    public function setZoneApp(string $zoneApp): static
    {
        $this->zoneApp = $zoneApp;

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
