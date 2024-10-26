using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;

namespace Chemistry_Cafe_API.Services
{
    public class MechanismReactionService
    {
        private readonly MySqlDataSource _database;

        public MechanismReactionService(MySqlDataSource database)
        {
            _database = database;
        }

        public async Task AddReactionToMechanismAsync(MechanismReaction mechanismReaction)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                INSERT INTO mechanism_reactions (mechanism_id, reaction_id)
                VALUES (@mechanism_id, @reaction_id);";

            command.Parameters.AddWithValue("@mechanism_id", mechanismReaction.MechanismId);
            command.Parameters.AddWithValue("@reaction_id", mechanismReaction.ReactionId);

            await command.ExecuteNonQueryAsync();
        }

        public async Task<IReadOnlyList<Reaction>> GetReactionsByMechanismIdAsync(int mechanismId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT r.* FROM reactions r
                INNER JOIN mechanism_reactions mr ON r.id = mr.reaction_id
                WHERE mr.mechanism_id = @mechanism_id";

            command.Parameters.AddWithValue("@mechanism_id", mechanismId);
            return await ReadReactionsAsync(await command.ExecuteReaderAsync());
        }

        public async Task RemoveReactionFromMechanismAsync(int id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "DELETE FROM mechanism_reactions WHERE id = @id";
            command.Parameters.AddWithValue("@id", id);

            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<Reaction>> ReadReactionsAsync(DbDataReader reader)
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
