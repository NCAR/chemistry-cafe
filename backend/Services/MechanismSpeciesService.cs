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

        public async Task<IReadOnlyList<Species>> GetSpeciesByMechanismIdAsync(int mechanismId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT s.* FROM species s
                INNER JOIN mechanism_species ms ON s.id = ms.species_id
                WHERE ms.mechanism_id = @mechanism_id";

            command.Parameters.AddWithValue("@mechanism_id", mechanismId);
            return await ReadSpeciesAsync(await command.ExecuteReaderAsync());
        }

        public async Task RemoveSpeciesFromMechanismAsync(int id)
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
