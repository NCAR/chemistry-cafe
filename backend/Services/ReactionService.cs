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

            command.CommandText = @"
                SELECT 
                    reactions.id AS ReactionId,
                    reactions.equation AS ReactionEquation,
                    reactions.description AS ReactionDescription,
                    reactions.created_by AS ReactionCreatedBy,
                    reactions.created_date AS ReactionCreatedDate,
                    mechanism_reactions.id AS MechanismReactionId,
                    mechanism_reactions.mechanism_id AS MechanismReactionMechanismId,
                    mechanism_reactions.reaction_id AS MechanismReactionReactionId,
                    reaction_species.id AS ReactionSpeciesId,
                    reaction_species.reaction_id AS ReactionSpeciesReactionId,
                    reaction_species.species_id AS ReactionSpeciesSpeciesId,
                    reaction_species.role AS ReactionSpeciesRole
                FROM reactions
                LEFT JOIN mechanism_reactions ON reactions.id = mechanism_reactions.reaction_id
                LEFT JOIN reaction_species ON reactions.id = reaction_species.reaction_id";

            var reactionList = new List<Reaction>();
            var reactionDictionary = new Dictionary<int, Reaction>();

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                int reactionId = reader.GetInt32(reader.GetOrdinal("ReactionId"));
                if (!reactionDictionary.TryGetValue(reactionId, out var reaction))
                {
                    reaction = new Reaction
                    {
                        Id = reactionId,
                        Equation = reader.GetString(reader.GetOrdinal("ReactionEquation")),
                        Description = reader.IsDBNull(reader.GetOrdinal("ReactionDescription")) ? null : reader.GetString(reader.GetOrdinal("ReactionDescription")),
                        CreatedBy = reader.IsDBNull(reader.GetOrdinal("ReactionCreatedBy")) ? null : reader.GetString(reader.GetOrdinal("ReactionCreatedBy")),
                        CreatedDate = reader.GetDateTime(reader.GetOrdinal("ReactionCreatedDate")),
                        MechanismReactions = new List<MechanismReaction>(),
                        ReactionSpecies = new List<ReactionSpecies>()
                    };
                    reactionList.Add(reaction);
                    reactionDictionary[reactionId] = reaction;
                }

                // Add MechanismReactions
                if (!reader.IsDBNull(reader.GetOrdinal("MechanismReactionId")))
                {
                    var mechanismReaction = new MechanismReaction
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("MechanismReactionId")),
                        MechanismId = reader.GetInt32(reader.GetOrdinal("MechanismReactionMechanismId")),
                        ReactionId = reader.GetInt32(reader.GetOrdinal("MechanismReactionReactionId"))
                    };
                    reaction.MechanismReactions.Add(mechanismReaction);
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
                    reaction.ReactionSpecies.Add(reactionSpecies);
                }
            }

            return reactionList;
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
