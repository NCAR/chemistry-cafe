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

            mechanismReaction.Id = Guid.NewGuid();

            command.CommandText = @"
                INSERT INTO mechanism_reactions (id, mechanism_id, reaction_id)
                VALUES (@id, @mechanism_id, @reaction_id);";

            command.Parameters.AddWithValue("@id", mechanismReaction.Id.ToString());
            command.Parameters.AddWithValue("@mechanism_id", mechanismReaction.MechanismId.ToString());
            command.Parameters.AddWithValue("@reaction_id", mechanismReaction.ReactionId.ToString());

            await command.ExecuteNonQueryAsync();
        }

        public async Task<IReadOnlyList<MechanismReaction>> GetMechanismReactionsByMechanismIdAsync(Guid mechanismId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT 
                    mechanism_reactions.id AS MechanismReactionId,
                    mechanism_reactions.mechanism_id AS MechanismId,
                    mechanism_reactions.reaction_id AS ReactionId,
                    reactions.name AS ReactionName,
                    reactions.description AS ReactionDescription
                FROM mechanism_reactions
                INNER JOIN reactions ON mechanism_reactions.reaction_id = reactions.id
                WHERE mechanism_reactions.mechanism_id = @mechanismId";

            command.Parameters.AddWithValue("@mechanismId", mechanismId.ToString());

            var mechanismReactionsList = new List<MechanismReaction>();

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var mechanismReaction = new MechanismReaction
                {
                    Id = reader.GetGuid(reader.GetOrdinal("MechanismReactionId")),
                    MechanismId = reader.GetGuid(reader.GetOrdinal("MechanismId")),
                    ReactionId = reader.GetGuid(reader.GetOrdinal("ReactionId")),
                    Reaction = new Reaction
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("ReactionId")),
                        Name = reader.GetString(reader.GetOrdinal("ReactionName")),
                        Description = reader.IsDBNull(reader.GetOrdinal("ReactionDescription")) ? null : reader.GetString(reader.GetOrdinal("ReactionDescription"))
                    }
                };
                mechanismReactionsList.Add(mechanismReaction);
            }

            return mechanismReactionsList;
        }

        public async Task RemoveReactionFromMechanismAsync(Guid id)
        {
            try
            {
                using var connection = await _database.OpenConnectionAsync();
                using var transaction = await connection.BeginTransactionAsync();

                // Check if the reaction exists
                using var checkCommand = connection.CreateCommand();
                checkCommand.Transaction = transaction;
                checkCommand.CommandText = "SELECT COUNT(*) FROM mechanism_reactions WHERE id = @id";
                checkCommand.Parameters.Add("@id", MySqlDbType.VarChar, 36).Value = id.ToString();

                var count = Convert.ToInt32(await checkCommand.ExecuteScalarAsync());
                if (count == 0)
                {
                    throw new ArgumentException("Reaction does not exist.");
                }

                // Proceed to delete
                using var deleteCommand = connection.CreateCommand();
                deleteCommand.Transaction = transaction;
                deleteCommand.CommandText = "DELETE FROM mechanism_reactions WHERE id = @id";
                deleteCommand.Parameters.Add("@id", MySqlDbType.VarChar, 36).Value = id.ToString();

                await deleteCommand.ExecuteNonQueryAsync();

                // Commit the transaction
                await transaction.CommitAsync();
            }
            catch (MySqlException ex)
            {
                // Log MySQL-specific errors
                Console.Error.WriteLine($"MySQL Error: {ex.Message}");
                throw;
            }
            catch (Exception ex)
            {
                // Log general errors
                Console.Error.WriteLine($"General Error: {ex.Message}");
                throw;
            }
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
                        Id = reader.GetGuid(reader.GetOrdinal("id")),
                        Name = reader.GetString(reader.GetOrdinal("name")),
                        Description = reader.IsDBNull(reader.GetOrdinal("description")) ? null : reader.GetString(reader.GetOrdinal("description")),
                        CreatedBy = reader.IsDBNull(reader.GetOrdinal("created_by")) ? null : reader.GetString(reader.GetOrdinal("created_by")),
                        CreatedDate = reader.GetDateTime(reader.GetOrdinal("created_date"))
                    };
                    reactions.Add(reaction);
                }
            }
            return reactions;
        }

        private async Task<IReadOnlyList<MechanismReaction>> ReadAllAsync(DbDataReader reader)
        {
            var mechanismReactions = new List<MechanismReaction>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var mr = new MechanismReaction
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("id")),
                        MechanismId = reader.GetGuid(reader.GetOrdinal("mechanism_id")),
                        ReactionId = reader.GetGuid(reader.GetOrdinal("reaction_id")),
                        Reaction = new Reaction
                        {
                            Id = reader.GetGuid(reader.GetOrdinal("reaction_id")),
                            Name = reader.GetString(reader.GetOrdinal("ReactionName")),
                            Description = reader.IsDBNull(reader.GetOrdinal("ReactionDescription")) ? null : reader.GetString(reader.GetOrdinal("ReactionDescription"))
                        }
                    };
                    mechanismReactions.Add(mr);
                }
            }
            return mechanismReactions;
        }
    }
}
