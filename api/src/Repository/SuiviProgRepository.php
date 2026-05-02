<?php

namespace App\Repository;

use App\Entity\SuiviProg;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repository pour l'entité SuiviProg.
 *
 * Fournit des méthodes de recherche personnalisées pour les suivis de progression.
 * Étend ServiceEntityRepository qui fournit les méthodes CRUD de base :
 * - find(), findAll(), findBy(), findOneBy()
 * - save(), remove()
 *
 * @extends ServiceEntityRepository<SuiviProg>
 */
class SuiviProgRepository extends ServiceEntityRepository
{
    /**
     * Constructeur du repository.
     *
     * @param ManagerRegistry $registry Le registre de gestionnaire Doctrine injecté par le conteneur
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, SuiviProg::class);
    }

    //    /**
    //     * @return SuiviProg[] Returns an array of SuiviProg objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('s')
    //            ->andWhere('s.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('s.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?SuiviProg
    //    {
    //        return $this->createQueryBuilder('s')
    //            ->andWhere('s.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
