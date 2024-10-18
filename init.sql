-- 1. Create Tables

-- Table to store information about chemical species
CREATE TABLE species (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE, -- UNIQUE constraint to prevent duplicates
    description TEXT,
    created_by VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store chemical reactions
CREATE TABLE reactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equation VARCHAR(512) NOT NULL UNIQUE, -- Changed from TEXT to VARCHAR(1024)
    description TEXT,
    created_by VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Table to store families of mechanisms
CREATE TABLE families (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL, -- UNIQUE constraint
    description TEXT,
    created_by VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store mechanisms and their metadata
CREATE TABLE mechanisms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    family_id INT NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL, -- UNIQUE constraint
    description TEXT,
    created_by VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
);

-- Table to store different versions of mechanisms
CREATE TABLE mechanism_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mechanism_id INT NOT NULL,
    version_number INT NOT NULL,
    tag VARCHAR(50),
    created_by VARCHAR(255),
    published_date TIMESTAMP,
    UNIQUE KEY unique_mechanism_version (mechanism_id, version_number), -- Ensures unique version numbers per mechanism
    FOREIGN KEY (mechanism_id) REFERENCES mechanisms(id) ON DELETE CASCADE
);

-- Table to store relationships between reactions and species
CREATE TABLE reaction_species (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reaction_id INT NOT NULL,
    species_id INT NOT NULL,
    role ENUM('reactant', 'product') NOT NULL, -- Enforces valid roles
    UNIQUE KEY unique_reaction_species_role (reaction_id, species_id, role), -- Prevents duplicate role assignments
    FOREIGN KEY (reaction_id) REFERENCES reactions(id) ON DELETE CASCADE,
    FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE
);

-- Table to store relationships between mechanisms and reactions
CREATE TABLE mechanism_reactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mechanism_id INT NOT NULL,
    reaction_id INT NOT NULL,
    UNIQUE KEY unique_mechanism_reaction (mechanism_id, reaction_id), -- Prevents duplicate mappings
    FOREIGN KEY (mechanism_id) REFERENCES mechanisms(id) ON DELETE CASCADE,
    FOREIGN KEY (reaction_id) REFERENCES reactions(id) ON DELETE CASCADE
);

-- Table to store relationships between mechanisms and species
CREATE TABLE mechanism_species (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mechanism_id INT NOT NULL,
    species_id INT NOT NULL,
    UNIQUE KEY unique_mechanism_species (mechanism_id, species_id), -- Prevents duplicate mappings
    FOREIGN KEY (mechanism_id) REFERENCES mechanisms(id) ON DELETE CASCADE,
    FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE
);

-- Table to store initial conditions specific to species within a mechanism
CREATE TABLE initial_conditions_species (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mechanism_id INT NOT NULL,
    species_id INT NOT NULL,
    concentration DOUBLE,
    temperature DOUBLE,
    pressure DOUBLE,
    additional_conditions TEXT,
    UNIQUE KEY unique_initial_conditions (mechanism_id, species_id), -- Ensures one initial condition per species per mechanism
    FOREIGN KEY (mechanism_id) REFERENCES mechanisms(id) ON DELETE CASCADE,
    FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE
);

-- Table to store users and their roles (admin, researcher, etc.)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL, -- Role could be 'admin', 'researcher', etc.
    email VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store the relationship between users and mechanisms
CREATE TABLE user_mechanisms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mechanism_id INT NOT NULL,
    role VARCHAR(50), -- Role could be 'owner', 'contributor', etc.
    UNIQUE KEY unique_user_mechanism_role (user_id, mechanism_id, role), -- Prevents duplicate role assignments
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mechanism_id) REFERENCES mechanisms(id) ON DELETE CASCADE
);

-- 2. Insert Data into `families` and `mechanisms`

-- Insert families
INSERT INTO families (name, description, created_by) VALUES 
    ('Combustion Reactions', 'Family of reactions related to combustion processes', 'admin'),
    ('Carbon Bond Mechanisms', 'Family of carbon bond mechanisms for atmospheric chemistry', 'admin'),
    ('Chapman Mechanism', 'Chapman mechanism for ozone chemistry modeling', 'admin'),
    ('Flow Tube Mechanism', 'Flow Tube mechanism for aerosol chemistry modeling', 'admin');

