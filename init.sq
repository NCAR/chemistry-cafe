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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

    CREATE TABLE `Users` (
        `Id` char(36) COLLATE ascii_general_ci NOT NULL,
        `Username` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
        `Role` longtext CHARACTER SET utf8mb4 NOT NULL,
        `Email` longtext CHARACTER SET utf8mb4 NULL,
        `CreatedDate` datetime(6) NOT NULL,
        `GoogleId` longtext CHARACTER SET utf8mb4 NULL,
        CONSTRAINT `PK_Users` PRIMARY KEY (`Id`)
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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

    CREATE TABLE `Phases` (
        `Id` char(36) COLLATE ascii_general_ci NOT NULL,
        `CreatedDate` datetime(6) NOT NULL,
        `UpdatedDate` datetime(6) NOT NULL,
        `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
        `Description` longtext CHARACTER SET utf8mb4 NULL,
        `FamilyId` char(36) COLLATE ascii_general_ci NOT NULL,
        CONSTRAINT `PK_Phases` PRIMARY KEY (`Id`),
        CONSTRAINT `FK_Phases_Families_FamilyId` FOREIGN KEY (`FamilyId`) REFERENCES `Families` (`Id`) ON DELETE CASCADE
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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

    CREATE TABLE `Species` (
        `Id` char(36) COLLATE ascii_general_ci NOT NULL,
        `CreatedDate` datetime(6) NOT NULL,
        `UpdatedDate` datetime(6) NOT NULL,
        `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
        `Description` longtext CHARACTER SET utf8mb4 NULL,
        `IsThirdBody` tinyint(1) NULL,
        `MolecularWeight` double NULL,
        `ConstantConcentration` double NULL,
        `ConstantMixingRatio` double NULL,
        `OtherProperties` json NULL,
        `AbsoluteTolerance` double NULL,
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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

    CREATE TABLE `Reactions` (
        `Id` char(36) COLLATE ascii_general_ci NOT NULL,
        `CreatedDate` datetime(6) NOT NULL,
        `UpdatedDate` datetime(6) NOT NULL,
        `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
        `ReactionType` longtext CHARACTER SET utf8mb4 NOT NULL,
        `Description` longtext CHARACTER SET utf8mb4 NULL,
        `GasPhaseId` char(36) COLLATE ascii_general_ci NULL,
        `GasPhaseSpeciesId` char(36) COLLATE ascii_general_ci NULL,
        `AerosolPhaseId` char(36) COLLATE ascii_general_ci NULL,
        `AerosolPhaseSpeciesId` char(36) COLLATE ascii_general_ci NULL,
        `AerosolPhaseWaterId` char(36) COLLATE ascii_general_ci NULL,
        `FamilyId` char(36) COLLATE ascii_general_ci NOT NULL,
        CONSTRAINT `PK_Reactions` PRIMARY KEY (`Id`),
        CONSTRAINT `FK_Reactions_Families_FamilyId` FOREIGN KEY (`FamilyId`) REFERENCES `Families` (`Id`) ON DELETE CASCADE,
        CONSTRAINT `FK_Reactions_Phases_AerosolPhaseId` FOREIGN KEY (`AerosolPhaseId`) REFERENCES `Phases` (`Id`) ON DELETE SET NULL,
        CONSTRAINT `FK_Reactions_Phases_GasPhaseId` FOREIGN KEY (`GasPhaseId`) REFERENCES `Phases` (`Id`) ON DELETE SET NULL,
        CONSTRAINT `FK_Reactions_Species_AerosolPhaseSpeciesId` FOREIGN KEY (`AerosolPhaseSpeciesId`) REFERENCES `Species` (`Id`) ON DELETE SET NULL,
        CONSTRAINT `FK_Reactions_Species_AerosolPhaseWaterId` FOREIGN KEY (`AerosolPhaseWaterId`) REFERENCES `Species` (`Id`) ON DELETE SET NULL,
        CONSTRAINT `FK_Reactions_Species_GasPhaseSpeciesId` FOREIGN KEY (`GasPhaseSpeciesId`) REFERENCES `Species` (`Id`) ON DELETE SET NULL
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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

    CREATE TABLE `MechanismReaction` (
        `MechanismId` char(36) COLLATE ascii_general_ci NOT NULL,
        `ReactionId` char(36) COLLATE ascii_general_ci NOT NULL,
        CONSTRAINT `PK_MechanismReaction` PRIMARY KEY (`MechanismId`, `ReactionId`),
        CONSTRAINT `FK_MechanismReaction_Mechanisms_MechanismId` FOREIGN KEY (`MechanismId`) REFERENCES `Mechanisms` (`Id`) ON DELETE CASCADE,
        CONSTRAINT `FK_MechanismReaction_Reactions_ReactionId` FOREIGN KEY (`ReactionId`) REFERENCES `Reactions` (`Id`) ON DELETE CASCADE
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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

    CREATE TABLE `Products` (
        `ReactionId` char(36) COLLATE ascii_general_ci NOT NULL,
        `SpeciesId` char(36) COLLATE ascii_general_ci NOT NULL,
        `Coefficient` double NOT NULL,
        `Branch` longtext CHARACTER SET utf8mb4 NULL,
        CONSTRAINT `PK_Products` PRIMARY KEY (`ReactionId`, `SpeciesId`),
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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

    CREATE TABLE `Reactants` (
        `ReactionId` char(36) COLLATE ascii_general_ci NOT NULL,
        `SpeciesId` char(36) COLLATE ascii_general_ci NOT NULL,
        `Coefficient` double NOT NULL,
        CONSTRAINT `PK_Reactants` PRIMARY KEY (`ReactionId`, `SpeciesId`),
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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

    CREATE INDEX `IX_MechanismReaction_ReactionId` ON `MechanismReaction` (`ReactionId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

    CREATE INDEX `IX_Phases_FamilyId` ON `Phases` (`FamilyId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

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
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260825205855_InitialCreate') THEN

    INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
    VALUES ('20260825205855_InitialCreate', '8.0.10');

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

COMMIT;

