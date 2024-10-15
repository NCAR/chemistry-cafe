using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;

namespace Chemistry_Cafe_API.Services
{
    public class TagMechanismReactionListService (MySqlDataSource database)
    {
        public async Task<IReadOnlyList<TagMechanismReactionList>> GetTagMechanismReactionsAsync()
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM TagMechanism_Reaction_List WHERE isDel = 0";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<TagMechanismReactionList?> GetTagMechanismReactionAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM TagMechanism_Reaction_List WHERE uuid = @id";
            command.Parameters.AddWithValue("@id", uuid);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<Guid> CreateTagMechanismReactionAsync(TagMechanismReactionList newTagMechanismReaction)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            Guid tagMechanismReactionID = Guid.NewGuid();

            command.CommandText = @"INSERT INTO TagMechanism_Reaction_List (uuid, reaction_uuid, tag_mechanism_uuid, version) VALUES (@uuid, @reaction_uuid, @tag_mechanism_uuid, @version);";

            command.Parameters.AddWithValue("@uuid", tagMechanismReactionID);
            command.Parameters.AddWithValue("@reaction_uuid", newTagMechanismReaction.reaction_uuid);
            command.Parameters.AddWithValue("@tag_mechanism_uuid", newTagMechanismReaction.tag_mechanism_uuid);
            command.Parameters.AddWithValue("@version", newTagMechanismReaction.version);

            await command.ExecuteNonQueryAsync();

            return tagMechanismReactionID;
        }
        public async Task UpdateTagMechanismReactionAsync(TagMechanismReactionList tagMechanismReaction)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE TagMechanism_Reaction_List SET reaction_uuid = @reaction_uuid, tag_mechanism_uuid = @tag_mechanism_uuid, version = @version, isDel = @isDel WHERE uuid = @uuid;";
            
            command.Parameters.AddWithValue("@uuid", tagMechanismReaction.uuid);
            command.Parameters.AddWithValue("@reaction_uuid", tagMechanismReaction.reaction_uuid);
            command.Parameters.AddWithValue("@tag_mechanism_uuid", tagMechanismReaction.tag_mechanism_uuid);
            command.Parameters.AddWithValue("@version", tagMechanismReaction.version);
            command.Parameters.AddWithValue("@isDel", tagMechanismReaction.isDel);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteTagMechanismReactionAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE TagMechanism_Reaction_List SET isDel = 1 WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", uuid);
            
            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<TagMechanismReactionList>> ReadAllAsync(DbDataReader reader)
        {
            var tagMechanismReaction = new List<TagMechanismReactionList>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var mechTag = new TagMechanismReactionList
                    {
                        uuid = reader.GetGuid(0),
                        tag_mechanism_uuid = reader.GetGuid(1),
                        reaction_uuid = reader.GetGuid(2),
                        version = reader.GetString(3),
                        isDel = reader.GetBoolean(4),
                    };
                    tagMechanismReaction.Add(mechTag);
                }
            }
            return tagMechanismReaction;
        }
    }
}
