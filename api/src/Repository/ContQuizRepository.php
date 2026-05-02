<?php

namespace App\Repository;

use App\Entity\ContQuiz;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repository pour l'entité ContQuiz.
 *
 * Fournit des méthodes de recherche personnalisées pour les questions de quiz.
 * Étend ServiceEntityRepository qui fournit les méthodes CRUD de base :
 * - find(), findAll(), findBy(), findOneBy()
 * - save(), remove()
 *
 * @extends ServiceEntityRepository<ContQuiz>
 */
class ContQuizRepository extends ServiceEntityRepository
{
    /**
     * Constructeur du repository.
     *
     * @param ManagerRegistry $registry Le registre de gestionnaire Doctrine injecté par le conteneur
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ContQuiz::class);
    }

    //    /**
    //     * @return ContQuiz[] Returns an array of ContQuiz objects
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

    //    public function findOneBySomeField($value): ?ContQuiz
    //    {
    //        return $this->createQueryBuilder('c')
    //            ->andWhere('c.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
