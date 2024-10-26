using Chemistry_Cafe_API.Models;
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

            command.CommandText = "SELECT * FROM species";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
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
