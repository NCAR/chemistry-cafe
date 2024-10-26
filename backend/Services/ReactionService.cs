using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;

namespace Chemistry_Cafe_API.Services
{
    public class ReactionService
    {
        private readonly MySqlDataSource _database;

        public ReactionService(MySqlDataSource database)
        {
            _database = database;
        }

        public async Task<IReadOnlyList<Reaction>> GetReactionsAsync()
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM reactions";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<Reaction?> GetReactionAsync(int id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM reactions WHERE id = @id";
            command.Parameters.AddWithValue("@id", id);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<Reaction> CreateReactionAsync(Reaction reaction)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                INSERT INTO reactions (equation, description, created_by)
                VALUES (@equation, @description, @created_by);
                SELECT LAST_INSERT_ID();";

            command.Parameters.AddWithValue("@equation", reaction.Equation);
            command.Parameters.AddWithValue("@description", reaction.Description ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@created_by", reaction.CreatedBy ?? (object)DBNull.Value);

            var reactionId = Convert.ToInt32(await command.ExecuteScalarAsync());
            reaction.Id = reactionId;

            return reaction;
        }

        public async Task UpdateReactionAsync(Reaction reaction)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                UPDATE reactions 
                SET equation = @equation, 
                    description = @description, 
                    created_by = @created_by
                WHERE id = @id;";

            command.Parameters.AddWithValue("@id", reaction.Id);
            command.Parameters.AddWithValue("@equation", reaction.Equation);
            command.Parameters.AddWithValue("@description", reaction.Description ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@created_by", reaction.CreatedBy ?? (object)DBNull.Value);

            await command.ExecuteNonQueryAsync();
        }

        public async Task<List<Reaction>> GetReactionsByFamilyIdAsync(int familyId)
    {
        var reactions = new List<Reaction>();
        
        using var connection = await _database.OpenConnectionAsync();
        using var command = connection.CreateCommand();

        command.CommandText = @"
            SELECT r.id, r.equation, r.description, r.created_by, r.created_date 
            FROM reactions r
            JOIN mechanism_reactions mr ON r.id = mr.reaction_id
            JOIN mechanisms m ON mr.mechanism_id = m.id
            WHERE m.family_id = @familyId";

        command.Parameters.AddWithValue("@familyId", familyId);

        using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            var reaction = new Reaction
            {
                Id = reader.GetInt32(reader.GetOrdinal("id")),
                Equation = reader.GetString(reader.GetOrdinal("equation")),
                Description = reader.IsDBNull(reader.GetOrdinal("description")) ? null : reader.GetString(reader.GetOrdinal("description")),
                CreatedBy = reader.IsDBNull(reader.GetOrdinal("created_by")) ? null : reader.GetString(reader.GetOrdinal("created_by")),
                CreatedDate = reader.GetDateTime(reader.GetOrdinal("created_date"))
            };
            
            reactions.Add(reaction);
        }

        return reactions;
    }

        public async Task<List<Reaction>> GetReactionsByMechanismIdAsync(int mechanismId)
    {
        var reactions = new List<Reaction>();
        
        using var connection = await _database.OpenConnectionAsync();
        using var command = connection.CreateCommand();

        command.CommandText = @"
            SELECT r.id, r.equation, r.description, r.created_by, r.created_date 
            FROM reactions r
            JOIN mechanism_reactions mr ON r.id = mr.reaction_id
            WHERE mr.mechanism_id = @mechanismId";

        command.Parameters.AddWithValue("@mechanismId", mechanismId);

        using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            var reaction = new Reaction
            {
                Id = reader.GetInt32(reader.GetOrdinal("id")),
                Equation = reader.GetString(reader.GetOrdinal("equation")),
                Description = reader.IsDBNull(reader.GetOrdinal("description")) ? null : reader.GetString(reader.GetOrdinal("description")),
                CreatedBy = reader.IsDBNull(reader.GetOrdinal("created_by")) ? null : reader.GetString(reader.GetOrdinal("created_by")),
                CreatedDate = reader.GetDateTime(reader.GetOrdinal("created_date"))
            };
            
            reactions.Add(reaction);
        }

        return reactions;
    }


    


        public async Task DeleteReactionAsync(int id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "DELETE FROM reactions WHERE id = @id";
            command.Parameters.AddWithValue("@id", id);

            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<Reaction>> ReadAllAsync(DbDataReader reader)
        {
            var reactions = new List<Reaction>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var reaction = new Reaction
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("id")),
                        Equation = reader.GetString(reader.GetOrdinal("equation")),
                        Description = reader.IsDBNull(reader.GetOrdinal("description")) ? null : reader.GetString(reader.GetOrdinal("description")),
                        CreatedBy = reader.IsDBNull(reader.GetOrdinal("created_by")) ? null : reader.GetString(reader.GetOrdinal("created_by")),
                        CreatedDate = reader.GetDateTime(reader.GetOrdinal("created_date"))
                    };
                    reactions.Add(reaction);
                }
            }
            return reactions;
        }
    }
}
