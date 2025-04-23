-- This code was auto-generated with `dotnet ef migrations script --idempotent -o init.sql` in the backend directory
-- When making a new migration, please regenerate this file
DROP PROCEDURE IF EXISTS `POMELO_BEFORE_DROP_PRIMARY_KEY`;
DELIMITER //
CREATE PROCEDURE `POMELO_BEFORE_DROP_PRIMARY_KEY`(IN `SCHEMA_NAME_ARGUMENT` VARCHAR(255), IN `TABLE_NAME_ARGUMENT` VARCHAR(255))
BEGIN
	DECLARE HAS_AUTO_INCREMENT_ID TINYINT(1);
	DECLARE PRIMARY_KEY_COLUMN_NAME VARCHAR(255);
	DECLARE PRIMARY_KEY_TYPE VARCHAR(255);
	DECLARE SQL_EXP VARCHAR(1000);
	SELECT COUNT(*)
		INTO HAS_AUTO_INCREMENT_ID
		FROM `information_schema`.`COLUMNS`
		WHERE `TABLE_SCHEMA` = (SELECT IFNULL(SCHEMA_NAME_ARGUMENT, SCHEMA()))
			AND `TABLE_NAME` = TABLE_NAME_ARGUMENT
			AND `Extra` = 'auto_increment'
			AND `COLUMN_KEY` = 'PRI'
			LIMIT 1;
	IF HAS_AUTO_INCREMENT_ID THEN
		SELECT `COLUMN_TYPE`
			INTO PRIMARY_KEY_TYPE
			FROM `information_schema`.`COLUMNS`
			WHERE `TABLE_SCHEMA` = (SELECT IFNULL(SCHEMA_NAME_ARGUMENT, SCHEMA()))
				AND `TABLE_NAME` = TABLE_NAME_ARGUMENT
				AND `COLUMN_KEY` = 'PRI'
			LIMIT 1;
		SELECT `COLUMN_NAME`
			INTO PRIMARY_KEY_COLUMN_NAME
			FROM `information_schema`.`COLUMNS`
			WHERE `TABLE_SCHEMA` = (SELECT IFNULL(SCHEMA_NAME_ARGUMENT, SCHEMA()))
				AND `TABLE_NAME` = TABLE_NAME_ARGUMENT
				AND `COLUMN_KEY` = 'PRI'
			LIMIT 1;
		SET SQL_EXP = CONCAT('ALTER TABLE `', (SELECT IFNULL(SCHEMA_NAME_ARGUMENT, SCHEMA())), '`.`', TABLE_NAME_ARGUMENT, '` MODIFY COLUMN `', PRIMARY_KEY_COLUMN_NAME, '` ', PRIMARY_KEY_TYPE, ' NOT NULL;');
		SET @SQL_EXP = SQL_EXP;
		PREPARE SQL_EXP_EXECUTE FROM @SQL_EXP;
		EXECUTE SQL_EXP_EXECUTE;
		DEALLOCATE PREPARE SQL_EXP_EXECUTE;
	END IF;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS `POMELO_AFTER_ADD_PRIMARY_KEY`;
