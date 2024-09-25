using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;


namespace Chemistry_Cafe_API.Services
{
    public class UserPreferencesService(MySqlDataSource database)
    {
        public async Task<IReadOnlyList<UserPreferences>> GetUserPreferencesAsync()
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM User_Preferences WHERE isDel = 0";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<UserPreferences?> GetUserPreferencesAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM User_Preferences WHERE uuid = @id";
            command.Parameters.AddWithValue("@id", uuid);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<Guid> CreateUserPreferencesAsync(UserPreferences userPreferences)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            Guid userPreferencesID = Guid.NewGuid();

            command.CommandText = @"INSERT INTO User_Preferences (uuid, user_uuid, preferences) VALUES (@uuid, @user_uuid, @preferences);";

            command.Parameters.AddWithValue("@uuid", userPreferencesID);
            command.Parameters.AddWithValue("@user_uuid", userPreferences.user_uuid);
            command.Parameters.AddWithValue("@preferences", userPreferences.preferences);

            await command.ExecuteNonQueryAsync();

            return userPreferencesID;
        }
        public async Task UpdateUserPreferencesAsync(UserPreferences userPreferences)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE User_Preferences SET user_uuid = @user_uuid, preferences = @preferences, isDel = @isDel WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", userPreferences.uuid);
            command.Parameters.AddWithValue("@user_uuid", userPreferences.user_uuid);
            command.Parameters.AddWithValue("@preferences", userPreferences.preferences);
            command.Parameters.AddWithValue("@isDel", userPreferences.isDel);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteUserPreferencesAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE User_Preferences SET isDel = 1 WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", uuid);

            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<UserPreferences>> ReadAllAsync(DbDataReader reader)
        {
            var userPreferences = new List<UserPreferences>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var userPreference = new UserPreferences
                    {
                        uuid = reader.GetGuid(0),
                        user_uuid = reader.GetGuid(1),
                        preferences = reader.GetString(2),
                        isDel = reader.GetBoolean(3),
                    };
                    userPreferences.Add(userPreference);
                }
            }
            return userPreferences;
        }
    }
}