-- Insert mechanisms
INSERT INTO mechanisms (family_id, name, description, created_by) VALUES 
    ((SELECT id FROM families WHERE name = 'Combustion Reactions'), 'analytical', 'Analytical mechanism for testing purposes', 'admin'),
    ((SELECT id FROM families WHERE name = 'Carbon Bond Mechanisms'), 'carbon_bond_5', 'Carbon Bond 5 mechanism for atmospheric chemistry modeling', 'admin'),
    ((SELECT id FROM families WHERE name = 'Chapman Mechanism'), 'chapman', 'Chapman mechanism for ozone chemistry modeling', 'admin'),
    ((SELECT id FROM families WHERE name = 'Flow Tube Mechanism'), 'flow_tube', 'Flow Tube mechanism for aerosol chemistry modeling', 'admin');

-- 3. Insert Species Data

-- Insert species, ensuring no duplicates
INSERT IGNORE INTO species (name, description, created_by) VALUES
    -- Species for Analytical Mechanism
    ('A', 'Chemical Species A', 'admin'),
    ('B', 'Chemical Species B', 'admin'),
    ('C', 'Chemical Species C', 'admin'),
    ('irr__089f1f45-4cd8-4278-83d5-d638e98e4315', 'Intermediate Reactant 1', 'admin'),
    ('irr__2a109b21-bb24-41ae-8f06-7485fd36f1a7', 'Intermediate Reactant 2', 'admin'),
    -- Species for Carbon Bond 5 Mechanism
    ('NO', 'Nitric Oxide', 'admin'),
    ('NO2', 'Nitrogen Dioxide', 'admin'),
    ('HNO3', 'Nitric Acid', 'admin'),
    ('O3', 'Ozone', 'admin'),
    ('H2O2', 'Hydrogen Peroxide', 'admin'),
    ('CO', 'Carbon Monoxide', 'admin'),
    ('SO2', 'Sulfur Dioxide', 'admin'),
    ('HCL', 'Hydrochloric Acid', 'admin'),
    ('CH4', 'Methane', 'admin'),
    ('ETHA', 'Ethane', 'admin'),
    ('FORM', 'Formaldehyde', 'admin'),
    ('MEOH', 'Methanol', 'admin'),
    ('MEPX', 'Methoxy Peroxy Radical', 'admin'),
    ('ALD2', 'Acetaldehyde', 'admin'),
    ('PAR', 'Paraffin Carbon Bond', 'admin'),
    ('ETH', 'Ethylene', 'admin'),
    ('OLE', 'Olefins', 'admin'),
    ('IOLE', 'Isoprene', 'admin'),
    ('TOL', 'Toluene', 'admin'),
    ('XYL', 'Xylene', 'admin'),
    ('NTR', 'Nitrate Radical', 'admin'),
    ('PAN', 'Peroxyacetyl Nitrate', 'admin'),
    ('AACD', 'Acetaldehyde Carbonyl', 'admin'),
    ('ROOH', 'Hydroperoxide Radical', 'admin'),
    ('ISOP', 'Isoprene', 'admin'),
    ('O2', 'Oxygen Molecule', 'admin'),
    ('H2', 'Hydrogen', 'admin'),
    ('H2O', 'Water', 'admin'),
    ('OH', 'Hydroxyl Radical', 'admin'),
    ('HO2', 'Hydroperoxy Radical', 'admin'),
    ('MEO2', 'Methylperoxy Radical', 'admin'),
    ('BENZENE', 'Benzene', 'admin'),
    ('BENZRO2', 'Benzylperoxy Radical', 'admin'),
    ('irr__006fae85-6ca3-441e-b5ca-699fb48e73b6', 'Intermediate Species', 'admin'),
    ('irr__00fb05f5-7d54-4f5f-8ca6-874993128406', 'Intermediate Species', 'admin'),
    ('irr__02066a44-7669-427c-8153-c77676471a76', 'Intermediate Species', 'admin'),
    -- Species for Chapman Mechanism
    ('M', 'Third Body Species', 'admin'),
    ('Ar', 'Argon', 'admin'),
    ('CO2', 'Carbon Dioxide', 'admin'),
    ('O1D', 'Oxygen Atom Excited State', 'admin'),
    ('O', 'Oxygen Atom', 'admin'),
    ('N2', 'Nitrogen Molecule', 'admin'),
    ('irr__071b97cd-d37e-41e1-9ff1-308e3179f910', 'Intermediate Species 1', 'admin'),
    ('irr__17773fe3-c1f6-4015-87e2-f20278517a59', 'Intermediate Species 2', 'admin'),
    ('irr__1fce6ca9-960d-4ef9-9435-b5e4ef3f1534', 'Intermediate Species 3', 'admin'),
    ('irr__427192a6-365c-4d22-9174-8ad91126afab', 'Intermediate Species 4', 'admin'),
    ('irr__93f71f99-b360-451d-b698-cc7f7cfe061b', 'Intermediate Species 5', 'admin'),
    ('irr__d41171b4-5f9b-4c24-9f0c-4a5bc0041ebc', 'Intermediate Species 6', 'admin'),
    ('irr__f6bf24e9-1b52-497b-b50c-74eaccc28120', 'Intermediate Species 7', 'admin'),
    -- Species for Flow Tube Mechanism
    ('irr__3fddcf85-062e-4a73-be2c-8f3bbe3af3da', 'Intermediate Species 1', 'admin'),
    ('irr__49b12001-dc96-4a05-9715-e3cd05cb37d5', 'Intermediate Species 2', 'admin'),
    ('irr__d726e081-c0f1-4649-8947-4919aefd6ac8', 'Intermediate Species 3', 'admin'),
    ('a-pinene', 'Alpha-Pinene', 'admin'),
    ('SOA1', 'Secondary Organic Aerosol 1', 'admin'),
    ('SOA2', 'Secondary Organic Aerosol 2', 'admin');

