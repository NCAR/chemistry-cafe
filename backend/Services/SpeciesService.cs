﻿using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;

namespace Chemistry_Cafe_API.Services
{
    public class SpeciesService
    {
        private readonly MySqlDataSource _database;

        public SpeciesService(MySqlDataSource database)
        {
            _database = database;
        }

       public async Task<IReadOnlyList<Species>> GetSpeciesAsync()
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT 
                    species.id AS SpeciesId,
                    species.name AS SpeciesName,
                    species.description AS SpeciesDescription,
                    species.created_by AS SpeciesCreatedBy,
                    species.created_date AS SpeciesCreatedDate,
                    initial_conditions_species.id AS InitialConditionSpeciesId,
                    initial_conditions_species.mechanism_id AS InitialConditionMechanismId,
                    initial_conditions_species.species_id AS InitialConditionSpeciesId,
                    initial_conditions_species.concentration AS InitialConditionConcentration,
                    initial_conditions_species.temperature AS InitialConditionTemperature,
                    initial_conditions_species.pressure AS InitialConditionPressure,
                    initial_conditions_species.additional_conditions AS InitialConditionAdditionalConditions,
                    mechanism_species.id AS MechanismSpeciesId,
                    mechanism_species.mechanism_id AS MechanismSpeciesMechanismId,
                    mechanism_species.species_id AS MechanismSpeciesSpeciesId,
                    reaction_species.id AS ReactionSpeciesId,
                    reaction_species.reaction_id AS ReactionSpeciesReactionId,
                    reaction_species.species_id AS ReactionSpeciesSpeciesId,
                    reaction_species.role AS ReactionSpeciesRole
                FROM species
                LEFT JOIN initial_conditions_species ON species.id = initial_conditions_species.species_id
                LEFT JOIN mechanism_species ON species.id = mechanism_species.species_id
                LEFT JOIN reaction_species ON species.id = reaction_species.species_id";

            var speciesList = new List<Species>();
            var speciesDictionary = new Dictionary<int, Species>();

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                int speciesId = reader.GetInt32(reader.GetOrdinal("SpeciesId"));
                if (!speciesDictionary.TryGetValue(speciesId, out var species))
                {
                    species = new Species
                    {
                        Id = speciesId,
                        Name = reader.GetString(reader.GetOrdinal("SpeciesName")),
                        Description = reader.IsDBNull(reader.GetOrdinal("SpeciesDescription")) ? null : reader.GetString(reader.GetOrdinal("SpeciesDescription")),
                        CreatedBy = reader.IsDBNull(reader.GetOrdinal("SpeciesCreatedBy")) ? null : reader.GetString(reader.GetOrdinal("SpeciesCreatedBy")),
                        CreatedDate = reader.GetDateTime(reader.GetOrdinal("SpeciesCreatedDate")),
                        InitialConditionsSpecies = new List<InitialConditionsSpecies>(),
                        MechanismSpecies = new List<MechanismSpecies>(),
                        ReactionSpecies = new List<ReactionSpecies>()
                    };
                    speciesList.Add(species);
                    speciesDictionary[speciesId] = species;
                }