DELIMITER //
CREATE PROCEDURE `POMELO_AFTER_ADD_PRIMARY_KEY`(IN `SCHEMA_NAME_ARGUMENT` VARCHAR(255), IN `TABLE_NAME_ARGUMENT` VARCHAR(255), IN `COLUMN_NAME_ARGUMENT` VARCHAR(255))
BEGIN
	DECLARE HAS_AUTO_INCREMENT_ID INT(11);
	DECLARE PRIMARY_KEY_COLUMN_NAME VARCHAR(255);
	DECLARE PRIMARY_KEY_TYPE VARCHAR(255);
	DECLARE SQL_EXP VARCHAR(1000);
	SELECT COUNT(*)
		INTO HAS_AUTO_INCREMENT_ID
		FROM `information_schema`.`COLUMNS`
		WHERE `TABLE_SCHEMA` = (SELECT IFNULL(SCHEMA_NAME_ARGUMENT, SCHEMA()))
			AND `TABLE_NAME` = TABLE_NAME_ARGUMENT
			AND `COLUMN_NAME` = COLUMN_NAME_ARGUMENT
			AND `COLUMN_TYPE` LIKE '%int%'
			AND `COLUMN_KEY` = 'PRI';
	IF HAS_AUTO_INCREMENT_ID THEN
		SELECT `COLUMN_TYPE`
			INTO PRIMARY_KEY_TYPE
			FROM `information_schema`.`COLUMNS`
			WHERE `TABLE_SCHEMA` = (SELECT IFNULL(SCHEMA_NAME_ARGUMENT, SCHEMA()))
				AND `TABLE_NAME` = TABLE_NAME_ARGUMENT
				AND `COLUMN_NAME` = COLUMN_NAME_ARGUMENT
				AND `COLUMN_TYPE` LIKE '%int%'
				AND `COLUMN_KEY` = 'PRI';
		SELECT `COLUMN_NAME`
			INTO PRIMARY_KEY_COLUMN_NAME
			FROM `information_schema`.`COLUMNS`
			WHERE `TABLE_SCHEMA` = (SELECT IFNULL(SCHEMA_NAME_ARGUMENT, SCHEMA()))
				AND `TABLE_NAME` = TABLE_NAME_ARGUMENT
				AND `COLUMN_NAME` = COLUMN_NAME_ARGUMENT
				AND `COLUMN_TYPE` LIKE '%int%'
				AND `COLUMN_KEY` = 'PRI';
		SET SQL_EXP = CONCAT('ALTER TABLE `', (SELECT IFNULL(SCHEMA_NAME_ARGUMENT, SCHEMA())), '`.`', TABLE_NAME_ARGUMENT, '` MODIFY COLUMN `', PRIMARY_KEY_COLUMN_NAME, '` ', PRIMARY_KEY_TYPE, ' NOT NULL AUTO_INCREMENT;');
		SET @SQL_EXP = SQL_EXP;
		PREPARE SQL_EXP_EXECUTE FROM @SQL_EXP;
		EXECUTE SQL_EXP_EXECUTE;
		DEALLOCATE PREPARE SQL_EXP_EXECUTE;
	END IF;
END //
DELIMITER ;

CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

