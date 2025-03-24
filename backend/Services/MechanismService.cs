using System.Text.Json;
using System.Text.Json.Nodes;
using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json;
using System.Dynamic;

namespace Chemistry_Cafe_API.Services
{
    public class MechanismService
    {
        private readonly MySqlDataSource _database;

        public MechanismService(MySqlDataSource database)
        {
            _database = database;
        }

        public async Task<IReadOnlyList<Mechanism>> GetMechanismsAsync()
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT 
                    mechanisms.id AS MechanismId,
                    mechanisms.family_id AS FamilyId,
                    mechanisms.name AS MechanismName,
                    mechanisms.description AS MechanismDescription,
                    mechanisms.created_by AS MechanismCreatedBy,
                    mechanisms.created_date AS MechanismCreatedDate,
                    mechanism_reactions.id AS MechanismReactionId,
                    mechanism_reactions.reaction_id AS ReactionId,
                    mechanism_species.id AS MechanismSpeciesId,
                    mechanism_species.species_id AS SpeciesId
                FROM mechanisms
                LEFT JOIN mechanism_reactions ON mechanisms.id = mechanism_reactions.mechanism_id
                LEFT JOIN mechanism_species ON mechanisms.id = mechanism_species.mechanism_id";

            var mechanismList = new List<Mechanism>();
            var mechanismDictionary = new Dictionary<Guid, Mechanism>();

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                Guid mechanismId = reader.GetGuid(reader.GetOrdinal("MechanismId"));
                if (!mechanismDictionary.TryGetValue(mechanismId, out var mechanism))
                {
                    mechanism = new Mechanism
                    {
                        Id = mechanismId,
                        FamilyId = reader.GetGuid(reader.GetOrdinal("FamilyId")),
                        Name = reader.GetString(reader.GetOrdinal("MechanismName")),
                        Description = reader.IsDBNull(reader.GetOrdinal("MechanismDescription")) ? null : reader.GetString(reader.GetOrdinal("MechanismDescription")),
                        CreatedBy = reader.IsDBNull(reader.GetOrdinal("MechanismCreatedBy")) ? null : reader.GetString(reader.GetOrdinal("MechanismCreatedBy")),
                        CreatedDate = reader.GetDateTime(reader.GetOrdinal("MechanismCreatedDate")),
                        MechanismReactions = new List<MechanismReaction>(),
                        MechanismSpecies = new List<MechanismSpecies>()
                    };
                    mechanismList.Add(mechanism);
                    mechanismDictionary[mechanismId] = mechanism;
                }

