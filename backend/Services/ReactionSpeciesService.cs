using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json;
using System.Dynamic;

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
                INSERT INTO reaction_species (id, reaction_id, species_id, role)
                VALUES (@id, @reaction_id, @species_id, @role);";

            var id = Guid.NewGuid();

            command.Parameters.AddWithValue("@id", id.ToString());
            command.Parameters.AddWithValue("@reaction_id", reactionSpecies.ReactionId.ToString());
            command.Parameters.AddWithValue("@species_id", reactionSpecies.SpeciesId.ToString());
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

            command.Parameters.AddWithValue("@reactionId", reactionId.ToString());

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
            command.Parameters.AddWithValue("@id", id.ToString());

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

            command.Parameters.AddWithValue("@reactionId", reactionId.ToString());

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

            command.Parameters.AddWithValue("@reactionId", reactionId.ToString());

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

            command.Parameters.AddWithValue("@id", reactionSpecies.Id.ToString());
            command.Parameters.AddWithValue("@role", reactionSpecies.Role);

            await command.ExecuteNonQueryAsync();
        }
    
        public string GetReactantsProductsExportedJSON(ReactionSpeciesDto rp){
            // Extract reaction/product information using the json serializer
            var options = new JsonSerializerOptions { WriteIndented = true };
            string jsonString = System.Text.Json.JsonSerializer.Serialize(rp, options);

            // Parse different values stored in the json
            var jsonObj = JsonNode.Parse(jsonString)?.AsObject();
            
            // Remove the information we don't want.
            if(jsonObj != null){
                jsonObj.Remove("Id");
                jsonObj.Remove("ReactionId");
                jsonObj.Remove("SpeciesId");
                jsonObj.Remove("Role");    
            }

            if(jsonObj == null)
                return string.Empty;
            else
                return jsonObj.ToString();
        }
    
        public string GetReactantsProductsExportedYAML(ReactionSpeciesDto rp){
            // Initialize YAML serializer and set options
            var serializer = new SerializerBuilder()
                .WithNamingConvention(CamelCaseNamingConvention.Instance)
                .Build();

            // Get species in JSON format
            string jsonString = GetReactantsProductsExportedJSON(rp);

            // Newtonsoft, as of the time of writing this code, is deprecated. It is compatible with our version of .NET, however.
            // This is used because Newtonsoft has a built-in function to deserialize JSON to then serialize to YAML.
            var expConverter = new ExpandoObjectConverter();
            var deserializedObject = JsonConvert.DeserializeObject<ExpandoObject>(jsonString, expConverter);
            string yamlString = serializer.Serialize(deserializedObject);

            return yamlString;
        }
    }
    public class ReactionSpeciesDto
    {
        [JsonPropertyName("ID")]
        [System.Text.Json.Serialization.JsonIgnore]
        public Guid Id { get; set; }

        [JsonPropertyName("reaction ID")]
        [System.Text.Json.Serialization.JsonIgnore]
        public Guid ReactionId { get; set; }
        [JsonPropertyName("species ID")]
        [System.Text.Json.Serialization.JsonIgnore]
        public Guid SpeciesId { get; set; }
        [JsonPropertyName("role")]
        [System.Text.Json.Serialization.JsonIgnore]
        public string Role { get; set; } = string.Empty;
        [JsonPropertyName("species name")]
        public string SpeciesName { get; set; } = string.Empty;
        [JsonPropertyName("coefficient")]
        public int Coefficient { get; set; } = 0;
    }
}
