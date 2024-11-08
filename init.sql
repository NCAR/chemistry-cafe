-- init.sql

-- 1. Create Tables

-- Table to store information about chemical species
CREATE TABLE species (
    id CHAR(36) PRIMARY KEY DEFAULT (LOWER(UUID())),
    name VARCHAR(255) NOT NULL UNIQUE, -- UNIQUE constraint to prevent duplicates
    description TEXT,
    created_by VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store chemical reactions
CREATE TABLE reactions (
    id CHAR(36) PRIMARY KEY DEFAULT (LOWER(UUID())),
    name VARCHAR(255) NOT NULL UNIQUE, -- NEW: Unique name for each reaction
    description TEXT,
    created_by VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store families of mechanisms
CREATE TABLE families (
    id CHAR(36) PRIMARY KEY DEFAULT (LOWER(UUID())),
    name VARCHAR(255) UNIQUE NOT NULL, -- UNIQUE constraint
    description TEXT,
    created_by VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store mechanisms and their metadata
CREATE TABLE mechanisms (
    id CHAR(36) PRIMARY KEY DEFAULT (LOWER(UUID())),
    family_id CHAR(36) NOT NULL, -- Updated to CHAR(36)
    name VARCHAR(255) UNIQUE NOT NULL, -- UNIQUE constraint
    description TEXT,
    created_by VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
);

-- Table to store different versions of mechanisms
CREATE TABLE mechanism_versions (
    id CHAR(36) PRIMARY KEY DEFAULT (LOWER(UUID())),
    mechanism_id CHAR(36) NOT NULL, -- Updated to CHAR(36)
    version_number INT NOT NULL,
    tag VARCHAR(50),
    created_by VARCHAR(255),
    published_date TIMESTAMP,
    UNIQUE KEY unique_mechanism_version (mechanism_id, version_number), -- Ensures unique version numbers per mechanism
    FOREIGN KEY (mechanism_id) REFERENCES mechanisms(id) ON DELETE CASCADE
);

-- Table to store relationships between reactions and species
CREATE TABLE reaction_species (
    id CHAR(36) PRIMARY KEY DEFAULT (LOWER(UUID())),
    reaction_id CHAR(36) NOT NULL, -- Updated to CHAR(36)
    species_id CHAR(36) NOT NULL,  -- Updated to CHAR(36)
    role ENUM('reactant', 'product') NOT NULL, -- Enforces valid roles
    UNIQUE KEY unique_reaction_species_role (reaction_id, species_id, role), -- Prevents duplicate role assignments
    FOREIGN KEY (reaction_id) REFERENCES reactions(id) ON DELETE CASCADE,
    FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE
);

-- Table to store relationships between mechanisms and reactions
CREATE TABLE mechanism_reactions (
    id CHAR(36) PRIMARY KEY DEFAULT (LOWER(UUID())),
    mechanism_id CHAR(36) NOT NULL, -- Updated to CHAR(36)
    reaction_id CHAR(36) NOT NULL,  -- Updated to CHAR(36)
    UNIQUE KEY unique_mechanism_reaction (mechanism_id, reaction_id), -- Prevents duplicate mappings
    FOREIGN KEY (mechanism_id) REFERENCES mechanisms(id) ON DELETE CASCADE,
    FOREIGN KEY (reaction_id) REFERENCES reactions(id) ON DELETE CASCADE
);

-- Table to store relationships between mechanisms and species
CREATE TABLE mechanism_species (
    id CHAR(36) PRIMARY KEY DEFAULT (LOWER(UUID())), -- Corrected syntax
    mechanism_id CHAR(36) NOT NULL, -- Updated to CHAR(36)
    species_id CHAR(36) NOT NULL,   -- Updated to CHAR(36)
    UNIQUE KEY unique_mechanism_species (mechanism_id, species_id), -- Prevents duplicate mappings
    FOREIGN KEY (mechanism_id) REFERENCES mechanisms(id) ON DELETE CASCADE,
    FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE
);

-- Table to store initial conditions specific to species within a mechanism
CREATE TABLE initial_conditions_species (
    id CHAR(36) PRIMARY KEY DEFAULT (LOWER(UUID())),
    mechanism_id CHAR(36) NOT NULL, -- Updated to CHAR(36)
    species_id CHAR(36) NOT NULL,   -- Updated to CHAR(36)
    concentration DOUBLE,
    temperature DOUBLE,
    pressure DOUBLE,
    additional_conditions TEXT,
    abs_convergence_tolerance DOUBLE,
    diffusion_coefficient DOUBLE,
    molecular_weight DOUBLE,
    fixed_concentration DOUBLE,
    UNIQUE KEY unique_initial_conditions (mechanism_id, species_id), -- Ensures one initial condition per species per mechanism
    FOREIGN KEY (mechanism_id) REFERENCES mechanisms(id) ON DELETE CASCADE,
    FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE
);

-- Table to store users and their roles (admin, researcher, etc.)
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (LOWER(UUID())),
    username VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL, -- Role could be 'admin', 'researcher', etc.
    email VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store the relationship between users and mechanisms
CREATE TABLE user_mechanisms (
    id CHAR(36) PRIMARY KEY DEFAULT (LOWER(UUID())),
    user_id CHAR(36) NOT NULL,      -- Updated to CHAR(36)
    mechanism_id CHAR(36) NOT NULL, -- Updated to CHAR(36)
    role VARCHAR(50), -- Role could be 'owner', 'contributor', etc.
    UNIQUE KEY unique_user_mechanism_role (user_id, mechanism_id, role), -- Prevents duplicate role assignments
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mechanism_id) REFERENCES mechanisms(id) ON DELETE CASCADE
);

-- 2. Insert Data into `families` and `mechanisms`

-- Insert families
INSERT INTO families (id, name, description, created_by) VALUES 
    (LOWER(UUID()), 'Combustion Reactions', 'Family of reactions related to combustion processes', 'admin'),
    (LOWER(UUID()), 'Carbon Bond Mechanisms', 'Family of carbon bond mechanisms for atmospheric chemistry', 'admin'),
    (LOWER(UUID()), 'Chapman Mechanism', 'Chapman mechanism for ozone chemistry modeling', 'admin'),
    (LOWER(UUID()), 'Flow Tube Mechanism', 'Flow Tube mechanism for aerosol chemistry modeling', 'admin');

-- Insert mechanisms
INSERT INTO mechanisms (id, family_id, name, description, created_by) VALUES 
    (LOWER(UUID()), (SELECT id FROM families WHERE name = 'Combustion Reactions'), 'analytical', 'Analytical mechanism for testing purposes', 'admin'),
    (LOWER(UUID()), (SELECT id FROM families WHERE name = 'Carbon Bond Mechanisms'), 'carbon_bond_5', 'Carbon Bond 5 mechanism for atmospheric chemistry modeling', 'admin'),
    (LOWER(UUID()), (SELECT id FROM families WHERE name = 'Chapman Mechanism'), 'chapman', 'Chapman mechanism for ozone chemistry modeling', 'admin'),
    (LOWER(UUID()), (SELECT id FROM families WHERE name = 'Flow Tube Mechanism'), 'flow_tube', 'Flow Tube mechanism for aerosol chemistry modeling', 'admin');

-- 3. Insert Species Data

-- Insert species, ensuring no duplicates
INSERT IGNORE INTO species (id, name, description, created_by) VALUES
    -- Species for Analytical Mechanism
    (LOWER(UUID()), 'A', 'Chemical Species A', 'admin'),
    (LOWER(UUID()), 'B', 'Chemical Species B', 'admin'),
    (LOWER(UUID()), 'C', 'Chemical Species C', 'admin'),
    (LOWER(UUID()), 'irr__089f1f45-4cd8-4278-83d5-d638e98e4315', 'Intermediate Reactant 1', 'admin'),
    (LOWER(UUID()), 'irr__2a109b21-bb24-41ae-8f06-7485fd36f1a7', 'Intermediate Reactant 2', 'admin'),
    -- Species for Carbon Bond 5 Mechanism
    (LOWER(UUID()), 'NO', 'Nitric Oxide', 'admin'),
    (LOWER(UUID()), 'NO2', 'Nitrogen Dioxide', 'admin'),
    (LOWER(UUID()), 'HNO3', 'Nitric Acid', 'admin'),
    (LOWER(UUID()), 'O3', 'Ozone', 'admin'),
    (LOWER(UUID()), 'H2O2', 'Hydrogen Peroxide', 'admin'),
    (LOWER(UUID()), 'CO', 'Carbon Monoxide', 'admin'),
    (LOWER(UUID()), 'SO2', 'Sulfur Dioxide', 'admin'),
    (LOWER(UUID()), 'HCL', 'Hydrochloric Acid', 'admin'),
    (LOWER(UUID()), 'CH4', 'Methane', 'admin'),
    (LOWER(UUID()), 'ETHA', 'Ethane', 'admin'),
    (LOWER(UUID()), 'FORM', 'Formaldehyde', 'admin'),
    (LOWER(UUID()), 'MEOH', 'Methanol', 'admin'),
    (LOWER(UUID()), 'MEPX', 'Methoxy Peroxy Radical', 'admin'),
    (LOWER(UUID()), 'ALD2', 'Acetaldehyde', 'admin'),
    (LOWER(UUID()), 'PAR', 'Paraffin Carbon Bond', 'admin'),
    (LOWER(UUID()), 'ETH', 'Ethylene', 'admin'),
    (LOWER(UUID()), 'OLE', 'Olefins', 'admin'),
    (LOWER(UUID()), 'IOLE', 'Isoprene', 'admin'),
    (LOWER(UUID()), 'TOL', 'Toluene', 'admin'),
    (LOWER(UUID()), 'XYL', 'Xylene', 'admin'),
    (LOWER(UUID()), 'NTR', 'Nitrate Radical', 'admin'),
    (LOWER(UUID()), 'PAN', 'Peroxyacetyl Nitrate', 'admin'),
    (LOWER(UUID()), 'AACD', 'Acetaldehyde Carbonyl', 'admin'),
    (LOWER(UUID()), 'ROOH', 'Hydroperoxide Radical', 'admin'),
    (LOWER(UUID()), 'ISOP', 'Isoprene', 'admin'),
    (LOWER(UUID()), 'O2', 'Oxygen Molecule', 'admin'),
    (LOWER(UUID()), 'H2', 'Hydrogen', 'admin'),
    (LOWER(UUID()), 'H2O', 'Water', 'admin'),
    (LOWER(UUID()), 'OH', 'Hydroxyl Radical', 'admin'),
    (LOWER(UUID()), 'HO2', 'Hydroperoxy Radical', 'admin'),
    (LOWER(UUID()), 'MEO2', 'Methylperoxy Radical', 'admin'),
    (LOWER(UUID()), 'BENZENE', 'Benzene', 'admin'),
    (LOWER(UUID()), 'BENZRO2', 'Benzylperoxy Radical', 'admin'),
    (LOWER(UUID()), 'irr__006fae85-6ca3-441e-b5ca-699fb48e73b6', 'Intermediate Species', 'admin'),
    (LOWER(UUID()), 'irr__00fb05f5-7d54-4f5f-8ca6-874993128406', 'Intermediate Species', 'admin'),
    (LOWER(UUID()), 'irr__02066a44-7669-427c-8153-c77676471a76', 'Intermediate Species', 'admin'),
    -- Species for Chapman Mechanism
    (LOWER(UUID()), 'M', 'Third Body Species', 'admin'),
    (LOWER(UUID()), 'Ar', 'Argon', 'admin'),
    (LOWER(UUID()), 'CO2', 'Carbon Dioxide', 'admin'),
    (LOWER(UUID()), 'O1D', 'Oxygen Atom Excited State', 'admin'),
    (LOWER(UUID()), 'O', 'Oxygen Atom', 'admin'),
    (LOWER(UUID()), 'N2', 'Nitrogen Molecule', 'admin'),
    (LOWER(UUID()), 'irr__071b97cd-d37e-41e1-9ff1-308e3179f910', 'Intermediate Species 1', 'admin'),
    (LOWER(UUID()), 'irr__17773fe3-c1f6-4015-87e2-f20278517a59', 'Intermediate Species 2', 'admin'),
    (LOWER(UUID()), 'irr__1fce6ca9-960d-4ef9-9435-b5e4ef3f1534', 'Intermediate Species 3', 'admin'),
    (LOWER(UUID()), 'irr__427192a6-365c-4d22-9174-8ad91126afab', 'Intermediate Species 4', 'admin'),
    (LOWER(UUID()), 'irr__93f71f99-b360-451d-b698-cc7f7cfe061b', 'Intermediate Species 5', 'admin'),
    (LOWER(UUID()), 'irr__d41171b4-5f9b-4c24-9f0c-4a5bc0041ebc', 'Intermediate Species 6', 'admin'),
    (LOWER(UUID()), 'irr__f6bf24e9-1b52-497b-b50c-74eaccc28120', 'Intermediate Species 7', 'admin'),
    -- Species for Flow Tube Mechanism
    (LOWER(UUID()), 'irr__3fddcf85-062e-4a73-be2c-8f3bbe3af3da', 'Intermediate Species 1', 'admin'),
    (LOWER(UUID()), 'irr__49b12001-dc96-4a05-9715-e3cd05cb37d5', 'Intermediate Species 2', 'admin'),
    (LOWER(UUID()), 'irr__d726e081-c0f1-4649-8947-4919aefd6ac8', 'Intermediate Species 3', 'admin'),
    (LOWER(UUID()), 'a-pinene', 'Alpha-Pinene', 'admin'),
    (LOWER(UUID()), 'SOA1', 'Secondary Organic Aerosol 1', 'admin'),
    (LOWER(UUID()), 'SOA2', 'Secondary Organic Aerosol 2', 'admin');

-- 4. Insert Reaction Data

-- Insert reactions for all mechanisms with unique names
INSERT IGNORE INTO reactions (id, name, description, created_by) VALUES
    -- Analytical Mechanism Reactions
    (LOWER(UUID()), 'analytical_reaction1', 'ARRHENIUS Reaction 1: B -> C + irr__089f1f45-4cd8-4278-83d5-d638e98e4315', 'admin'),
    (LOWER(UUID()), 'analytical_reaction2', 'ARRHENIUS Reaction 2: A -> B + irr__2a109b21-bb24-41ae-8f06-7485fd36f1a7', 'admin'),
    -- Carbon Bond 5 Mechanism Reactions
    (LOWER(UUID()), 'carbon_bond_5_reaction1', 'ARRHENIUS Reaction 1: 2 * MEO2 -> FORM + HO2 + MEOH + irr__006fae85-6ca3-441e-b5ca-699fb48e73b6', 'admin'),
    (LOWER(UUID()), 'carbon_bond_5_reaction2', 'PHOTOLYSIS Reaction 1: M -> CO + irr__00fb05f5-7d54-4f5f-8ca6-874993128406', 'admin'),
    (LOWER(UUID()), 'carbon_bond_5_reaction3', 'ARRHENIUS Reaction 2: BENZENE + OH -> OH + BENZRO2 + irr__02066a44-7669-427c-8153-c77676471a76', 'admin'),
    -- Chapman Mechanism Reactions
    (LOWER(UUID()), 'chapman_reaction1', 'ARRHENIUS Reaction 1: O + O3 -> 2 * O2 + irr__071b97cd-d37e-41e1-9ff1-308e3179f910', 'admin'),
    (LOWER(UUID()), 'chapman_reaction2', 'PHOTOLYSIS Reaction 1: O2 -> 2 * O + irr__17773fe3-c1f6-4015-87e2-f20278517a59', 'admin'),
    (LOWER(UUID()), 'chapman_reaction3', 'ARRHENIUS Reaction 2: O + O2 + M -> O3 + M + irr__1fce6ca9-960d-4ef9-9435-b5e4ef3f1534', 'admin'),
    (LOWER(UUID()), 'chapman_reaction4', 'PHOTOLYSIS Reaction 2: O3 -> O1D + O2 + irr__427192a6-365c-4d22-9174-8ad91126afab', 'admin'),
    (LOWER(UUID()), 'chapman_reaction5', 'ARRHENIUS Reaction 3: O1D + O2 -> O + O2 + irr__93f71f99-b360-451d-b698-cc7f7cfe061b', 'admin'),
    (LOWER(UUID()), 'chapman_reaction6', 'ARRHENIUS Reaction 4: O1D + M -> O + M + irr__d41171b4-5f9b-4c24-9f0c-4a5bc0041ebc', 'admin'),
    (LOWER(UUID()), 'chapman_reaction7', 'PHOTOLYSIS Reaction 3: O3 -> O + O2 + irr__f6bf24e9-1b52-497b-b50c-74eaccc28120', 'admin'),
    -- Flow Tube Mechanism Reactions
    (LOWER(UUID()), 'flow_tube_reaction1', 'PHOTOLYSIS Reaction 1: SOA2 -> irr__3fddcf85-062e-4a73-be2c-8f3bbe3af3da', 'admin'),
    (LOWER(UUID()), 'flow_tube_reaction2', 'PHOTOLYSIS Reaction 2: SOA1 -> irr__49b12001-dc96-4a05-9715-e3cd05cb37d5', 'admin'),
    (LOWER(UUID()), 'flow_tube_reaction3', 'ARRHENIUS Reaction 1: O3 + a-pinene -> 0.18 * SOA1 + 0.09 * SOA2 + irr__d726e081-c0f1-4649-8947-4919aefd6ac8', 'admin');

-- 5. Link Reactions and Species in `reaction_species`

-- Note: For each INSERT, we need to include the 'id' field with LOWER(UUID()), and ensure that 'reaction_id' and 'species_id' are of type CHAR(36)

-- Analytical Mechanism Reactions

-- Reaction: B -> C + irr__089f1f45-4cd8-4278-83d5-d638e98e4315
-- Reactant: B
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.name = 'analytical_reaction1' AND s.name = 'B';

-- Products: C, irr__089f1f45-4cd8-4278-83d5-d638e98e4315
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.name = 'analytical_reaction1' AND s.name IN ('C', 'irr__089f1f45-4cd8-4278-83d5-d638e98e4315');

-- Reaction: A -> B + irr__2a109b21-bb24-41ae-8f06-7485fd36f1a7
-- Reactant: A
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.name = 'analytical_reaction2' AND s.name = 'A';

-- Products: B, irr__2a109b21-bb24-41ae-8f06-7485fd36f1a7
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.name = 'analytical_reaction2' AND s.name IN ('B', 'irr__2a109b21-bb24-41ae-8f06-7485fd36f1a7');

-- Carbon Bond 5 Mechanism Reactions

-- Reaction: 2 * MEO2 -> FORM + HO2 + MEOH + irr__006fae85-6ca3-441e-b5ca-699fb48e73b6
-- Reactant: MEO2
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.name = 'carbon_bond_5_reaction1' AND s.name = 'MEO2';

-- Products: FORM, HO2, MEOH, irr__006fae85-6ca3-441e-b5ca-699fb48e73b6
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.name = 'carbon_bond_5_reaction1' AND s.name IN ('FORM', 'HO2', 'MEOH', 'irr__006fae85-6ca3-441e-b5ca-699fb48e73b6');

-- Reaction: M -> CO + irr__00fb05f5-7d54-4f5f-8ca6-874993128406
-- Reactant: M
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.name = 'carbon_bond_5_reaction2' AND s.name = 'M';

-- Products: CO, irr__00fb05f5-7d54-4f5f-8ca6-874993128406
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.name = 'carbon_bond_5_reaction2' AND s.name IN ('CO', 'irr__00fb05f5-7d54-4f5f-8ca6-874993128406');

-- Reaction: BENZENE + OH -> OH + BENZRO2 + irr__02066a44-7669-427c-8153-c77676471a76
-- Reactants: BENZENE, OH
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.name = 'carbon_bond_5_reaction3' AND s.name IN ('BENZENE', 'OH');

-- Products: OH, BENZRO2, irr__02066a44-7669-427c-8153-c77676471a76
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.name = 'carbon_bond_5_reaction3' AND s.name IN ('OH', 'BENZRO2', 'irr__02066a44-7669-427c-8153-c77676471a76');

-- Chapman Mechanism Reactions

-- Reaction: O + O3 -> 2 * O2 + irr__071b97cd-d37e-41e1-9ff1-308e3179f910
-- Reactants: O, O3
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.name = 'chapman_reaction1' AND s.name IN ('O', 'O3');

-- Products: O2, irr__071b97cd-d37e-41e1-9ff1-308e3179f910
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.name = 'chapman_reaction1' AND s.name IN ('O2', 'irr__071b97cd-d37e-41e1-9ff1-308e3179f910');

-- Reaction: O2 -> 2 * O + irr__17773fe3-c1f6-4015-87e2-f20278517a59
-- Reactant: O2
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.name = 'chapman_reaction2' AND s.name = 'O2';

-- Products: O, irr__17773fe3-c1f6-4015-87e2-f20278517a59
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.name = 'chapman_reaction2' AND s.name IN ('O', 'irr__17773fe3-c1f6-4015-87e2-f20278517a59');

-- Reaction: O + O2 + M -> O3 + M + irr__1fce6ca9-960d-4ef9-9435-b5e4ef3f1534
-- Reactants: O, O2, M
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.name = 'chapman_reaction3' AND s.name IN ('O', 'O2', 'M');

-- Products: O3, M, irr__1fce6ca9-960d-4ef9-9435-b5e4ef3f1534
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.name = 'chapman_reaction3' AND s.name IN ('O3', 'M', 'irr__1fce6ca9-960d-4ef9-9435-b5e4ef3f1534');

-- Reaction: O3 -> O1D + O2 + irr__427192a6-365c-4d22-9174-8ad91126afab
-- Reactant: O3
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.name = 'chapman_reaction4' AND s.name = 'O3';

-- Products: O1D, O2, irr__427192a6-365c-4d22-9174-8ad91126afab
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.name = 'chapman_reaction4' AND s.name IN ('O1D', 'O2', 'irr__427192a6-365c-4d22-9174-8ad91126afab');

-- Reaction: O1D + O2 -> O + O2 + irr__93f71f99-b360-451d-b698-cc7f7cfe061b
-- Reactants: O1D, O2
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.name = 'chapman_reaction5' AND s.name IN ('O1D', 'O2');

-- Products: O, O2, irr__93f71f99-b360-451d-b698-cc7f7cfe061b
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.name = 'chapman_reaction5' AND s.name IN ('O', 'O2', 'irr__93f71f99-b360-451d-b698-cc7f7cfe061b');

-- Reaction: O1D + M -> O + M + irr__d41171b4-5f9b-4c24-9f0c-4a5bc0041ebc
-- Reactants: O1D, M
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.name = 'chapman_reaction6' AND s.name IN ('O1D', 'M');

-- Products: O, M, irr__d41171b4-5f9b-4c24-9f0c-4a5bc0041ebc
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.name = 'chapman_reaction6' AND s.name IN ('O', 'M', 'irr__d41171b4-5f9b-4c24-9f0c-4a5bc0041ebc');

-- Reaction: O3 -> O + O2 + irr__f6bf24e9-1b52-497b-b50c-74eaccc28120
-- Reactant: O3
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.name = 'chapman_reaction7' AND s.name = 'O3';

-- Products: O, O2, irr__f6bf24e9-1b52-497b-b50c-74eaccc28120
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.name = 'chapman_reaction7' AND s.name IN ('O', 'O2', 'irr__f6bf24e9-1b52-497b-b50c-74eaccc28120');

-- Flow Tube Mechanism Reactions

-- Reaction: SOA2 -> irr__3fddcf85-062e-4a73-be2c-8f3bbe3af3da
-- Reactant: SOA2
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.name = 'flow_tube_reaction1' AND s.name = 'SOA2';

-- Product: irr__3fddcf85-062e-4a73-be2c-8f3bbe3af3da
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.name = 'flow_tube_reaction1' AND s.name = 'irr__3fddcf85-062e-4a73-be2c-8f3bbe3af3da';

-- Reaction: SOA1 -> irr__49b12001-dc96-4a05-9715-e3cd05cb37d5
-- Reactant: SOA1
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.name = 'flow_tube_reaction2' AND s.name = 'SOA1';

-- Product: irr__49b12001-dc96-4a05-9715-e3cd05cb37d5
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.name = 'flow_tube_reaction2' AND s.name = 'irr__49b12001-dc96-4a05-9715-e3cd05cb37d5';

-- Reaction: O3 + a-pinene -> 0.18 * SOA1 + 0.09 * SOA2 + irr__d726e081-c0f1-4649-8947-4919aefd6ac8
-- Reactants: O3, a-pinene
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.name = 'flow_tube_reaction3' AND s.name IN ('O3', 'a-pinene');

-- Products: SOA1, SOA2, irr__d726e081-c0f1-4649-8947-4919aefd6ac8
INSERT INTO reaction_species (id, reaction_id, species_id, role)
SELECT LOWER(UUID()), r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.name = 'flow_tube_reaction3' AND s.name IN ('SOA1', 'SOA2', 'irr__d726e081-c0f1-4649-8947-4919aefd6ac8');

-- 6. Link Reactions to Mechanisms in `mechanism_reactions`

-- Analytical Mechanism
INSERT INTO mechanism_reactions (id, mechanism_id, reaction_id)
SELECT LOWER(UUID()), m.id, r.id
FROM mechanisms m, reactions r
WHERE m.name = 'analytical' AND r.name IN (
    'analytical_reaction1',
    'analytical_reaction2'
);

-- Carbon Bond 5 Mechanism
INSERT INTO mechanism_reactions (id, mechanism_id, reaction_id)
SELECT LOWER(UUID()), m.id, r.id
FROM mechanisms m, reactions r
WHERE m.name = 'carbon_bond_5' AND r.name IN (
    'carbon_bond_5_reaction1',
    'carbon_bond_5_reaction2',
    'carbon_bond_5_reaction3'
);

-- Chapman Mechanism
INSERT INTO mechanism_reactions (id, mechanism_id, reaction_id)
SELECT LOWER(UUID()), m.id, r.id
FROM mechanisms m, reactions r
WHERE m.name = 'chapman' AND r.name IN (
    'chapman_reaction1',
    'chapman_reaction2',
    'chapman_reaction3',
    'chapman_reaction4',
    'chapman_reaction5',
    'chapman_reaction6',
    'chapman_reaction7'
);

-- Flow Tube Mechanism
INSERT INTO mechanism_reactions (id, mechanism_id, reaction_id)
SELECT LOWER(UUID()), m.id, r.id
FROM mechanisms m, reactions r
WHERE m.name = 'flow_tube' AND r.name IN (
    'flow_tube_reaction1',
    'flow_tube_reaction2',
    'flow_tube_reaction3'
);

-- 7. Link Species to Mechanisms in `mechanism_species`

-- Analytical Mechanism
INSERT INTO mechanism_species (id, mechanism_id, species_id)
SELECT LOWER(UUID()), m.id, s.id
FROM mechanisms m, species s
WHERE m.name = 'analytical' AND s.name IN (
    'A', 'B', 'C', 'irr__089f1f45-4cd8-4278-83d5-d638e98e4315', 'irr__2a109b21-bb24-41ae-8f06-7485fd36f1a7'
);

-- Carbon Bond 5 Mechanism
INSERT INTO mechanism_species (id, mechanism_id, species_id)
SELECT LOWER(UUID()), m.id, s.id
FROM mechanisms m, species s
WHERE m.name = 'carbon_bond_5' AND s.name IN (
    'NO', 'NO2', 'HNO3', 'O3', 'H2O2', 'CO', 'SO2', 'HCL', 'CH4', 'ETHA',
    'FORM', 'MEOH', 'MEPX', 'ALD2', 'PAR', 'ETH', 'OLE', 'IOLE', 'TOL',
    'XYL', 'NTR', 'PAN', 'AACD', 'ROOH', 'ISOP', 'O2', 'H2', 'H2O',
    'OH', 'HO2', 'MEO2', 'BENZENE', 'BENZRO2',
    'irr__006fae85-6ca3-441e-b5ca-699fb48e73b6',
    'irr__00fb05f5-7d54-4f5f-8ca6-874993128406',
    'irr__02066a44-7669-427c-8153-c77676471a76'
);

-- Chapman Mechanism
INSERT INTO mechanism_species (id, mechanism_id, species_id)
SELECT LOWER(UUID()), m.id, s.id
FROM mechanisms m, species s
WHERE m.name = 'chapman' AND s.name IN (
    'M', 'Ar', 'CO2', 'H2O', 'O1D', 'O', 'O2', 'O3', 'N2',
    'irr__071b97cd-d37e-41e1-9ff1-308e3179f910',
    'irr__17773fe3-c1f6-4015-87e2-f20278517a59',
    'irr__1fce6ca9-960d-4ef9-9435-b5e4ef3f1534',
    'irr__427192a6-365c-4d22-9174-8ad91126afab',
    'irr__93f71f99-b360-451d-b698-cc7f7cfe061b',
    'irr__d41171b4-5f9b-4c24-9f0c-4a5bc0041ebc',
    'irr__f6bf24e9-1b52-497b-b50c-74eaccc28120'
);

-- Flow Tube Mechanism
INSERT INTO mechanism_species (id, mechanism_id, species_id)
SELECT LOWER(UUID()), m.id, s.id
FROM mechanisms m, species s
WHERE m.name = 'flow_tube' AND s.name IN (
    'irr__3fddcf85-062e-4a73-be2c-8f3bbe3af3da', 'irr__49b12001-dc96-4a05-9715-e3cd05cb37d5', 
    'irr__d726e081-c0f1-4649-8947-4919aefd6ac8', 'M', 'a-pinene', 'O3', 'SOA1', 'SOA2'
);

-- 8. Insert Initial Conditions

-- Analytical Mechanism Initial Conditions
INSERT INTO initial_conditions_species (
    id, mechanism_id, species_id, concentration, temperature, pressure, additional_conditions
) VALUES
    -- Species A
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'analytical'),
        (SELECT id FROM species WHERE name = 'A'),
        1.0,
        272.5,
        101253.3,
        'Initial concentration for species A'
    ),
    -- Species B
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'analytical'),
        (SELECT id FROM species WHERE name = 'B'),
        0.0,
        272.5,
        101253.3,
        'Initial concentration for species B'
    ),
    -- Species C
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'analytical'),
        (SELECT id FROM species WHERE name = 'C'),
        0.0,
        272.5,
        101253.3,
        'Initial concentration for species C'
    );

