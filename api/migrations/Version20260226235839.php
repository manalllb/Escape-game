<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260226235839 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE session_jeu ADD score INT NOT NULL');
        $this->addSql('ALTER TABLE session_jeu ADD admin_id INT NOT NULL');
        $this->addSql('ALTER TABLE session_jeu ADD joueur_id INT NOT NULL');
        $this->addSql('ALTER TABLE session_jeu ADD CONSTRAINT FK_FF3D158F642B8210 FOREIGN KEY (admin_id) REFERENCES admin_jeu (id) NOT DEFERRABLE');
        $this->addSql('ALTER TABLE session_jeu ADD CONSTRAINT FK_FF3D158FA9E2D76C FOREIGN KEY (joueur_id) REFERENCES joueur (id) NOT DEFERRABLE');
        $this->addSql('CREATE INDEX IDX_FF3D158F642B8210 ON session_jeu (admin_id)');
        $this->addSql('CREATE INDEX IDX_FF3D158FA9E2D76C ON session_jeu (joueur_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE session_jeu DROP CONSTRAINT FK_FF3D158F642B8210');
        $this->addSql('ALTER TABLE session_jeu DROP CONSTRAINT FK_FF3D158FA9E2D76C');
        $this->addSql('DROP INDEX IDX_FF3D158F642B8210');
        $this->addSql('DROP INDEX IDX_FF3D158FA9E2D76C');
        $this->addSql('ALTER TABLE session_jeu DROP score');
        $this->addSql('ALTER TABLE session_jeu DROP admin_id');
        $this->addSql('ALTER TABLE session_jeu DROP joueur_id');
    }
}
