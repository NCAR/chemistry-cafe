using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;

namespace Chemistry_Cafe_API.Services
{
    public class MechanismSpeciesService
    {
        private readonly MySqlDataSource _database;

        public MechanismSpeciesService(MySqlDataSource database)
        {
            _database = database;
        }

        public async Task AddSpeciesToMechanismAsync(MechanismSpecies mechanismSpecies)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                INSERT INTO mechanism_species (mechanism_id, species_id)
                VALUES (@mechanism_id, @species_id);";

            command.Parameters.AddWithValue("@mechanism_id", mechanismSpecies.MechanismId);
            command.Parameters.AddWithValue("@species_id", mechanismSpecies.SpeciesId);

            await command.ExecuteNonQueryAsync();
        }

        public async Task<IReadOnlyList<MechanismSpecies>> GetMechanismSpeciesByMechanismIdAsync(Guid mechanismId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT 
                    mechanism_species.id AS MechanismSpeciesId,
                    mechanism_species.mechanism_id AS MechanismId,
                    mechanism_species.species_id AS SpeciesId,
                    species.name AS SpeciesName,
                    species.description AS SpeciesDescription
                FROM mechanism_species
                INNER JOIN species ON mechanism_species.species_id = species.id
                WHERE mechanism_species.mechanism_id = @mechanismId";

            command.Parameters.AddWithValue("@mechanismId", mechanismId);

            var mechanismSpeciesList = new List<MechanismSpecies>();

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var mechanismSpecies = new MechanismSpecies
                {
                    Id = reader.GetGuid(reader.GetOrdinal("MechanismSpeciesId")),
                    MechanismId = reader.GetGuid(reader.GetOrdinal("MechanismId")),
                    SpeciesId = reader.GetGuid(reader.GetOrdinal("SpeciesId")),
                    Species = new Species
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("SpeciesId")),
                        Name = reader.GetString(reader.GetOrdinal("SpeciesName")),
                        Description = reader.IsDBNull(reader.GetOrdinal("SpeciesDescription")) ? null : reader.GetString(reader.GetOrdinal("SpeciesDescription"))
                    }
                };
                mechanismSpeciesList.Add(mechanismSpecies);
            }

            return mechanismSpeciesList;
        }

        public async Task RemoveSpeciesFromMechanismAsync(Guid id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "DELETE FROM mechanism_species WHERE id = @id";
            command.Parameters.AddWithValue("@id", id);

            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<Species>> ReadSpeciesAsync(DbDataReader reader)
        {
            var speciesList = new List<Species>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var species = new Species
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("id")),
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

        private async Task<IReadOnlyList<MechanismSpecies>> ReadAllAsync(DbDataReader reader)
        {
            var mechanismSpeciesList = new List<MechanismSpecies>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var ms = new MechanismSpecies
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("id")),
                        MechanismId = reader.GetGuid(reader.GetOrdinal("mechanism_id")),
                        SpeciesId = reader.GetGuid(reader.GetOrdinal("species_id")),
                        Species = new Species
                        {
                            Id = reader.GetGuid(reader.GetOrdinal("species_id")),
                            Name = reader.GetString(reader.GetOrdinal("SpeciesName")),
                            Description = reader.IsDBNull(reader.GetOrdinal("SpeciesDescription")) ? null : reader.GetString(reader.GetOrdinal("SpeciesDescription"))
                        }
                    };
                    mechanismSpeciesList.Add(ms);
                }
            }
            return mechanismSpeciesList;
        }
    }
}
