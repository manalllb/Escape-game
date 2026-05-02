<?php

namespace App\Repository;

use App\Entity\InventaireCode;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repository pour l'entité InventaireCode.
 *
 * Fournit des méthodes de recherche personnalisées pour les inventaires de codes.
 * Étend ServiceEntityRepository qui fournit les méthodes CRUD de base :
 * - find(), findAll(), findBy(), findOneBy()
 * - save(), remove()
 *
 * @extends ServiceEntityRepository<InventaireCode>
 */
class InventaireCodeRepository extends ServiceEntityRepository
{
    /**
     * Constructeur du repository.
     *
     * @param ManagerRegistry $registry Le registre de gestionnaire Doctrine injecté par le conteneur
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, InventaireCode::class);
    }

    //    /**
    //     * @return InventaireCode[] Returns an array of InventaireCode objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('i')
    //            ->andWhere('i.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('i.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?InventaireCode
    //    {
    //        return $this->createQueryBuilder('i')
    //            ->andWhere('i.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