-- 4. Insert Reaction Data

-- Insert reactions for all mechanisms
INSERT IGNORE INTO reactions (equation, description, created_by) VALUES
    -- Analytical Mechanism Reactions
    ('B -> C + irr__089f1f45-4cd8-4278-83d5-d638e98e4315', 'ARRHENIUS Reaction 1', 'admin'),
    ('A -> B + irr__2a109b21-bb24-41ae-8f06-7485fd36f1a7', 'ARRHENIUS Reaction 2', 'admin'),
    -- Carbon Bond 5 Mechanism Reactions
    ('2 * MEO2 -> FORM + HO2 + MEOH + irr__006fae85-6ca3-441e-b5ca-699fb48e73b6', 'ARRHENIUS Reaction 1', 'admin'),
    ('M -> CO + irr__00fb05f5-7d54-4f5f-8ca6-874993128406', 'PHOTOLYSIS Reaction 1', 'admin'),
    ('BENZENE + OH -> OH + BENZRO2 + irr__02066a44-7669-427c-8153-c77676471a76', 'ARRHENIUS Reaction 2', 'admin'),
    -- Chapman Mechanism Reactions
    ('O + O3 -> 2 * O2 + irr__071b97cd-d37e-41e1-9ff1-308e3179f910', 'ARRHENIUS Reaction 1', 'admin'),
    ('O2 -> 2 * O + irr__17773fe3-c1f6-4015-87e2-f20278517a59', 'PHOTOLYSIS Reaction 1', 'admin'),
    ('O + O2 + M -> O3 + M + irr__1fce6ca9-960d-4ef9-9435-b5e4ef3f1534', 'ARRHENIUS Reaction 2', 'admin'),
    ('O3 -> O1D + O2 + irr__427192a6-365c-4d22-9174-8ad91126afab', 'PHOTOLYSIS Reaction 2', 'admin'),
    ('O1D + O2 -> O + O2 + irr__93f71f99-b360-451d-b698-cc7f7cfe061b', 'ARRHENIUS Reaction 3', 'admin'),
    ('O1D + M -> O + M + irr__d41171b4-5f9b-4c24-9f0c-4a5bc0041ebc', 'ARRHENIUS Reaction 4', 'admin'),
    ('O3 -> O + O2 + irr__f6bf24e9-1b52-497b-b50c-74eaccc28120', 'PHOTOLYSIS Reaction 3', 'admin'),
    -- Flow Tube Mechanism Reactions
    ('SOA2 -> irr__3fddcf85-062e-4a73-be2c-8f3bbe3af3da', 'PHOTOLYSIS Reaction 1', 'admin'),
    ('SOA1 -> irr__49b12001-dc96-4a05-9715-e3cd05cb37d5', 'PHOTOLYSIS Reaction 2', 'admin'),
    ('O3 + a-pinene -> 0.18 * SOA1 + 0.09 * SOA2 + irr__d726e081-c0f1-4649-8947-4919aefd6ac8', 'ARRHENIUS Reaction 1', 'admin');