-- Carbon Bond 5 Mechanism Initial Conditions
INSERT INTO initial_conditions_species (
    id, mechanism_id, species_id, concentration, temperature, pressure, additional_conditions
) VALUES
    -- NO
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'NO'),
        4.1e-09,
        298.15,
        101325,
        'Initial concentration for NO'
    ),
    -- NO2
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'NO2'),
        4.1e-08,
        298.15,
        101325,
        'Initial concentration for NO2'
    ),
    -- HNO3
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'HNO3'),
        4.1e-08,
        298.15,
        101325,
        'Initial concentration for HNO3'
    ),
    -- O3
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'O3'),
        2e-06,
        298.15,
        101325,
        'Initial concentration for O3'
    ),
    -- H2O2
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'H2O2'),
        4.5e-08,
        298.15,
        101325,
        'Initial concentration for H2O2'
    ),
    -- CO
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'CO'),
        8.6e-06,
        298.15,
        101325,
        'Initial concentration for CO'
    ),
    -- SO2
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'SO2'),
        3.3e-08,
        298.15,
        101325,
        'Initial concentration for SO2'
    ),
    -- HCL
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'HCL'),
        2.9e-08,
        298.15,
        101325,
        'Initial concentration for HCL'
    ),
    -- CH4
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'CH4'),
        9e-05,
        298.15,
        101325,
        'Initial concentration for CH4'
    );

