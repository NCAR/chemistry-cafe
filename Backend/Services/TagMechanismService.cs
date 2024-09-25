using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;
using System;

namespace Chemistry_Cafe_API.Services
{
    public class TagMechanismService(MySqlDataSource database)
    {
        public async Task<IReadOnlyList<TagMechanism>> GetTagMechanismsAsync()
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM TagMechanism WHERE isDel = FALSE";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<TagMechanism?> GetTagMechanismAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM TagMechanism WHERE uuid = @id";
            command.Parameters.AddWithValue("@id", uuid);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<IReadOnlyList<TagMechanism>> GetTagsAsync(Guid family_uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT TagMechanism.uuid, TagMechanism.tag, TagMechanism.isDel FROM Family_TagMechanism_List LEFT JOIN TagMechanism ON tag_mechanism_uuid = TagMechanism.uuid WHERE family_uuid = @family_uuid AND TagMechanism.isDel = False";
            command.Parameters.AddWithValue("@family_uuid", family_uuid);

            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<Guid> CreateTagMechanismAsync(string tag)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            Guid tagMechanismID = Guid.NewGuid();

            command.CommandText = @"INSERT INTO TagMechanism (uuid, tag) VALUES (@uuid, @tag);";

            command.Parameters.AddWithValue("@uuid", tagMechanismID);
            command.Parameters.AddWithValue("@tag", tag);

            await command.ExecuteNonQueryAsync();

            return tagMechanismID;
        }
        public async Task UpdateTagMechanismAsync(TagMechanism tagMechanism)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE TagMechanism SET tag = @tag, isDel = @isDel WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", tagMechanism.uuid);
            command.Parameters.AddWithValue("@tag", tagMechanism.tag);
            command.Parameters.AddWithValue("@isDel", tagMechanism.isDel);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteTagMechanismAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE TagMechanism SET isDel = 1 WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", uuid);

            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<TagMechanism>> ReadAllAsync(DbDataReader reader)
        {
            var tagMechanisms = new List<TagMechanism>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var tagMechanism = new TagMechanism
                    {
                        uuid = reader.GetGuid(0),
                        tag = reader.GetString(1),
                        isDel = reader.GetBoolean(2),
                    };
                    tagMechanisms.Add(tagMechanism);
                }
            }
            return tagMechanisms;
        }
    }
}