-- 5. Link Reactions and Species in `reaction_species`

-- Analytical Mechanism Reactions

-- Reaction: B -> C + irr__089f1f45-4cd8-4278-83d5-d638e98e4315
-- Reactant: B
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.equation = 'B -> C + irr__089f1f45-4cd8-4278-83d5-d638e98e4315' AND s.name = 'B';

-- Products: C, irr__089f1f45-4cd8-4278-83d5-d638e98e4315
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.equation = 'B -> C + irr__089f1f45-4cd8-4278-83d5-d638e98e4315' AND s.name IN ('C', 'irr__089f1f45-4cd8-4278-83d5-d638e98e4315');

-- Reaction: A -> B + irr__2a109b21-bb24-41ae-8f06-7485fd36f1a7
-- Reactant: A
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.equation = 'A -> B + irr__2a109b21-bb24-41ae-8f06-7485fd36f1a7' AND s.name = 'A';

-- Products: B, irr__2a109b21-bb24-41ae-8f06-7485fd36f1a7
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.equation = 'A -> B + irr__2a109b21-bb24-41ae-8f06-7485fd36f1a7' AND s.name IN ('B', 'irr__2a109b21-bb24-41ae-8f06-7485fd36f1a7');

-- Carbon Bond 5 Mechanism Reactions

-- Reaction: 2 * MEO2 -> FORM + HO2 + MEOH + irr__006fae85-6ca3-441e-b5ca-699fb48e73b6
-- Reactant: MEO2
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.equation = '2 * MEO2 -> FORM + HO2 + MEOH + irr__006fae85-6ca3-441e-b5ca-699fb48e73b6' AND s.name = 'MEO2';

-- Products: FORM, HO2, MEOH, irr__006fae85-6ca3-441e-b5ca-699fb48e73b6
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.equation = '2 * MEO2 -> FORM + HO2 + MEOH + irr__006fae85-6ca3-441e-b5ca-699fb48e73b6' AND s.name IN ('FORM', 'HO2', 'MEOH', 'irr__006fae85-6ca3-441e-b5ca-699fb48e73b6');

-- Reaction: M -> CO + irr__00fb05f5-7d54-4f5f-8ca6-874993128406
-- Reactant: M
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.equation = 'M -> CO + irr__00fb05f5-7d54-4f5f-8ca6-874993128406' AND s.name = 'M';

-- Products: CO, irr__00fb05f5-7d54-4f5f-8ca6-874993128406
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.equation = 'M -> CO + irr__00fb05f5-7d54-4f5f-8ca6-874993128406' AND s.name IN ('CO', 'irr__00fb05f5-7d54-4f5f-8ca6-874993128406');

-- Reaction: BENZENE + OH -> OH + BENZRO2 + irr__02066a44-7669-427c-8153-c77676471a76
-- Reactants: BENZENE, OH
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.equation = 'BENZENE + OH -> OH + BENZRO2 + irr__02066a44-7669-427c-8153-c77676471a76' AND s.name IN ('BENZENE', 'OH');

-- Products: OH, BENZRO2, irr__02066a44-7669-427c-8153-c77676471a76
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.equation = 'BENZENE + OH -> OH + BENZRO2 + irr__02066a44-7669-427c-8153-c77676471a76' AND s.name IN ('OH', 'BENZRO2', 'irr__02066a44-7669-427c-8153-c77676471a76');

-- Chapman Mechanism Reactions

-- Reaction: O + O3 -> 2 * O2 + irr__071b97cd-d37e-41e1-9ff1-308e3179f910
-- Reactants: O, O3
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.equation = 'O + O3 -> 2 * O2 + irr__071b97cd-d37e-41e1-9ff1-308e3179f910' AND s.name IN ('O', 'O3');

-- Products: O2, irr__071b97cd-d37e-41e1-9ff1-308e3179f910
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.equation = 'O + O3 -> 2 * O2 + irr__071b97cd-d37e-41e1-9ff1-308e3179f910' AND s.name IN ('O2', 'irr__071b97cd-d37e-41e1-9ff1-308e3179f910');

