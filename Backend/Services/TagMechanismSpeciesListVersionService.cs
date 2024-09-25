using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;

namespace Chemistry_Cafe_API.Services
{
    public class TagMechanismSpeciesListVersionService(MySqlDataSource database)
    {
        public async Task<IReadOnlyList<TagMechanismSpeciesListVersion>> GetTagMechanismSpeciesListVersionsAsync()
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM TagMechanism_Species_List_Version WHERE isDel = 0";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<TagMechanismSpeciesListVersion?> GetTagMechanismSpeciesListVersionAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM TagMechanism_Species_List_Version WHERE uuid = @id";
            command.Parameters.AddWithValue("@id", uuid);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<Guid> CreateTagMechanismSpeciesListVersionAsync(TagMechanismSpeciesListVersion newTagMechanismSpeciesListVersion)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            Guid tagMechanismSpeciesListVersionID = Guid.NewGuid();

            command.CommandText = @"INSERT INTO TagMechanism_Species_List_Version (uuid, tag_mechanism_uuid, species_uuid, frozen_uuid, action, user_uuid, datetime) VALUES (@uuid, @tag_mechanism_uuid, @species_uuid, @frozen_uuid, @action, @user_uuid, @datetime);";

            command.Parameters.AddWithValue("@uuid", tagMechanismSpeciesListVersionID);
            command.Parameters.AddWithValue("@tag_mechanism_uuid", newTagMechanismSpeciesListVersion.tag_mechanism_uuid);
            command.Parameters.AddWithValue("@species_uuid", newTagMechanismSpeciesListVersion.species_uuid);
            command.Parameters.AddWithValue("@frozen_uuid", newTagMechanismSpeciesListVersion.frozen_uuid);
            command.Parameters.AddWithValue("@action", newTagMechanismSpeciesListVersion.action);
            command.Parameters.AddWithValue("@user_uuid", newTagMechanismSpeciesListVersion.user_uuid);
            command.Parameters.AddWithValue("@datetime", newTagMechanismSpeciesListVersion.datetime);

            await command.ExecuteNonQueryAsync();

            return tagMechanismSpeciesListVersionID;
        }
        public async Task UpdateTagMechanismSpeciesListVersionAsync(TagMechanismSpeciesListVersion tagMechanismSpeciesListVersion)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE TagMechanism_Species_List_Version SET tag_mechanism_uuid = @tag_mechanism_uuid, species_uuid = @species_uuid, frozen_uuid = @frozen_uuid, action = @action, user_uuid = @user_uuid, datetime = @datetime, isDel = @isDel WHERE uuid = @uuid;";
            
            command.Parameters.AddWithValue("@uuid", tagMechanismSpeciesListVersion.uuid);
            command.Parameters.AddWithValue("@tag_mechanism_uuid", tagMechanismSpeciesListVersion.tag_mechanism_uuid);
            command.Parameters.AddWithValue("@species_uuid", tagMechanismSpeciesListVersion.species_uuid);
            command.Parameters.AddWithValue("@frozen_uuid", tagMechanismSpeciesListVersion.frozen_uuid);
            command.Parameters.AddWithValue("@action", tagMechanismSpeciesListVersion.action);
            command.Parameters.AddWithValue("@user_uuid", tagMechanismSpeciesListVersion.user_uuid);
            command.Parameters.AddWithValue("@datetime", tagMechanismSpeciesListVersion.datetime);
            command.Parameters.AddWithValue("@isDel", tagMechanismSpeciesListVersion.isDel);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteTagMechanismSpeciesListVersionAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE TagMechanism_Species_List_Version SET isDel = 1 WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", uuid);
            
            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<TagMechanismSpeciesListVersion>> ReadAllAsync(DbDataReader reader)
        {
            var tagMechanismSpeciesListVersion = new List<TagMechanismSpeciesListVersion>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var familyMechVersion = new TagMechanismSpeciesListVersion
                    {
                        uuid = reader.GetGuid(0),
                        tag_mechanism_uuid = reader.GetGuid(1),
                        species_uuid = reader.GetGuid(2),
                        frozen_uuid = reader.GetGuid(3),
                        action = reader.GetString(4),
                        user_uuid = reader.GetGuid(5),
                        datetime = reader.GetDateTime(6),
                        isDel = reader.GetBoolean(7),
                    };
                    tagMechanismSpeciesListVersion.Add(familyMechVersion);
                }
            }
            return tagMechanismSpeciesListVersion;
        }
    }
}
