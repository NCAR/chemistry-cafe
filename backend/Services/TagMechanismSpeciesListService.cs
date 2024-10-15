using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;

namespace Chemistry_Cafe_API.Services
{
    public class TagMechanismSpeciesListService (MySqlDataSource database)
    {
        public async Task<IReadOnlyList<TagMechanismSpeciesList>> GetTagMechanismSpeciessAsync()
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM TagMechanism_Species_List WHERE isDel = 0";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<TagMechanismSpeciesList?> GetTagMechanismSpeciesAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM TagMechanism_Species_List WHERE uuid = @id";
            command.Parameters.AddWithValue("@id", uuid);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<Guid> CreateTagMechanismSpeciesAsync(TagMechanismSpeciesList newTagMechanismSpecies)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            Guid tagMechanismSpeciesID = Guid.NewGuid();

            command.CommandText = @"INSERT INTO TagMechanism_Species_List (uuid, species_uuid, tag_mechanism_uuid, version) VALUES (@uuid, @species_uuid, @tag_mechanism_uuid, @version);";

            command.Parameters.AddWithValue("@uuid", tagMechanismSpeciesID);
            command.Parameters.AddWithValue("@species_uuid", newTagMechanismSpecies.species_uuid);
            command.Parameters.AddWithValue("@tag_mechanism_uuid", newTagMechanismSpecies.tag_mechanism_uuid);
            command.Parameters.AddWithValue("@version", newTagMechanismSpecies.version);

            await command.ExecuteNonQueryAsync();

            return tagMechanismSpeciesID;
        }
        public async Task UpdateTagMechanismSpeciesAsync(TagMechanismSpeciesList tagMechanismSpecies)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE TagMechanism_Species_List SET species_uuid = @species_uuid, tag_mechanism_uuid = @tag_mechanism_uuid, version = @version, isDel = @isDel WHERE uuid = @uuid;";
            
            command.Parameters.AddWithValue("@uuid", tagMechanismSpecies.uuid);
            command.Parameters.AddWithValue("@species_uuid", tagMechanismSpecies.species_uuid);
            command.Parameters.AddWithValue("@tag_mechanism_uuid", tagMechanismSpecies.tag_mechanism_uuid);
            command.Parameters.AddWithValue("@version", tagMechanismSpecies.version);
            command.Parameters.AddWithValue("@isDel", tagMechanismSpecies.isDel);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteTagMechanismSpeciesAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE TagMechanism_Species_List SET isDel = 1 WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", uuid);
            
            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<TagMechanismSpeciesList>> ReadAllAsync(DbDataReader reader)
        {
            var tagMechanismSpecies = new List<TagMechanismSpeciesList>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var mechTag = new TagMechanismSpeciesList
                    {
                        uuid = reader.GetGuid(0),
                        tag_mechanism_uuid = reader.GetGuid(1),
                        species_uuid = reader.GetGuid(2),
                        version = reader.GetString(3),
                        isDel = reader.GetBoolean(4),
                    };
                    tagMechanismSpecies.Add(mechTag);
                }
            }
            return tagMechanismSpecies;
        }
    }
}