                // Add InitialConditionsSpecies
                if (!reader.IsDBNull(reader.GetOrdinal("InitialConditionSpeciesId")))
                {
                    var initialConditionSpecies = new InitialConditionsSpecies
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("InitialConditionSpeciesId")),
                        MechanismId = reader.GetInt32(reader.GetOrdinal("InitialConditionMechanismId")),
                        SpeciesId = reader.GetInt32(reader.GetOrdinal("InitialConditionSpeciesId")),
                        Concentration = reader.IsDBNull(reader.GetOrdinal("InitialConditionConcentration")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("InitialConditionConcentration")),
                        Temperature = reader.IsDBNull(reader.GetOrdinal("InitialConditionTemperature")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("InitialConditionTemperature")),
                        Pressure = reader.IsDBNull(reader.GetOrdinal("InitialConditionPressure")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("InitialConditionPressure")),
                        AdditionalConditions = reader.IsDBNull(reader.GetOrdinal("InitialConditionAdditionalConditions")) ? null : reader.GetString(reader.GetOrdinal("InitialConditionAdditionalConditions"))
                    };
                    species.InitialConditionsSpecies.Add(initialConditionSpecies);
                }

                // Add MechanismSpecies
                if (!reader.IsDBNull(reader.GetOrdinal("MechanismSpeciesId")))
                {
                    var mechanismSpecies = new MechanismSpecies
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("MechanismSpeciesId")),
                        MechanismId = reader.GetInt32(reader.GetOrdinal("MechanismSpeciesMechanismId")),
                        SpeciesId = reader.GetInt32(reader.GetOrdinal("MechanismSpeciesSpeciesId"))
                    };
                    species.MechanismSpecies.Add(mechanismSpecies);
                }

                // Add ReactionSpecies
                if (!reader.IsDBNull(reader.GetOrdinal("ReactionSpeciesId")))
                {
                    var reactionSpecies = new ReactionSpecies
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("ReactionSpeciesId")),
                        ReactionId = reader.GetInt32(reader.GetOrdinal("ReactionSpeciesReactionId")),
                        SpeciesId = reader.GetInt32(reader.GetOrdinal("ReactionSpeciesSpeciesId")),
                        Role = reader.GetString(reader.GetOrdinal("ReactionSpeciesRole")),
                    };
                    species.ReactionSpecies.Add(reactionSpecies);
                }
            }

            return speciesList;
        }

        public async Task<Species?> GetSpeciesAsync(int id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM species WHERE id = @id";
            command.Parameters.AddWithValue("@id", id);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<Species> CreateSpeciesAsync(Species species)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                INSERT INTO species (name, description, created_by)
                VALUES (@name, @description, @created_by);
                SELECT LAST_INSERT_ID();";

            command.Parameters.AddWithValue("@name", species.Name);
            command.Parameters.AddWithValue("@description", species.Description ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@created_by", species.CreatedBy ?? (object)DBNull.Value);

            var speciesId = Convert.ToInt32(await command.ExecuteScalarAsync());
            species.Id = speciesId;

            return species;
        }

        public async Task UpdateSpeciesAsync(Species species)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                UPDATE species 
                SET name = @name, 
                    description = @description, 
                    created_by = @created_by
                WHERE id = @id;";

            command.Parameters.AddWithValue("@id", species.Id);
            command.Parameters.AddWithValue("@name", species.Name);
            command.Parameters.AddWithValue("@description", species.Description ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@created_by", species.CreatedBy ?? (object)DBNull.Value);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteSpeciesAsync(int id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "DELETE FROM species WHERE id = @id";
            command.Parameters.AddWithValue("@id", id);

            await command.ExecuteNonQueryAsync();
        }

        public async Task<IReadOnlyList<Species>> GetSpeciesByFamilyIdAsync(int familyId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT DISTINCT s.*
                FROM species s
                INNER JOIN mechanism_species ms ON s.id = ms.species_id
                INNER JOIN mechanisms m ON ms.mechanism_id = m.id
                WHERE m.family_id = @family_id";

            command.Parameters.AddWithValue("@family_id", familyId);

            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        // SpeciesService.cs
    public async Task<List<Species>> GetSpeciesByMechanismIdAsync(int mechanismId)
    {
        var speciesList = new List<Species>();

        using var connection = await _database.OpenConnectionAsync();
        using var command = connection.CreateCommand();

        command.CommandText = @"
            SELECT s.id, s.name, s.description, s.created_by, s.created_date
            FROM species s
            JOIN mechanism_species ms ON s.id = ms.species_id
            WHERE ms.mechanism_id = @mechanismId";

        command.Parameters.AddWithValue("@mechanismId", mechanismId);

        using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            var species = new Species
            {
                Id = reader.GetInt32(reader.GetOrdinal("id")),
                Name = reader.GetString(reader.GetOrdinal("name")),
                Description = reader.IsDBNull(reader.GetOrdinal("description")) ? null : reader.GetString(reader.GetOrdinal("description")),
                CreatedBy = reader.IsDBNull(reader.GetOrdinal("created_by")) ? null : reader.GetString(reader.GetOrdinal("created_by")),
                CreatedDate = reader.GetDateTime(reader.GetOrdinal("created_date"))
            };
            speciesList.Add(species);
        }

        return speciesList;
    }



        private async Task<IReadOnlyList<Species>> ReadAllAsync(DbDataReader reader)
        {
            var speciesList = new List<Species>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var species = new Species
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("id")),
                        Name = reader.GetString(reader.GetOrdinal("name")),
                        Description = reader.IsDBNull(reader.GetOrdinal("description")) ? null : reader.GetString(reader.GetOrdinal("description")),
                        CreatedBy = reader.IsDBNull(reader.GetOrdinal("created_by")) ? null : reader.GetString(reader.GetOrdinal("created_by")),
                        CreatedDate = reader.GetDateTime(reader.GetOrdinal("created_date"))
                    };
                    speciesList.Add(species);
                }
            }
            return speciesList;
        }
    }
}
