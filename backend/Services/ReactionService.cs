using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using System.Text.Json;
using System.Text.Json.Nodes;

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
                    reactions.name AS ReactionName,
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
            var reactionDictionary = new Dictionary<Guid, Reaction>();

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                Guid reactionId = reader.GetGuid(reader.GetOrdinal("ReactionId"));
                if (!reactionDictionary.TryGetValue(reactionId, out var reaction))
                {
                    reaction = new Reaction
                    {
                        Id = reactionId,
                        Name = reader.GetString(reader.GetOrdinal("ReactionName")),
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
                        Id = reader.GetGuid(reader.GetOrdinal("MechanismReactionId")),
                        MechanismId = reader.GetGuid(reader.GetOrdinal("MechanismReactionMechanismId")),
                        ReactionId = reader.GetGuid(reader.GetOrdinal("MechanismReactionReactionId"))
                    };
                    reaction.MechanismReactions.Add(mechanismReaction);
                }

                // Add ReactionSpecies
                if (!reader.IsDBNull(reader.GetOrdinal("ReactionSpeciesId")))
                {
                    var reactionSpecies = new ReactionSpecies
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("ReactionSpeciesId")),
                        ReactionId = reader.GetGuid(reader.GetOrdinal("ReactionSpeciesReactionId")),
                        SpeciesId = reader.GetGuid(reader.GetOrdinal("ReactionSpeciesSpeciesId")),
                        Role = reader.GetString(reader.GetOrdinal("ReactionSpeciesRole")),
                    };
                    reaction.ReactionSpecies.Add(reactionSpecies);
                }
            }

            return reactionList;
        }

        public async Task<Reaction?> GetReactionAsync(Guid id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM reactions WHERE id = @id";
            command.Parameters.AddWithValue("@id", id.ToString());

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<Reaction> CreateReactionAsync(Reaction reaction)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            // Generate a new UUID for the reaction
            reaction.Id = Guid.NewGuid();

            command.CommandText = @"
                INSERT INTO reactions (id, name, description, created_by, created_date)
                VALUES (@id, @name, @description, @created_by, @created_date);";

            command.Parameters.AddWithValue("@id", reaction.Id.ToString());
            command.Parameters.AddWithValue("@name", reaction.Name);
            command.Parameters.AddWithValue("@description", reaction.Description ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@created_by", reaction.CreatedBy ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@created_date", DateTime.UtcNow);

            await command.ExecuteNonQueryAsync();

            return reaction;
        }


        public async Task UpdateReactionAsync(Reaction reaction)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                UPDATE reactions 
                SET name = @name, 
                    description = @description, 
                    created_by = @created_by
                WHERE id = @id;";

            command.Parameters.AddWithValue("@id", reaction.Id.ToString());
            command.Parameters.AddWithValue("@name", reaction.Name);
            command.Parameters.AddWithValue("@description", reaction.Description ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@created_by", reaction.CreatedBy ?? (object)DBNull.Value);

            await command.ExecuteNonQueryAsync();
        }

        public async Task<List<Reaction>> GetReactionsByFamilyIdAsync(Guid familyId)
        {
            var reactions = new List<Reaction>();
            
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT r.id, r.name, r.description, r.created_by, r.created_date 
                FROM reactions r
                JOIN mechanism_reactions mr ON r.id = mr.reaction_id
                JOIN mechanisms m ON mr.mechanism_id = m.id
                WHERE m.family_id = @familyId";

            command.Parameters.AddWithValue("@familyId", familyId.ToString());

            using var reader = await command.ExecuteReaderAsync();

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

            return reactions;
        }

        public async Task<List<Reaction>> GetReactionsByMechanismIdAsync(Guid mechanismId)
        {
            var reactions = new List<Reaction>();
            
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT r.id, r.name, r.description, r.created_by, r.created_date 
                FROM reactions r
                JOIN mechanism_reactions mr ON r.id = mr.reaction_id
                WHERE mr.mechanism_id = @mechanismId";

            command.Parameters.AddWithValue("@mechanismId", mechanismId.ToString());

            using var reader = await command.ExecuteReaderAsync();

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

            return reactions;
        }

        public async Task DeleteReactionAsync(Guid id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "DELETE FROM reactions WHERE id = @id";
            command.Parameters.AddWithValue("@id", id.ToString());

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
    
        public async Task<string> GetReactionExportedJSON(Reaction reaction){
            // Extract reaction information using the json serializer
            var options = new JsonSerializerOptions { WriteIndented = true };
            string jsonString = JsonSerializer.Serialize(reaction, options);

            // Parse different values stored in the json
            var jsonObj = JsonNode.Parse(jsonString)?.AsObject();
            
            // Remove the information we don't want.
            if(jsonObj != null){
                jsonObj.Remove("Id");
                jsonObj.Remove("family_id");
                jsonObj.Remove("created_by");
                jsonObj.Remove("created_date");
                jsonObj.Remove("MechanismReactions");
                jsonObj.Remove("ReactionSpecies");
            }

            // Get reactants
            var reactionSpeciesService = new ReactionSpeciesService(_database);
            var reactantList = await reactionSpeciesService.GetReactantsByReactionIdAsync(reaction.Id);

            // For all reactants associated with the reaction, get their JSON data and store them in an array
            JsonArray jsonArrReactants = new JsonArray();
            foreach(ReactionSpeciesDto r in reactantList){
                if(r == null){
                    continue;
                }
                // Get the reaction's json in a string, including reactants, products, etc.
                string rStr = reactionSpeciesService.GetReactantsProductsExportedJSON(r);
                jsonArrReactants.Add(JsonNode.Parse(rStr));
            }

            // Add the reactants to the json object
            if(jsonObj == null)
                return string.Empty;
            jsonObj.Add("reactants", jsonArrReactants);

            // Get products
            var productList = await reactionSpeciesService.GetProductsByReactionIdAsync(reaction.Id);

            // For all products associated with the reaction, get their JSON data and store them in an array
            JsonArray jsonArrProducts = new JsonArray();
            foreach(ReactionSpeciesDto p in productList){
                if(p == null){
                    continue;
                }
                // Get the reaction's json in a string, including reactants, products, etc.
                string pStr = reactionSpeciesService.GetReactantsProductsExportedJSON(p);
                jsonArrProducts.Add(JsonNode.Parse(pStr));
            }

            if(jsonObj == null)
                return string.Empty;
            jsonObj.Add("products", jsonArrProducts);

            return jsonObj.ToString();
        }
    }
}