-- Chapman Mechanism Initial Conditions
INSERT INTO initial_conditions_species (
    id, mechanism_id, species_id, concentration, temperature, pressure, additional_conditions
) VALUES
    -- Ar
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'chapman'),
        (SELECT id FROM species WHERE name = 'Ar'),
        0.0334,
        206.6374207,
        6152.049805,
        'Initial concentration for Ar'
    ),
    -- CO2
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'chapman'),
        (SELECT id FROM species WHERE name = 'CO2'),
        0.00146,
        206.6374207,
        6152.049805,
        'Initial concentration for CO2'
    ),
    -- H2O
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'chapman'),
        (SELECT id FROM species WHERE name = 'H2O'),
        1.19e-05,
        206.6374207,
        6152.049805,
        'Initial concentration for H2O'
    ),
    -- O2
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'chapman'),
        (SELECT id FROM species WHERE name = 'O2'),
        0.75,
        206.6374207,
        6152.049805,
        'Initial concentration for O2'
    ),
    -- O3
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'chapman'),
        (SELECT id FROM species WHERE name = 'O3'),
        8.1e-06,
        206.6374207,
        6152.049805,
        'Initial concentration for O3'
    );

-- Flow Tube Mechanism Initial Conditions
INSERT INTO initial_conditions_species (
    id, mechanism_id, species_id, concentration, temperature, pressure, additional_conditions
) VALUES
    -- a-pinene
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'flow_tube'),
        (SELECT id FROM species WHERE name = 'a-pinene'),
        8e-08,
        298.15,
        101325.0,
        'Initial concentration for a-pinene'
    ),
    -- O3
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'flow_tube'),
        (SELECT id FROM species WHERE name = 'O3'),
        2e-05,
        298.15,
        101325.0,
        'Initial concentration for O3'
    ),
    -- M
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'flow_tube'),
        (SELECT id FROM species WHERE name = 'M'),
        0.0,
        298.15,
        101325.0,
        'Initial concentration for M'
    ),
    -- SOA1
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'flow_tube'),
        (SELECT id FROM species WHERE name = 'SOA1'),
        0.0,
        298.15,
        101325.0,
        'Initial concentration for SOA1'
    ),
    -- SOA2
    (
        LOWER(UUID()),
        (SELECT id FROM mechanisms WHERE name = 'flow_tube'),
        (SELECT id FROM species WHERE name = 'SOA2'),
        0.0,
        298.15,
        101325.0,
        'Initial concentration for SOA2'
    );

