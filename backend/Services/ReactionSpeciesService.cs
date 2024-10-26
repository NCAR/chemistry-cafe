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

        public async Task<IReadOnlyList<ReactionSpecies>> GetSpeciesByReactionIdAsync(int reactionId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT * FROM reaction_species
                WHERE reaction_id = @reaction_id";

            command.Parameters.AddWithValue("@reaction_id", reactionId);
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task RemoveSpeciesFromReactionAsync(int id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "DELETE FROM reaction_species WHERE id = @id";
            command.Parameters.AddWithValue("@id", id);

            await command.ExecuteNonQueryAsync();
        }

        // ReactionSpeciesService.cs
public async Task<List<ReactionSpeciesDto>> GetReactantsByReactionIdAsync(int reactionId)
{
    using var connection = await _database.OpenConnectionAsync();
    using var command = connection.CreateCommand();

    command.CommandText = @"
        SELECT rs.quantity, s.name AS SpeciesName
        FROM reaction_species rs
        JOIN species s ON rs.species_id = s.id
        WHERE rs.reaction_id = @reactionId AND rs.role = 'reactant'";

    command.Parameters.AddWithValue("@reactionId", reactionId);

    return await ReadReactionSpeciesDtoAsync(await command.ExecuteReaderAsync());
}

public async Task<List<ReactionSpeciesDto>> GetProductsByReactionIdAsync(int reactionId)
{
    using var connection = await _database.OpenConnectionAsync();
    using var command = connection.CreateCommand();

    command.CommandText = @"
        SELECT rs.quantity, s.name AS SpeciesName
        FROM reaction_species rs
        JOIN species s ON rs.species_id = s.id
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
                Quantity = reader.GetDecimal(reader.GetOrdinal("quantity")),
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
                SET quantity = @quantity, 
                    role = @role
                WHERE id = @id;";

            command.Parameters.AddWithValue("@id", reactionSpecies.Id);
            command.Parameters.AddWithValue("@quantity", reactionSpecies.Quantity);
            command.Parameters.AddWithValue("@role", reactionSpecies.Role);

            await command.ExecuteNonQueryAsync();
        }
        private async Task<IReadOnlyList<ReactionSpecies>> ReadAllAsync(DbDataReader reader)
        {
            var reactionSpeciesList = new List<ReactionSpecies>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var rs = new ReactionSpecies
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("id")),
                        ReactionId = reader.GetInt32(reader.GetOrdinal("reaction_id")),
                        SpeciesId = reader.GetInt32(reader.GetOrdinal("species_id")),
                        Role = reader.GetString(reader.GetOrdinal("role"))
                    };
                    reactionSpeciesList.Add(rs);
                }
            }
            return reactionSpeciesList;
        }
    }
}

// ReactionSpeciesDto.cs
public class ReactionSpeciesDto
{
    public decimal Quantity { get; set; }
    public string SpeciesName { get; set; } = string.Empty;
}