START TRANSACTION;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250327173719_ResetInitialCreate') THEN

    ALTER DATABASE CHARACTER SET utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250327173719_ResetInitialCreate') THEN

    CREATE TABLE `Users` (
        `Id` char(36) COLLATE ascii_general_ci NOT NULL,
        `Username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
        `Role` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
        `Email` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
        `CreatedDate` datetime(6) NOT NULL,
        `GoogleId` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
        CONSTRAINT `PK_Users` PRIMARY KEY (`Id`)
    ) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250327173719_ResetInitialCreate') THEN

    CREATE UNIQUE INDEX `idx_users_username` ON `Users` (`Username`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250327173719_ResetInitialCreate') THEN

    INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
    VALUES ('20250327173719_ResetInitialCreate', '8.0.10');

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

COMMIT;

START TRANSACTION;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250402111106_ReaddFamilyAndSpecies') THEN

    ALTER DATABASE CHARACTER SET utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250402111106_ReaddFamilyAndSpecies') THEN

    ALTER TABLE `Users` CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250402111106_ReaddFamilyAndSpecies') THEN

    ALTER TABLE `Users` MODIFY COLUMN `Username` varchar(255) CHARACTER SET utf8mb4 NOT NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250402111106_ReaddFamilyAndSpecies') THEN

    ALTER TABLE `Users` MODIFY COLUMN `Role` longtext CHARACTER SET utf8mb4 NOT NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250402111106_ReaddFamilyAndSpecies') THEN

    ALTER TABLE `Users` MODIFY COLUMN `GoogleId` longtext CHARACTER SET utf8mb4 NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250402111106_ReaddFamilyAndSpecies') THEN

    ALTER TABLE `Users` MODIFY COLUMN `Email` longtext CHARACTER SET utf8mb4 NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250402111106_ReaddFamilyAndSpecies') THEN

    CREATE TABLE `Families` (
        `Id` char(36) COLLATE ascii_general_ci NOT NULL,
        `CreatedDate` datetime(6) NOT NULL,
        `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
        `Description` longtext CHARACTER SET utf8mb4 NULL,
        `OwnerId` char(36) COLLATE ascii_general_ci NOT NULL,
        CONSTRAINT `PK_Families` PRIMARY KEY (`Id`),
        CONSTRAINT `FK_Families_Users_OwnerId` FOREIGN KEY (`OwnerId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250402111106_ReaddFamilyAndSpecies') THEN

    CREATE TABLE `Species` (
        `Id` char(36) COLLATE ascii_general_ci NOT NULL,
        `CreatedDate` datetime(6) NOT NULL,
        `UpdatedDate` datetime(6) NOT NULL,
        `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
        `Description` longtext CHARACTER SET utf8mb4 NULL,
        `FamilyId` char(36) COLLATE ascii_general_ci NOT NULL,
        CONSTRAINT `PK_Species` PRIMARY KEY (`Id`),
        CONSTRAINT `FK_Species_Families_FamilyId` FOREIGN KEY (`FamilyId`) REFERENCES `Families` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250402111106_ReaddFamilyAndSpecies') THEN

    CREATE INDEX `IX_Families_OwnerId` ON `Families` (`OwnerId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250402111106_ReaddFamilyAndSpecies') THEN

    CREATE INDEX `IX_Species_FamilyId` ON `Species` (`FamilyId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250402111106_ReaddFamilyAndSpecies') THEN

    INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
    VALUES ('20250402111106_ReaddFamilyAndSpecies', '8.0.10');

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

COMMIT;

START TRANSACTION;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    ALTER TABLE `Species` ADD `Attributes` longtext CHARACTER SET utf8mb4 NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    ALTER TABLE `Species` ADD `PhaseId` char(36) COLLATE ascii_general_ci NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    CREATE TABLE `Mechanisms` (
        `Id` char(36) COLLATE ascii_general_ci NOT NULL,
        `CreatedDate` datetime(6) NOT NULL,
        `UpdatedDate` datetime(6) NOT NULL,
        `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
        `Description` longtext CHARACTER SET utf8mb4 NULL,
        `FamilyId` char(36) COLLATE ascii_general_ci NOT NULL,
        CONSTRAINT `PK_Mechanisms` PRIMARY KEY (`Id`),
        CONSTRAINT `FK_Mechanisms_Families_FamilyId` FOREIGN KEY (`FamilyId`) REFERENCES `Families` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    CREATE TABLE `Reactions` (
        `Id` char(36) COLLATE ascii_general_ci NOT NULL,
        `CreatedDate` datetime(6) NOT NULL,
        `UpdatedDate` datetime(6) NOT NULL,
        `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
        `Description` longtext CHARACTER SET utf8mb4 NULL,
        `FamilyId` char(36) COLLATE ascii_general_ci NOT NULL,
        CONSTRAINT `PK_Reactions` PRIMARY KEY (`Id`),
        CONSTRAINT `FK_Reactions_Families_FamilyId` FOREIGN KEY (`FamilyId`) REFERENCES `Families` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    CREATE TABLE `MechanismSpecies` (
        `MechanismId` char(36) COLLATE ascii_general_ci NOT NULL,
        `SpeciesId` char(36) COLLATE ascii_general_ci NOT NULL,
        CONSTRAINT `PK_MechanismSpecies` PRIMARY KEY (`MechanismId`, `SpeciesId`),
        CONSTRAINT `FK_MechanismSpecies_Mechanisms_MechanismId` FOREIGN KEY (`MechanismId`) REFERENCES `Mechanisms` (`Id`) ON DELETE CASCADE,
        CONSTRAINT `FK_MechanismSpecies_Species_SpeciesId` FOREIGN KEY (`SpeciesId`) REFERENCES `Species` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    CREATE TABLE `Phases` (
        `Id` char(36) COLLATE ascii_general_ci NOT NULL,
        `CreatedDate` datetime(6) NOT NULL,
        `UpdatedDate` datetime(6) NOT NULL,
        `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
        `Description` longtext CHARACTER SET utf8mb4 NULL,
        `MechanismId` char(36) COLLATE ascii_general_ci NOT NULL,
        CONSTRAINT `PK_Phases` PRIMARY KEY (`Id`),
        CONSTRAINT `FK_Phases_Mechanisms_MechanismId` FOREIGN KEY (`MechanismId`) REFERENCES `Mechanisms` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    CREATE TABLE `MechanismReactions` (
        `MechanismId` char(36) COLLATE ascii_general_ci NOT NULL,
        `ReactionId` char(36) COLLATE ascii_general_ci NOT NULL,
        CONSTRAINT `PK_MechanismReactions` PRIMARY KEY (`MechanismId`, `ReactionId`),
        CONSTRAINT `FK_MechanismReactions_Mechanisms_MechanismId` FOREIGN KEY (`MechanismId`) REFERENCES `Mechanisms` (`Id`) ON DELETE CASCADE,
        CONSTRAINT `FK_MechanismReactions_Reactions_ReactionId` FOREIGN KEY (`ReactionId`) REFERENCES `Reactions` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    CREATE TABLE `Products` (
        `Id` char(36) COLLATE ascii_general_ci NOT NULL,
        `ReactionId` char(36) COLLATE ascii_general_ci NOT NULL,
        `SpeciesId` char(36) COLLATE ascii_general_ci NOT NULL,
        `Coefficient` double NULL,
        `Branch` longtext CHARACTER SET utf8mb4 NULL,
        CONSTRAINT `PK_Products` PRIMARY KEY (`Id`),
        CONSTRAINT `FK_Products_Reactions_ReactionId` FOREIGN KEY (`ReactionId`) REFERENCES `Reactions` (`Id`) ON DELETE CASCADE,
        CONSTRAINT `FK_Products_Species_SpeciesId` FOREIGN KEY (`SpeciesId`) REFERENCES `Species` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    CREATE TABLE `Reactants` (
        `Id` char(36) COLLATE ascii_general_ci NOT NULL,
        `ReactionId` char(36) COLLATE ascii_general_ci NOT NULL,
        `SpeciesId` char(36) COLLATE ascii_general_ci NOT NULL,
        `Coefficient` double NULL,
        CONSTRAINT `PK_Reactants` PRIMARY KEY (`Id`),
        CONSTRAINT `FK_Reactants_Reactions_ReactionId` FOREIGN KEY (`ReactionId`) REFERENCES `Reactions` (`Id`) ON DELETE CASCADE,
        CONSTRAINT `FK_Reactants_Species_SpeciesId` FOREIGN KEY (`SpeciesId`) REFERENCES `Species` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    CREATE INDEX `IX_Species_PhaseId` ON `Species` (`PhaseId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    CREATE INDEX `IX_MechanismReactions_ReactionId` ON `MechanismReactions` (`ReactionId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    CREATE INDEX `IX_Mechanisms_FamilyId` ON `Mechanisms` (`FamilyId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    CREATE INDEX `IX_MechanismSpecies_SpeciesId` ON `MechanismSpecies` (`SpeciesId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    CREATE INDEX `IX_Phases_MechanismId` ON `Phases` (`MechanismId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    CREATE INDEX `IX_Products_ReactionId` ON `Products` (`ReactionId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    CREATE INDEX `IX_Products_SpeciesId` ON `Products` (`SpeciesId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    CREATE INDEX `IX_Reactants_ReactionId` ON `Reactants` (`ReactionId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    CREATE INDEX `IX_Reactants_SpeciesId` ON `Reactants` (`SpeciesId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    CREATE INDEX `IX_Reactions_FamilyId` ON `Reactions` (`FamilyId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    ALTER TABLE `Species` ADD CONSTRAINT `FK_Species_Phases_PhaseId` FOREIGN KEY (`PhaseId`) REFERENCES `Phases` (`Id`) ON DELETE SET NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250415192726_ReaddMechanismAndReaction') THEN

    INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
    VALUES ('20250415192726_ReaddMechanismAndReaction', '8.0.10');

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

COMMIT;

START TRANSACTION;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `MechanismReactions` DROP FOREIGN KEY `FK_MechanismReactions_Mechanisms_MechanismId`;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `MechanismReactions` DROP FOREIGN KEY `FK_MechanismReactions_Reactions_ReactionId`;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Phases` DROP FOREIGN KEY `FK_Phases_Mechanisms_MechanismId`;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Species` DROP FOREIGN KEY `FK_Species_Phases_PhaseId`;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Species` DROP INDEX `IX_Species_PhaseId`;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    CALL POMELO_BEFORE_DROP_PRIMARY_KEY(NULL, 'Reactants');
    ALTER TABLE `Reactants` DROP PRIMARY KEY;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    CALL POMELO_BEFORE_DROP_PRIMARY_KEY(NULL, 'Products');
    ALTER TABLE `Products` DROP PRIMARY KEY;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    CALL POMELO_BEFORE_DROP_PRIMARY_KEY(NULL, 'MechanismReactions');
    ALTER TABLE `MechanismReactions` DROP PRIMARY KEY;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Species` DROP COLUMN `Attributes`;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Species` DROP COLUMN `PhaseId`;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Reactants` DROP COLUMN `Id`;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Products` DROP COLUMN `Id`;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `MechanismReactions` RENAME `MechanismReaction`;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Phases` RENAME COLUMN `MechanismId` TO `FamilyId`;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Phases` RENAME INDEX `IX_Phases_MechanismId` TO `IX_Phases_FamilyId`;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `MechanismReaction` RENAME INDEX `IX_MechanismReactions_ReactionId` TO `IX_MechanismReaction_ReactionId`;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Reactions` ADD `AerosolPhaseId` char(36) COLLATE ascii_general_ci NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Reactions` ADD `AerosolPhaseSpeciesId` char(36) COLLATE ascii_general_ci NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Reactions` ADD `AerosolPhaseWaterId` char(36) COLLATE ascii_general_ci NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Reactions` ADD `GasPhaseId` char(36) COLLATE ascii_general_ci NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Reactions` ADD `GasPhaseSpeciesId` char(36) COLLATE ascii_general_ci NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Reactions` ADD `ReactionType` longtext CHARACTER SET utf8mb4 NOT NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Reactants` MODIFY COLUMN `Coefficient` double NOT NULL DEFAULT 0.0;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Products` MODIFY COLUMN `Coefficient` double NOT NULL DEFAULT 0.0;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Reactants` ADD CONSTRAINT `PK_Reactants` PRIMARY KEY (`ReactionId`, `SpeciesId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Products` ADD CONSTRAINT `PK_Products` PRIMARY KEY (`ReactionId`, `SpeciesId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `MechanismReaction` ADD CONSTRAINT `PK_MechanismReaction` PRIMARY KEY (`MechanismId`, `ReactionId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    CREATE TABLE `MechanismPhase` (
        `MechanismId` char(36) COLLATE ascii_general_ci NOT NULL,
        `PhaseId` char(36) COLLATE ascii_general_ci NOT NULL,
        CONSTRAINT `PK_MechanismPhase` PRIMARY KEY (`MechanismId`, `PhaseId`),
        CONSTRAINT `FK_MechanismPhase_Mechanisms_MechanismId` FOREIGN KEY (`MechanismId`) REFERENCES `Mechanisms` (`Id`) ON DELETE CASCADE,
        CONSTRAINT `FK_MechanismPhase_Phases_PhaseId` FOREIGN KEY (`PhaseId`) REFERENCES `Phases` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    CREATE TABLE `PhaseSpecies` (
        `PhasesId` char(36) COLLATE ascii_general_ci NOT NULL,
        `SpeciesId` char(36) COLLATE ascii_general_ci NOT NULL,
        CONSTRAINT `PK_PhaseSpecies` PRIMARY KEY (`PhasesId`, `SpeciesId`),
        CONSTRAINT `FK_PhaseSpecies_Phases_PhasesId` FOREIGN KEY (`PhasesId`) REFERENCES `Phases` (`Id`) ON DELETE CASCADE,
        CONSTRAINT `FK_PhaseSpecies_Species_SpeciesId` FOREIGN KEY (`SpeciesId`) REFERENCES `Species` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    CREATE TABLE `ReactionNumericalAttributes` (
        `ReactionId` char(36) COLLATE ascii_general_ci NOT NULL,
        `SerializationKey` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
        `Value` double NOT NULL,
        CONSTRAINT `PK_ReactionNumericalAttributes` PRIMARY KEY (`ReactionId`, `SerializationKey`),
        CONSTRAINT `FK_ReactionNumericalAttributes_Reactions_ReactionId` FOREIGN KEY (`ReactionId`) REFERENCES `Reactions` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    CREATE TABLE `ReactionStringAttributes` (
        `ReactionId` char(36) COLLATE ascii_general_ci NOT NULL,
        `SerializationKey` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
        `Value` longtext CHARACTER SET utf8mb4 NOT NULL,
        CONSTRAINT `PK_ReactionStringAttributes` PRIMARY KEY (`ReactionId`, `SerializationKey`),
        CONSTRAINT `FK_ReactionStringAttributes_Reactions_ReactionId` FOREIGN KEY (`ReactionId`) REFERENCES `Reactions` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    CREATE TABLE `SpeciesNumericalAttributes` (
        `SpeciesId` char(36) COLLATE ascii_general_ci NOT NULL,
        `SerializationKey` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
        `Value` double NOT NULL,
        CONSTRAINT `PK_SpeciesNumericalAttributes` PRIMARY KEY (`SpeciesId`, `SerializationKey`),
        CONSTRAINT `FK_SpeciesNumericalAttributes_Species_SpeciesId` FOREIGN KEY (`SpeciesId`) REFERENCES `Species` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    CREATE INDEX `IX_Reactions_AerosolPhaseId` ON `Reactions` (`AerosolPhaseId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    CREATE INDEX `IX_Reactions_AerosolPhaseSpeciesId` ON `Reactions` (`AerosolPhaseSpeciesId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    CREATE INDEX `IX_Reactions_AerosolPhaseWaterId` ON `Reactions` (`AerosolPhaseWaterId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    CREATE INDEX `IX_Reactions_GasPhaseId` ON `Reactions` (`GasPhaseId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    CREATE INDEX `IX_Reactions_GasPhaseSpeciesId` ON `Reactions` (`GasPhaseSpeciesId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    CREATE INDEX `IX_MechanismPhase_PhaseId` ON `MechanismPhase` (`PhaseId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    CREATE INDEX `IX_PhaseSpecies_SpeciesId` ON `PhaseSpecies` (`SpeciesId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `MechanismReaction` ADD CONSTRAINT `FK_MechanismReaction_Mechanisms_MechanismId` FOREIGN KEY (`MechanismId`) REFERENCES `Mechanisms` (`Id`) ON DELETE CASCADE;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `MechanismReaction` ADD CONSTRAINT `FK_MechanismReaction_Reactions_ReactionId` FOREIGN KEY (`ReactionId`) REFERENCES `Reactions` (`Id`) ON DELETE CASCADE;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Phases` ADD CONSTRAINT `FK_Phases_Families_FamilyId` FOREIGN KEY (`FamilyId`) REFERENCES `Families` (`Id`) ON DELETE CASCADE;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Reactions` ADD CONSTRAINT `FK_Reactions_Phases_AerosolPhaseId` FOREIGN KEY (`AerosolPhaseId`) REFERENCES `Phases` (`Id`) ON DELETE SET NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Reactions` ADD CONSTRAINT `FK_Reactions_Phases_GasPhaseId` FOREIGN KEY (`GasPhaseId`) REFERENCES `Phases` (`Id`) ON DELETE SET NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Reactions` ADD CONSTRAINT `FK_Reactions_Species_AerosolPhaseSpeciesId` FOREIGN KEY (`AerosolPhaseSpeciesId`) REFERENCES `Species` (`Id`) ON DELETE SET NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Reactions` ADD CONSTRAINT `FK_Reactions_Species_AerosolPhaseWaterId` FOREIGN KEY (`AerosolPhaseWaterId`) REFERENCES `Species` (`Id`) ON DELETE SET NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    ALTER TABLE `Reactions` ADD CONSTRAINT `FK_Reactions_Species_GasPhaseSpeciesId` FOREIGN KEY (`GasPhaseSpeciesId`) REFERENCES `Species` (`Id`) ON DELETE SET NULL;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420070450_FullDataModel') THEN

    INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
    VALUES ('20250420070450_FullDataModel', '8.0.10');

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

COMMIT;

START TRANSACTION;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420072758_AddSpeciesStringAttributes') THEN

    CREATE TABLE `SpeciesStringAttributes` (
        `SpeciesId` char(36) COLLATE ascii_general_ci NOT NULL,
        `SerializationKey` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
        `Value` longtext CHARACTER SET utf8mb4 NOT NULL,
        CONSTRAINT `PK_SpeciesStringAttributes` PRIMARY KEY (`SpeciesId`, `SerializationKey`),
        CONSTRAINT `FK_SpeciesStringAttributes_Species_SpeciesId` FOREIGN KEY (`SpeciesId`) REFERENCES `Species` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20250420072758_AddSpeciesStringAttributes') THEN

    INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
    VALUES ('20250420072758_AddSpeciesStringAttributes', '8.0.10');

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

COMMIT;

DROP PROCEDURE `POMELO_BEFORE_DROP_PRIMARY_KEY`;

DROP PROCEDURE `POMELO_AFTER_ADD_PRIMARY_KEY`;

