CREATE TABLE `User` (
  `uuid` char(38) NOT NULL,
  `log_in_info` varchar(1000) DEFAULT NULL,
  `isDel` tinyint NOT NULL DEFAULT '0',
  `role` ENUM('unverified', 'verified', 'admin') NOT NULL DEFAULT 'unverified',
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `User_Preferences` (
  `uuid` char(38) NOT NULL,
  `user_uuid` char(38) NOT NULL,
  `preferences` varchar(1000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `isDel` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `user_uuid_idx` (`user_uuid`),
  CONSTRAINT `fk7_user_uuid` FOREIGN KEY (`user_uuid`) REFERENCES `User` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `TagMechanism` (
  `uuid` char(38) NOT NULL,
  `tag` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `isDel` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `Family` (
  `uuid` char(38) NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `super_tag_mechanism_uuid` char(38) NOT NULL,
  `isDel` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_super_tag_mechanism_uuid_idx` (`super_tag_mechanism_uuid`),
  CONSTRAINT `fk_super_tag_mechanism_uuid` FOREIGN KEY (`super_tag_mechanism_uuid`) REFERENCES `TagMechanism` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Family_TagMechanism_List` (
  `uuid` char(38) NOT NULL,
  `family_uuid` char(38) NOT NULL,
  `tag_mechanism_uuid` char(38) NOT NULL,
  `version` varchar(100) NOT NULL,
  `isDel` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `famil_uuid_idx` (`family_uuid`),
  KEY `fk1_mechanism_uuid_idx` (`tag_mechanism_uuid`),
  CONSTRAINT `fk1_family_uuid` FOREIGN KEY (`family_uuid`) REFERENCES `Family` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk1_mechanism_uuid` FOREIGN KEY (`tag_mechanism_uuid`) REFERENCES `TagMechanism` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Family_TagMechanism_List_Version` (
  `uuid` char(38) NOT NULL,
  `family_uuid` char(38) NOT NULL,
  `tag_mechanism_uuid` char(38) NOT NULL,
  `frozen_version` varchar(100) NOT NULL,
  `action` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `user_uuid` char(38) NOT NULL,
  `datetime` datetime DEFAULT NULL,
  `isDel` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_user_uuid_idx` (`user_uuid`),
  KEY `fk_family_uuid_idx` (`family_uuid`),
  KEY `fk2_mechanism_uuid_idx` (`tag_mechanism_uuid`),
  CONSTRAINT `fk1_user_uuid` FOREIGN KEY (`user_uuid`) REFERENCES `User` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk2_family_uuid` FOREIGN KEY (`family_uuid`) REFERENCES `Family` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk2_mechanism_uuid` FOREIGN KEY (`tag_mechanism_uuid`) REFERENCES `TagMechanism` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `PropertyType` (
  `uuid` char(38) NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `units` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `validation` varchar(100) DEFAULT NULL,
  `isDel` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Property_List` (
  `uuid` char(38) NOT NULL,
  `parent_uuid` char(38) NOT NULL,
  `version` char(38) NOT NULL,
  `isDel` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Property_Version` (
  `uuid` char(38) NOT NULL,
  `parent_property_uuid` char(38) NOT NULL,
  `frozen_version` char(38) NOT NULL,
  `tag_mechanism_uuid` char(38) NOT NULL,
  `property_type` char(38) NOT NULL,
  `float_value` float DEFAULT NULL,
  `double_value` double DEFAULT NULL,
  `int_value` int DEFAULT NULL,
  `string_value` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `action` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `user_uuid` char(38) NOT NULL,
  `datetime` datetime DEFAULT NULL,
  `isDel` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk1_property_type_idx` (`property_type`),
  KEY `fk1_parent_property_uuid_idx` (`parent_property_uuid`),
  KEY `fk3_user_uuid_idx` (`user_uuid`),
  KEY `fk5_mechanism_uuid_idx` (`tag_mechanism_uuid`),
  CONSTRAINT `fk1_parent_property_uuid` FOREIGN KEY (`parent_property_uuid`) REFERENCES `Property_List` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk1_property_type` FOREIGN KEY (`property_type`) REFERENCES `PropertyType` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk3_user_uuid` FOREIGN KEY (`user_uuid`) REFERENCES `User` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk5_mechanism_uuid` FOREIGN KEY (`tag_mechanism_uuid`) REFERENCES `TagMechanism` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `Reaction` (
  `uuid` char(38) NOT NULL,
  `type` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `isDel` tinyint NOT NULL DEFAULT '0',
  `reactant_list_uuid` char(38) DEFAULT NULL,
  `product_list_uuid` char(38) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `reactant_list_uuid_UNIQUE` (`reactant_list_uuid`),
  UNIQUE KEY `product_list_uuid_UNIQUE` (`product_list_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Species` (
  `uuid` char(38) NOT NULL,
  `type` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `isDel` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Reactant_Product_List` (
  `reactant_product_uuid` char(38) NOT NULL,
  `reaction_uuid` char(38) NOT NULL,
  `species_uuid` char(38) NOT NULL,
  `quantity` int DEFAULT '1',
  KEY `fk6_reaction_uuid_idx` (`reaction_uuid`),
  KEY `fk6_species_uuid_idx` (`species_uuid`),
  CONSTRAINT `fk100_reaction_uuid` FOREIGN KEY (`reaction_uuid`) REFERENCES `Reaction` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk100_species_uuid` FOREIGN KEY (`species_uuid`) REFERENCES `Species` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `TagMechanism_Reaction_List` (
  `tag_mechanism_uuid` char(38) NOT NULL,
  `reaction_uuid` char(38) NOT NULL,
  `version` char(38) NOT NULL,
  `isDel` tinyint NOT NULL DEFAULT '0',
  `uuid` char(38) NOT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk3_tag_mechanism_uuid_idx` (`tag_mechanism_uuid`),
  KEY `fk3_reaction_uuid_idx` (`reaction_uuid`),
  CONSTRAINT `fk3_reaction_uuid` FOREIGN KEY (`reaction_uuid`) REFERENCES `Reaction` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk3_tag_mechanism_uuid` FOREIGN KEY (`tag_mechanism_uuid`) REFERENCES `TagMechanism` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `TagMechanism_Reaction_List_Version` (
  `uuid` char(38) NOT NULL,
  `tag_mechanism_uuid` char(38) NOT NULL,
  `reaction_uuid` char(38) NOT NULL,
  `frozen_version` char(38) NOT NULL,
  `action` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `user_uuid` char(38) NOT NULL,
  `datetime` datetime DEFAULT NULL,
  `isDel` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk4_tag_mechanism_uuid_idx` (`tag_mechanism_uuid`),
  KEY `fk4_reaction_uuid_idx` (`reaction_uuid`),
  KEY `fk5_user_uuid_idx` (`user_uuid`),
  CONSTRAINT `fk4_reaction_uuid` FOREIGN KEY (`reaction_uuid`) REFERENCES `Reaction` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk4_tag_mechanism_uuid` FOREIGN KEY (`tag_mechanism_uuid`) REFERENCES `TagMechanism` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk5_user_uuid` FOREIGN KEY (`user_uuid`) REFERENCES `User` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `TagMechanism_Species_List` (
  `uuid` char(38) NOT NULL,
  `tag_mechanism_uuid` char(38) NOT NULL,
  `species_uuid` char(38) NOT NULL,
  `version` char(38) NOT NULL,
  `isDel` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk5_tam_mechanism_uuid_idx` (`tag_mechanism_uuid`),
  KEY `fk3_species_uuid_idx` (`species_uuid`),
  CONSTRAINT `fk3_species_uuid` FOREIGN KEY (`species_uuid`) REFERENCES `Species` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk5_tag_mechanism_uuid` FOREIGN KEY (`tag_mechanism_uuid`) REFERENCES `TagMechanism` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `TagMechanism_Species_List_Version` (
  `uuid` char(38) NOT NULL,
  `tag_mechanism_uuid` char(38) NOT NULL,
  `species_uuid` char(38) NOT NULL,
  `frozen_uuid` char(38) NOT NULL,
  `action` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `user_uuid` char(38) NOT NULL,
  `datetime` datetime DEFAULT NULL,
  `isDel` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk6_tag_mechanism_uuid_idx` (`tag_mechanism_uuid`),
  KEY `fk4_species_uuid_idx` (`species_uuid`),
  KEY `fk6_user_uuid_idx` (`user_uuid`),
  CONSTRAINT `fk4_species_uuid` FOREIGN KEY (`species_uuid`) REFERENCES `Species` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk6_tag_mechanism_uuid` FOREIGN KEY (`tag_mechanism_uuid`) REFERENCES `TagMechanism` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk6_user_uuid` FOREIGN KEY (`user_uuid`) REFERENCES `User` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