-- Reaction: O2 -> 2 * O + irr__17773fe3-c1f6-4015-87e2-f20278517a59
-- Reactant: O2
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.equation = 'O2 -> 2 * O + irr__17773fe3-c1f6-4015-87e2-f20278517a59' AND s.name = 'O2';

-- Products: O, irr__17773fe3-c1f6-4015-87e2-f20278517a59
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.equation = 'O2 -> 2 * O + irr__17773fe3-c1f6-4015-87e2-f20278517a59' AND s.name IN ('O', 'irr__17773fe3-c1f6-4015-87e2-f20278517a59');

-- Reaction: O + O2 + M -> O3 + M + irr__1fce6ca9-960d-4ef9-9435-b5e4ef3f1534
-- Reactants: O, O2, M
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.equation = 'O + O2 + M -> O3 + M + irr__1fce6ca9-960d-4ef9-9435-b5e4ef3f1534' AND s.name IN ('O', 'O2', 'M');

-- Products: O3, M, irr__1fce6ca9-960d-4ef9-9435-b5e4ef3f1534
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.equation = 'O + O2 + M -> O3 + M + irr__1fce6ca9-960d-4ef9-9435-b5e4ef3f1534' AND s.name IN ('O3', 'M', 'irr__1fce6ca9-960d-4ef9-9435-b5e4ef3f1534');

-- Reaction: O3 -> O1D + O2 + irr__427192a6-365c-4d22-9174-8ad91126afab
-- Reactant: O3
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.equation = 'O3 -> O1D + O2 + irr__427192a6-365c-4d22-9174-8ad91126afab' AND s.name = 'O3';

-- Products: O1D, O2, irr__427192a6-365c-4d22-9174-8ad91126afab
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.equation = 'O3 -> O1D + O2 + irr__427192a6-365c-4d22-9174-8ad91126afab' AND s.name IN ('O1D', 'O2', 'irr__427192a6-365c-4d22-9174-8ad91126afab');

-- Reaction: O1D + O2 -> O + O2 + irr__93f71f99-b360-451d-b698-cc7f7cfe061b
-- Reactants: O1D, O2
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.equation = 'O1D + O2 -> O + O2 + irr__93f71f99-b360-451d-b698-cc7f7cfe061b' AND s.name IN ('O1D', 'O2');

-- Products: O, O2, irr__93f71f99-b360-451d-b698-cc7f7cfe061b
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.equation = 'O1D + O2 -> O + O2 + irr__93f71f99-b360-451d-b698-cc7f7cfe061b' AND s.name IN ('O', 'O2', 'irr__93f71f99-b360-451d-b698-cc7f7cfe061b');

-- Reaction: O1D + M -> O + M + irr__d41171b4-5f9b-4c24-9f0c-4a5bc0041ebc
-- Reactants: O1D, M
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.equation = 'O1D + M -> O + M + irr__d41171b4-5f9b-4c24-9f0c-4a5bc0041ebc' AND s.name IN ('O1D', 'M');

-- Products: O, M, irr__d41171b4-5f9b-4c24-9f0c-4a5bc0041ebc
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.equation = 'O1D + M -> O + M + irr__d41171b4-5f9b-4c24-9f0c-4a5bc0041ebc' AND s.name IN ('O', 'M', 'irr__d41171b4-5f9b-4c24-9f0c-4a5bc0041ebc');

-- Reaction: O3 -> O + O2 + irr__f6bf24e9-1b52-497b-b50c-74eaccc28120
-- Reactant: O3
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.equation = 'O3 -> O + O2 + irr__f6bf24e9-1b52-497b-b50c-74eaccc28120' AND s.name = 'O3';

-- Products: O, O2, irr__f6bf24e9-1b52-497b-b50c-74eaccc28120
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.equation = 'O3 -> O + O2 + irr__f6bf24e9-1b52-497b-b50c-74eaccc28120' AND s.name IN ('O', 'O2', 'irr__f6bf24e9-1b52-497b-b50c-74eaccc28120');

-- Flow Tube Mechanism Reactions

-- Reaction: SOA2 -> irr__3fddcf85-062e-4a73-be2c-8f3bbe3af3da
-- Reactant: SOA2
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.equation = 'SOA2 -> irr__3fddcf85-062e-4a73-be2c-8f3bbe3af3da' AND s.name = 'SOA2';

