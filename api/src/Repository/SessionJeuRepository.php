<?php

namespace App\Repository;

use App\Entity\SessionJeu;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repository pour l'entité SessionJeu.
 *
 * Fournit des méthodes de recherche personnalisées pour les sessions de jeu.
 * Étend ServiceEntityRepository qui fournit les méthodes CRUD de base :
 * - find(), findAll(), findBy(), findOneBy()
 * - save(), remove()
 *
 * @extends ServiceEntityRepository<SessionJeu>
 */
class SessionJeuRepository extends ServiceEntityRepository
{
    /**
     * Constructeur du repository.
     *
     * @param ManagerRegistry $registry Le registre de gestionnaire Doctrine injecté par le conteneur
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, SessionJeu::class);
    }

    //    /**
    //     * @return SessionJeu[] Returns an array of SessionJeu objects
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

    //    public function findOneBySomeField($value): ?SessionJeu
    //    {
    //        return $this->createQueryBuilder('s')
    //            ->andWhere('s.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
