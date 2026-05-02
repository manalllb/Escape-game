<?php

namespace App\Repository;

use App\Entity\ContSeq;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repository pour l'entité ContSeq.
 *
 * Fournit des méthodes de recherche personnalisées pour les étapes de séquence.
 * Étend ServiceEntityRepository qui fournit les méthodes CRUD de base :
 * - find(), findAll(), findBy(), findOneBy()
 * - save(), remove()
 *
 * @extends ServiceEntityRepository<ContSeq>
 */
class ContSeqRepository extends ServiceEntityRepository
{
    /**
     * Constructeur du repository.
     *
     * @param ManagerRegistry $registry Le registre de gestionnaire Doctrine injecté par le conteneur
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ContSeq::class);
    }

    //    /**
    //     * @return ContSeq[] Returns an array of ContSeq objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('c')
    //            ->andWhere('c.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('c.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?ContSeq
    //    {
    //        return $this->createQueryBuilder('c')
    //            ->andWhere('c.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