-- 9. Insert Users and User-Mechanism Relationships

-- Insert users
INSERT IGNORE INTO users (id, username, role, email) VALUES 
    (LOWER(UUID()), 'admin', 'admin', 'admin@ncar.org'),
    (LOWER(UUID()), 'Oreoluwa Ogunleye-Olawuyi', 'admin', 'ore2484@tamu.edu'),
    (LOWER(UUID()), 'Joshua Hare', 'admin', 'jmhhare@tamu.edu'),
    (LOWER(UUID()), 'Nishka Mittal', 'admin', 'nishka06@tamu.edu'),
    (LOWER(UUID()), 'Sydney Ferris', 'admin', 'sferris@tamu.edu'),
    (LOWER(UUID()), 'Kyle Shores', 'admin', 'kshores@ucar.edu');

-- Link users to mechanisms
INSERT INTO user_mechanisms (id, user_id, mechanism_id, role) VALUES
    (
        LOWER(UUID()),
        (SELECT id FROM users WHERE username = 'admin'),
        (SELECT id FROM mechanisms WHERE name = 'analytical'),
        'admin'
    ),
    (
        LOWER(UUID()),
        (SELECT id FROM users WHERE username = 'admin'),
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        'admin'
    ),
    (
        LOWER(UUID()),
        (SELECT id FROM users WHERE username = 'admin'),
        (SELECT id FROM mechanisms WHERE name = 'chapman'),
        'admin'
    ),
    (
        LOWER(UUID()),
        (SELECT id FROM users WHERE username = 'admin'),
        (SELECT id FROM mechanisms WHERE name = 'flow_tube'),
        'admin'
    );

-- 10. Enhancements

-- Create indexes on frequently queried columns to improve performance
CREATE INDEX idx_species_name ON species(name);
CREATE INDEX idx_reactions_name ON reactions(name); -- Updated to index 'name' instead of 'equation'
CREATE INDEX idx_mechanisms_name ON mechanisms(name);
CREATE INDEX idx_users_username ON users(username);