-- Product: irr__3fddcf85-062e-4a73-be2c-8f3bbe3af3da
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.equation = 'SOA2 -> irr__3fddcf85-062e-4a73-be2c-8f3bbe3af3da' AND s.name = 'irr__3fddcf85-062e-4a73-be2c-8f3bbe3af3da';

-- Reaction: SOA1 -> irr__49b12001-dc96-4a05-9715-e3cd05cb37d5
-- Reactant: SOA1
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.equation = 'SOA1 -> irr__49b12001-dc96-4a05-9715-e3cd05cb37d5' AND s.name = 'SOA1';

-- Product: irr__49b12001-dc96-4a05-9715-e3cd05cb37d5
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.equation = 'SOA1 -> irr__49b12001-dc96-4a05-9715-e3cd05cb37d5' AND s.name = 'irr__49b12001-dc96-4a05-9715-e3cd05cb37d5';

-- Reaction: O3 + a-pinene -> 0.18 * SOA1 + 0.09 * SOA2 + irr__d726e081-c0f1-4649-8947-4919aefd6ac8
-- Reactants: O3, a-pinene
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'reactant'
FROM reactions r, species s
WHERE r.equation = 'O3 + a-pinene -> 0.18 * SOA1 + 0.09 * SOA2 + irr__d726e081-c0f1-4649-8947-4919aefd6ac8' AND s.name IN ('O3', 'a-pinene');

-- Products: SOA1, SOA2, irr__d726e081-c0f1-4649-8947-4919aefd6ac8
INSERT INTO reaction_species (reaction_id, species_id, role)
SELECT r.id, s.id, 'product'
FROM reactions r, species s
WHERE r.equation = 'O3 + a-pinene -> 0.18 * SOA1 + 0.09 * SOA2 + irr__d726e081-c0f1-4649-8947-4919aefd6ac8' AND s.name IN ('SOA1', 'SOA2', 'irr__d726e081-c0f1-4649-8947-4919aefd6ac8');

-- 6. Link Reactions to Mechanisms in `mechanism_reactions`

-- Analytical Mechanism
INSERT INTO mechanism_reactions (mechanism_id, reaction_id)
SELECT m.id, r.id
FROM mechanisms m, reactions r
WHERE m.name = 'analytical' AND r.equation IN (
    'B -> C + irr__089f1f45-4cd8-4278-83d5-d638e98e4315',
    'A -> B + irr__2a109b21-bb24-41ae-8f06-7485fd36f1a7'
);

-- Carbon Bond 5 Mechanism
INSERT INTO mechanism_reactions (mechanism_id, reaction_id)
SELECT m.id, r.id
FROM mechanisms m, reactions r
WHERE m.name = 'carbon_bond_5' AND r.equation IN (
    '2 * MEO2 -> FORM + HO2 + MEOH + irr__006fae85-6ca3-441e-b5ca-699fb48e73b6',
    'M -> CO + irr__00fb05f5-7d54-4f5f-8ca6-874993128406',
    'BENZENE + OH -> OH + BENZRO2 + irr__02066a44-7669-427c-8153-c77676471a76'
);

-- Chapman Mechanism
INSERT INTO mechanism_reactions (mechanism_id, reaction_id)
SELECT m.id, r.id
FROM mechanisms m, reactions r
WHERE m.name = 'chapman' AND r.equation IN (
    'O + O3 -> 2 * O2 + irr__071b97cd-d37e-41e1-9ff1-308e3179f910',
    'O2 -> 2 * O + irr__17773fe3-c1f6-4015-87e2-f20278517a59',
    'O + O2 + M -> O3 + M + irr__1fce6ca9-960d-4ef9-9435-b5e4ef3f1534',
    'O3 -> O1D + O2 + irr__427192a6-365c-4d22-9174-8ad91126afab',
    'O1D + O2 -> O + O2 + irr__93f71f99-b360-451d-b698-cc7f7cfe061b',
    'O1D + M -> O + M + irr__d41171b4-5f9b-4c24-9f0c-4a5bc0041ebc',
    'O3 -> O + O2 + irr__f6bf24e9-1b52-497b-b50c-74eaccc28120'
);