                // Add MechanismReactions
                if (!reader.IsDBNull(reader.GetOrdinal("MechanismReactionId")))
                {
                    var mechanismReaction = new MechanismReaction
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("MechanismReactionId")),
                        MechanismId = mechanismId,
                        ReactionId = reader.GetGuid(reader.GetOrdinal("ReactionId"))
                    };
                    mechanism.MechanismReactions.Add(mechanismReaction);
                }

                // Add MechanismSpecies
                if (!reader.IsDBNull(reader.GetOrdinal("MechanismSpeciesId")))
                {
                    var mechanismSpecies = new MechanismSpecies
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("MechanismSpeciesId")),
                        MechanismId = mechanismId,
                        SpeciesId = reader.GetGuid(reader.GetOrdinal("SpeciesId"))
                    };
                    mechanism.MechanismSpecies.Add(mechanismSpecies);
                }
            }

            return mechanismList;
        }

        public async Task<Mechanism?> GetMechanismAsync(Guid id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM mechanisms WHERE id = @id";
            command.Parameters.AddWithValue("@id", id.ToString());

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<Mechanism> CreateMechanismAsync(Mechanism mechanism)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            var mechanismId = Guid.NewGuid();
            mechanism.Id = mechanismId;

            command.CommandText = @"
                INSERT INTO mechanisms (id, family_id, name, description, created_by)
                VALUES (@id, @family_id, @name, @description, @created_by);";

            command.Parameters.AddWithValue("@id", mechanism.Id.ToString());
            command.Parameters.AddWithValue("@family_id", mechanism.FamilyId.ToString());
            command.Parameters.AddWithValue("@name", mechanism.Name);
            command.Parameters.AddWithValue("@description", mechanism.Description ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@created_by", mechanism.CreatedBy ?? (object)DBNull.Value);

            await command.ExecuteNonQueryAsync();

            return mechanism;
        }


        public async Task UpdateMechanismAsync(Mechanism mechanism)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                UPDATE mechanisms 
                SET family_id = @family_id, 
                    name = @name, 
                    description = @description, 
                    created_by = @created_by
                WHERE id = @id;";

            command.Parameters.AddWithValue("@id", mechanism.Id.ToString());
            command.Parameters.AddWithValue("@family_id", mechanism.FamilyId.ToString());
            command.Parameters.AddWithValue("@name", mechanism.Name);
            command.Parameters.AddWithValue("@description", mechanism.Description ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@created_by", mechanism.CreatedBy ?? (object)DBNull.Value);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteMechanismAsync(Guid id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "DELETE FROM mechanisms WHERE id = @id";
            command.Parameters.AddWithValue("@id", id.ToString());

            await command.ExecuteNonQueryAsync();
        }

        public async Task<IReadOnlyList<Mechanism>> GetMechanismsByFamilyIdAsync(Guid familyId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM mechanisms WHERE family_id = @family_id";
            command.Parameters.AddWithValue("@family_id", familyId.ToString());

            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        private async Task<IReadOnlyList<Mechanism>> ReadAllAsync(DbDataReader reader)
        {
            var mechanisms = new List<Mechanism>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var mechanism = new Mechanism
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("id")),
                        FamilyId = reader.GetGuid(reader.GetOrdinal("family_id")),
                        Name = reader.GetString(reader.GetOrdinal("name")),
                        Description = reader.IsDBNull(reader.GetOrdinal("description")) ? null : reader.GetString(reader.GetOrdinal("description")),
                        CreatedBy = reader.IsDBNull(reader.GetOrdinal("created_by")) ? null : reader.GetString(reader.GetOrdinal("created_by")),
                        CreatedDate = reader.GetDateTime(reader.GetOrdinal("created_date"))
                    };
                    mechanisms.Add(mechanism);
                }
            }
            return mechanisms;
        }
    
        public async Task<string> GetMechanismExportedJSON(Mechanism mechanism){
            // Extract mechanism information using the json serializer.
            var options = new JsonSerializerOptions { WriteIndented = true };
            string jsonString = System.Text.Json.JsonSerializer.Serialize(mechanism, options);

            // Parse different fields stored in the json into an object.
            var mechanismJson = JsonNode.Parse(jsonString)?.AsObject();
            
            // Remove the fields we don't want and add the version.
            if(mechanismJson != null){
                mechanismJson.Remove("id");
                mechanismJson.Remove("family_id");
                mechanismJson.Remove("created_by");
                mechanismJson.Remove("created_date");
            }

            // Merge JSON objects to add the version field in the correct place.
            var jsonObj = new JsonObject();
            jsonObj.Add("version", "1.0.0");
            if (mechanismJson != null && jsonObj != null)
            {
                foreach (var kvp in mechanismJson)
                {
                    if(kvp.Value == null)
                        continue;
                    jsonObj.Add(kvp.Key, kvp.Value.DeepClone());
                }
            }

            // Get species.
            var speciesService = new SpeciesService(_database);
            var speciesList = await speciesService.GetSpeciesByMechanismIdAsync(mechanism.Id);

            // For all species associated with the mechanism, get their JSON data and store them in an array.
            JsonArray jsonArrSpecies = new JsonArray();
            foreach(Species s in speciesList){
                if(s == null){
                    continue;
                }
                // Get the reaction's json in a string, including reactants, products, etc.
                string sStr = speciesService.GetSpeciesExportedJSON(s);
                jsonArrSpecies.Add(JsonNode.Parse(sStr));
            }

            // Add the array into the json under "species"
            if(jsonObj == null)
                return string.Empty;
            jsonObj.Add("species", jsonArrSpecies);

            // Get reactions
            var reactionService = new ReactionService(_database);
            var reactionList = await reactionService.GetReactionsByMechanismIdAsync(mechanism.Id);

            // For all reactions associated with the mechanism, get their JSON data and store them in an array
            JsonArray jsonArr = new JsonArray();
            foreach(Reaction r in reactionList){
                var reaction = await reactionService.GetReactionAsync(r.Id);
                if(reaction == null){
                    continue;
                }
                // Get the reaction's json in a string, including reactants, products, etc.
                string rStr = await reactionService.GetReactionExportedJSON(reaction);
                jsonArr.Add(JsonNode.Parse(rStr));
            }

            // Add the array into the json under "reactions"
            if(jsonObj == null){
                return string.Empty;
            }
            jsonObj.Add("reactions", jsonArr);

            return jsonObj.ToString();
        }

        public async Task<string> GetMechanismExportedYAML(Mechanism mechanism){
            // Initialize YAML serializer and set options
            var serializer = new SerializerBuilder()
                .WithNamingConvention(CamelCaseNamingConvention.Instance)
                .Build();

            // Get mechanism in JSON format
            string jsonString = await GetMechanismExportedJSON(mechanism);

            // Newtonsoft, as of the time of writing this code, is deprecated. It is compatible with our version of .NET, however.
            // This is used because Newtonsoft has a built-in function to deserialize JSON to then serialize to YAML.
            var expConverter = new ExpandoObjectConverter();
            var deserializedObject = JsonConvert.DeserializeObject<ExpandoObject>(jsonString, expConverter);
            string yamlString = serializer.Serialize(deserializedObject);

            return yamlString;
        }
    }
}
