<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260328150927 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE session_jeu ADD code_secret VARCHAR(12) DEFAULT NULL');
        $this->addSql('ALTER TABLE session_jeu ADD date_debut TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE session_jeu ADD date_fin TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE session_jeu DROP code_secret');
        $this->addSql('ALTER TABLE session_jeu DROP date_debut');
        $this->addSql('ALTER TABLE session_jeu DROP date_fin');
    }
}
