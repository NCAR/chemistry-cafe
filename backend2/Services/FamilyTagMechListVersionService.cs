using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;

namespace Chemistry_Cafe_API.Services
{
    public class FamilyTagMechListVersionService(MySqlDataSource database)
    {
        public async Task<IReadOnlyList<FamilyTagMechListVersion>> GetFamilyMechListVersionsAsync()
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM Family_TagMechanism_List_Version WHERE isDel = 0";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<FamilyTagMechListVersion?> GetFamilyMechListVersionAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM Family_TagMechanism_List_Version WHERE uuid = @id";
            command.Parameters.AddWithValue("@id", uuid);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<Guid> CreateFamilyMechListVersionAsync(FamilyTagMechListVersion newFamilyMechListVersion)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            Guid familyMechListVersionID = Guid.NewGuid();

            command.CommandText = @"INSERT INTO Family_TagMechanism_List_Version (uuid, family_uuid, tag_mechanism_uuid, frozen_version, action, user_uuid, datetime) VALUES (@uuid, @family_uuid, @tag_mechanism_uuid, @frozen_version, @action, @user_uuid, @datetime);";

            command.Parameters.AddWithValue("@uuid", familyMechListVersionID);
            command.Parameters.AddWithValue("@family_uuid", newFamilyMechListVersion.family_uuid);
            command.Parameters.AddWithValue("@tag_mechanism_uuid", newFamilyMechListVersion.tag_mechanism_uuid);
            command.Parameters.AddWithValue("@frozen_version", newFamilyMechListVersion.frozen_version);
            command.Parameters.AddWithValue("@action", newFamilyMechListVersion.action);
            command.Parameters.AddWithValue("@user_uuid", newFamilyMechListVersion.user_uuid);
            command.Parameters.AddWithValue("@datetime", newFamilyMechListVersion.datetime);

            await command.ExecuteNonQueryAsync();

            return familyMechListVersionID;
        }
        public async Task UpdateFamilyMechListVersionAsync(FamilyTagMechListVersion familyMechListVersion)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE Family_TagMechanism_List_Version SET family_uuid = @family_uuid, tag_mechanism_uuid = @tag_mechanism_uuid, frozen_version = @frozen_version, action = @action, user_uuid = @user_uuid, datetime = @datetime, isDel = @isDel WHERE uuid = @uuid;";
            
            command.Parameters.AddWithValue("@uuid", familyMechListVersion.uuid);
            command.Parameters.AddWithValue("@family_uuid", familyMechListVersion.family_uuid);
            command.Parameters.AddWithValue("@tag_mechanism_uuid", familyMechListVersion.tag_mechanism_uuid);
            command.Parameters.AddWithValue("@frozen_version", familyMechListVersion.frozen_version);
            command.Parameters.AddWithValue("@action", familyMechListVersion.action);
            command.Parameters.AddWithValue("@user_uuid", familyMechListVersion.user_uuid);
            command.Parameters.AddWithValue("@datetime", familyMechListVersion.datetime);
            command.Parameters.AddWithValue("@isDel", familyMechListVersion.isDel);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteFamilyMechListVersionAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE Family_TagMechanism_List_Version SET isDel = 1 WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", uuid);
            
            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<FamilyTagMechListVersion>> ReadAllAsync(DbDataReader reader)
        {
            var familyMechListVersion = new List<FamilyTagMechListVersion>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var familyMechVersion = new FamilyTagMechListVersion
                    {
                        uuid = reader.GetGuid(0),
                        family_uuid = reader.GetGuid(1),
                        tag_mechanism_uuid = reader.GetGuid(2),
                        frozen_version = reader.GetString(3),
                        action = reader.GetString(4),
                        user_uuid = reader.GetGuid(5),
                        datetime = reader.GetDateTime(6),
                        isDel = reader.GetBoolean(7),
                    };
                    familyMechListVersion.Add(familyMechVersion);
                }
            }
            return familyMechListVersion;
        }
    }
}
