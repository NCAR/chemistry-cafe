using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;

namespace Chemistry_Cafe_API.Services
{
    public class TagMechanismReactionListVersionService(MySqlDataSource database)
    {
        public async Task<IReadOnlyList<TagMechanismReactionListVersion>> GetTagMechanismReactionListVersionsAsync()
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM TagMechanism_Reaction_List_Version WHERE isDel = 0";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<TagMechanismReactionListVersion?> GetTagMechanismReactionListVersionAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM TagMechanism_Reaction_List_Version WHERE uuid = @id";
            command.Parameters.AddWithValue("@id", uuid);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<Guid> CreateTagMechanismReactionListVersionAsync(TagMechanismReactionListVersion newTagMechanismReactionListVersion)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            Guid tagMechanismReactionListVersionID = Guid.NewGuid();

            command.CommandText = @"INSERT INTO TagMechanism_Reaction_List_Version (uuid, tag_mechanism_uuid, reaction_uuid, frozen_version, action, user_uuid, datetime) VALUES (@uuid, @tag_mechanism_uuid, @reaction_uuid, @frozen_version, @action, @user_uuid, @datetime);";

            command.Parameters.AddWithValue("@uuid", tagMechanismReactionListVersionID);
            command.Parameters.AddWithValue("@tag_mechanism_uuid", newTagMechanismReactionListVersion.tag_mechanism_uuid);
            command.Parameters.AddWithValue("@reaction_uuid", newTagMechanismReactionListVersion.reaction_uuid);
            command.Parameters.AddWithValue("@frozen_version", newTagMechanismReactionListVersion.frozen_version);
            command.Parameters.AddWithValue("@action", newTagMechanismReactionListVersion.action);
            command.Parameters.AddWithValue("@user_uuid", newTagMechanismReactionListVersion.user_uuid);
            command.Parameters.AddWithValue("@datetime", newTagMechanismReactionListVersion.datetime);

            await command.ExecuteNonQueryAsync();

            return tagMechanismReactionListVersionID;
        }
        public async Task UpdateTagMechanismReactionListVersionAsync(TagMechanismReactionListVersion tagMechanismReactionListVersion)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE TagMechanism_Reaction_List_Version SET tag_mechanism_uuid = @tag_mechanism_uuid, reaction_uuid = @reaction_uuid, frozen_version = @frozen_version, action = @action, user_uuid = @user_uuid, datetime = @datetime, isDel = @isDel WHERE uuid = @uuid;";
            
            command.Parameters.AddWithValue("@uuid", tagMechanismReactionListVersion.uuid);
            command.Parameters.AddWithValue("@tag_mechanism_uuid", tagMechanismReactionListVersion.tag_mechanism_uuid);
            command.Parameters.AddWithValue("@reaction_uuid", tagMechanismReactionListVersion.reaction_uuid);
            command.Parameters.AddWithValue("@frozen_version", tagMechanismReactionListVersion.frozen_version);
            command.Parameters.AddWithValue("@action", tagMechanismReactionListVersion.action);
            command.Parameters.AddWithValue("@user_uuid", tagMechanismReactionListVersion.user_uuid);
            command.Parameters.AddWithValue("@datetime", tagMechanismReactionListVersion.datetime);
            command.Parameters.AddWithValue("@isDel", tagMechanismReactionListVersion.isDel);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteTagMechanismReactionListVersionAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE TagMechanism_Reaction_List_Version SET isDel = 1 WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", uuid);
            
            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<TagMechanismReactionListVersion>> ReadAllAsync(DbDataReader reader)
        {
            var tagMechanismReactionListVersion = new List<TagMechanismReactionListVersion>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var familyMechVersion = new TagMechanismReactionListVersion
                    {
                        uuid = reader.GetGuid(0),
                        tag_mechanism_uuid = reader.GetGuid(1),
                        reaction_uuid = reader.GetGuid(2),
                        frozen_version = reader.GetString(3),
                        action = reader.GetString(4),
                        user_uuid = reader.GetGuid(5),
                        datetime = reader.GetDateTime(6),
                        isDel = reader.GetBoolean(7),
                    };
                    tagMechanismReactionListVersion.Add(familyMechVersion);
                }
            }
            return tagMechanismReactionListVersion;
        }
    }
}