-- Flow Tube Mechanism
INSERT INTO mechanism_reactions (mechanism_id, reaction_id)
SELECT m.id, r.id
FROM mechanisms m, reactions r
WHERE m.name = 'flow_tube' AND r.equation IN (
    'SOA2 -> irr__3fddcf85-062e-4a73-be2c-8f3bbe3af3da',
    'SOA1 -> irr__49b12001-dc96-4a05-9715-e3cd05cb37d5',
    'O3 + a-pinene -> 0.18 * SOA1 + 0.09 * SOA2 + irr__d726e081-c0f1-4649-8947-4919aefd6ac8'
);

-- 7. Link Species to Mechanisms in `mechanism_species`

-- Analytical Mechanism
INSERT INTO mechanism_species (mechanism_id, species_id)
SELECT m.id, s.id
FROM mechanisms m, species s
WHERE m.name = 'analytical' AND s.name IN (
    'A', 'B', 'C', 'irr__089f1f45-4cd8-4278-83d5-d638e98e4315', 'irr__2a109b21-bb24-41ae-8f06-7485fd36f1a7'
);

-- Carbon Bond 5 Mechanism
INSERT INTO mechanism_species (mechanism_id, species_id)
SELECT m.id, s.id
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
INSERT INTO mechanism_species (mechanism_id, species_id)
SELECT m.id, s.id
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
INSERT INTO mechanism_species (mechanism_id, species_id)
SELECT m.id, s.id
FROM mechanisms m, species s
WHERE m.name = 'flow_tube' AND s.name IN (
    'irr__3fddcf85-062e-4a73-be2c-8f3bbe3af3da', 'irr__49b12001-dc96-4a05-9715-e3cd05cb37d5', 
    'irr__d726e081-c0f1-4649-8947-4919aefd6ac8', 'M', 'a-pinene', 'O3', 'SOA1', 'SOA2'
);

-- 8. Insert Initial Conditions

-- Analytical Mechanism Initial Conditions
INSERT INTO initial_conditions_species (
    mechanism_id, species_id, concentration, temperature, pressure, additional_conditions
) VALUES
    -- Species A
    (
        (SELECT id FROM mechanisms WHERE name = 'analytical'),
        (SELECT id FROM species WHERE name = 'A'),
        1.0,
        272.5,
        101253.3,
        'Initial concentration for species A'
    ),
    -- Species B
    (
        (SELECT id FROM mechanisms WHERE name = 'analytical'),
        (SELECT id FROM species WHERE name = 'B'),
        0.0,
        272.5,
        101253.3,
        'Initial concentration for species B'
    ),
    -- Species C
    (
        (SELECT id FROM mechanisms WHERE name = 'analytical'),
        (SELECT id FROM species WHERE name = 'C'),
        0.0,
        272.5,
        101253.3,
        'Initial concentration for species C'
    );

-- Carbon Bond 5 Mechanism Initial Conditions
INSERT INTO initial_conditions_species (
    mechanism_id, species_id, concentration, temperature, pressure, additional_conditions
) VALUES
    -- NO
    (
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'NO'),
        4.1e-09,
        298.15,
        101325,
        'Initial concentration for NO'
    ),
    -- NO2
    (
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'NO2'),
        4.1e-08,
        298.15,
        101325,
        'Initial concentration for NO2'
    ),
    -- HNO3
    (
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'HNO3'),
        4.1e-08,
        298.15,
        101325,
        'Initial concentration for HNO3'
    ),
    -- O3
    (
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'O3'),
        2e-06,
        298.15,
        101325,
        'Initial concentration for O3'
    ),
    -- H2O2
    (
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'H2O2'),
        4.5e-08,
        298.15,
        101325,
        'Initial concentration for H2O2'
    ),
    -- CO
    (
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'CO'),
        8.6e-06,
        298.15,
        101325,
        'Initial concentration for CO'
    ),
    -- SO2
    (
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'SO2'),
        3.3e-08,
        298.15,
        101325,
        'Initial concentration for SO2'
    ),
    -- HCL
    (
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'HCL'),
        2.9e-08,
        298.15,
        101325,
        'Initial concentration for HCL'
    ),
    -- CH4
    (
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        (SELECT id FROM species WHERE name = 'CH4'),
        9e-05,
        298.15,
        101325,
        'Initial concentration for CH4'
    );

