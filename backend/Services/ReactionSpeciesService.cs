using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;

namespace Chemistry_Cafe_API.Services
{
    public class ReactionSpeciesService
    {
        private readonly MySqlDataSource _database;

        public ReactionSpeciesService(MySqlDataSource database)
        {
            _database = database;
        }

        public async Task AddSpeciesToReactionAsync(ReactionSpecies reactionSpecies)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                INSERT INTO reaction_species (reaction_id, species_id, role)
                VALUES (@reaction_id, @species_id, @role);";

            command.Parameters.AddWithValue("@reaction_id", reactionSpecies.ReactionId);
            command.Parameters.AddWithValue("@species_id", reactionSpecies.SpeciesId);
            command.Parameters.AddWithValue("@role", reactionSpecies.Role);

            await command.ExecuteNonQueryAsync();
        }

        public async Task<IReadOnlyList<ReactionSpecies>> GetSpeciesByReactionIdAsync(Guid reactionId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT 
                    rs.id AS ReactionSpeciesId,
                    rs.reaction_id AS ReactionId,
                    rs.species_id AS SpeciesId,
                    rs.role AS Role,
                    s.name AS SpeciesName,
                    s.description AS SpeciesDescription
                FROM reaction_species rs
                INNER JOIN species s ON rs.species_id = s.id
                WHERE rs.reaction_id = @reactionId";

            command.Parameters.AddWithValue("@reactionId", reactionId);

            var reactionSpeciesList = new List<ReactionSpecies>();

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var reactionSpecies = new ReactionSpecies
                {
                    Id = reader.GetGuid(reader.GetOrdinal("ReactionSpeciesId")),
                    ReactionId = reader.GetGuid(reader.GetOrdinal("ReactionId")),
                    SpeciesId = reader.GetGuid(reader.GetOrdinal("SpeciesId")),
                    Role = reader.GetString(reader.GetOrdinal("Role")),
                    Species = new Species
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("SpeciesId")),
                        Name = reader.GetString(reader.GetOrdinal("SpeciesName")),
                        Description = reader.IsDBNull(reader.GetOrdinal("SpeciesDescription")) ? null : reader.GetString(reader.GetOrdinal("SpeciesDescription"))
                    }
                };
                reactionSpeciesList.Add(reactionSpecies);
            }

            return reactionSpeciesList;
        }

        public async Task RemoveSpeciesFromReactionAsync(Guid id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "DELETE FROM reaction_species WHERE id = @id";
            command.Parameters.AddWithValue("@id", id);

            await command.ExecuteNonQueryAsync();
        }

        public async Task<List<ReactionSpeciesDto>> GetReactantsByReactionIdAsync(Guid reactionId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT 
                    rs.id AS ReactionSpeciesId,
                    rs.reaction_id AS ReactionId,
                    rs.species_id AS SpeciesId,
                    rs.role AS Role,
                    s.name AS SpeciesName
                FROM reaction_species rs
                INNER JOIN species s ON rs.species_id = s.id
                WHERE rs.reaction_id = @reactionId AND rs.role = 'reactant'";

            command.Parameters.AddWithValue("@reactionId", reactionId);

            return await ReadReactionSpeciesDtoAsync(await command.ExecuteReaderAsync());
        }

        public async Task<List<ReactionSpeciesDto>> GetProductsByReactionIdAsync(Guid reactionId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT 
                    rs.id AS ReactionSpeciesId,
                    rs.reaction_id AS ReactionId,
                    rs.species_id AS SpeciesId,
                    rs.role AS Role,
                    s.name AS SpeciesName
                FROM reaction_species rs
                INNER JOIN species s ON rs.species_id = s.id
                WHERE rs.reaction_id = @reactionId AND rs.role = 'product'";

            command.Parameters.AddWithValue("@reactionId", reactionId);

            return await ReadReactionSpeciesDtoAsync(await command.ExecuteReaderAsync());
        }

        private async Task<List<ReactionSpeciesDto>> ReadReactionSpeciesDtoAsync(DbDataReader reader)
        {
            var list = new List<ReactionSpeciesDto>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var item = new ReactionSpeciesDto
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("ReactionSpeciesId")),
                        ReactionId = reader.GetGuid(reader.GetOrdinal("ReactionId")),
                        SpeciesId = reader.GetGuid(reader.GetOrdinal("SpeciesId")),
                        Role = reader.GetString(reader.GetOrdinal("Role")),
                        SpeciesName = reader.GetString(reader.GetOrdinal("SpeciesName"))
                    };
                    list.Add(item);
                }
            }
            return list;
        }

        public async Task UpdateReactionSpeciesAsync(ReactionSpecies reactionSpecies)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                UPDATE reaction_species 
                SET role = @role
                WHERE id = @id;";

            command.Parameters.AddWithValue("@id", reactionSpecies.Id);
            command.Parameters.AddWithValue("@role", reactionSpecies.Role);

            await command.ExecuteNonQueryAsync();
        }
    }
    public class ReactionSpeciesDto
    {
        public Guid Id { get; set; }
        public Guid ReactionId { get; set; }
        public Guid SpeciesId { get; set; }
        public string Role { get; set; } = string.Empty;
        public string SpeciesName { get; set; } = string.Empty;
    }
}