-- Chapman Mechanism Initial Conditions
INSERT INTO initial_conditions_species (
    mechanism_id, species_id, concentration, temperature, pressure, additional_conditions
) VALUES
    -- Ar
    (
        (SELECT id FROM mechanisms WHERE name = 'chapman'),
        (SELECT id FROM species WHERE name = 'Ar'),
        0.0334,
        206.6374207,
        6152.049805,
        'Initial concentration for Ar'
    ),
    -- CO2
    (
        (SELECT id FROM mechanisms WHERE name = 'chapman'),
        (SELECT id FROM species WHERE name = 'CO2'),
        0.00146,
        206.6374207,
        6152.049805,
        'Initial concentration for CO2'
    ),
    -- H2O
    (
        (SELECT id FROM mechanisms WHERE name = 'chapman'),
        (SELECT id FROM species WHERE name = 'H2O'),
        1.19e-05,
        206.6374207,
        6152.049805,
        'Initial concentration for H2O'
    ),
    -- O2
    (
        (SELECT id FROM mechanisms WHERE name = 'chapman'),
        (SELECT id FROM species WHERE name = 'O2'),
        0.75,
        206.6374207,
        6152.049805,
        'Initial concentration for O2'
    ),
    -- O3
    (
        (SELECT id FROM mechanisms WHERE name = 'chapman'),
        (SELECT id FROM species WHERE name = 'O3'),
        8.1e-06,
        206.6374207,
        6152.049805,
        'Initial concentration for O3'
    );

-- Flow Tube Mechanism Initial Conditions
INSERT INTO initial_conditions_species (
    mechanism_id, species_id, concentration, temperature, pressure, additional_conditions
) VALUES
    -- a-pinene
    (
        (SELECT id FROM mechanisms WHERE name = 'flow_tube'),
        (SELECT id FROM species WHERE name = 'a-pinene'),
        8e-08,
        298.15,
        101325.0,
        'Initial concentration for a-pinene'
    ),
    -- O3
    (
        (SELECT id FROM mechanisms WHERE name = 'flow_tube'),
        (SELECT id FROM species WHERE name = 'O3'),
        2e-05,
        298.15,
        101325.0,
        'Initial concentration for O3'
    ),
    -- M
    (
        (SELECT id FROM mechanisms WHERE name = 'flow_tube'),
        (SELECT id FROM species WHERE name = 'M'),
        0.0,
        298.15,
        101325.0,
        'Initial concentration for M'
    ),
    -- SOA1
    (
        (SELECT id FROM mechanisms WHERE name = 'flow_tube'),
        (SELECT id FROM species WHERE name = 'SOA1'),
        0.0,
        298.15,
        101325.0,
        'Initial concentration for SOA1'
    ),
    -- SOA2
    (
        (SELECT id FROM mechanisms WHERE name = 'flow_tube'),
        (SELECT id FROM species WHERE name = 'SOA2'),
        0.0,
        298.15,
        101325.0,
        'Initial concentration for SOA2'
    );

-- 9. Insert Users and User-Mechanism Relationships

-- Insert users
INSERT IGNORE INTO users (username, role, email) VALUES 
    ('admin', 'admin', 'admin@ncar.org');

-- Link users to mechanisms
INSERT INTO user_mechanisms (user_id, mechanism_id, role) VALUES
    (
        (SELECT id FROM users WHERE username = 'admin'),
        (SELECT id FROM mechanisms WHERE name = 'analytical'),
        'admin'
    ),
    (
        (SELECT id FROM users WHERE username = 'admin'),
        (SELECT id FROM mechanisms WHERE name = 'carbon_bond_5'),
        'admin'
    ),
    (
        (SELECT id FROM users WHERE username = 'admin'),
        (SELECT id FROM mechanisms WHERE name = 'chapman'),
        'admin'
    ),
    (
        (SELECT id FROM users WHERE username = 'admin'),
        (SELECT id FROM mechanisms WHERE name = 'flow_tube'),
        'admin'
    );

-- 10. Enhancements

-- Create indexes on frequently queried columns to improve performance
CREATE INDEX idx_species_name ON species(name);
CREATE INDEX idx_reactions_equation ON reactions(equation);
CREATE INDEX idx_mechanisms_name ON mechanisms(name);
CREATE INDEX idx_users_username ON users(username);
