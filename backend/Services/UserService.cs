using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;


namespace Chemistry_Cafe_API.Services
{
    public class UserService(MySqlDataSource database)
    {
        public async Task<IReadOnlyList<User>> GetUsersAsync()
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM User WHERE isDel = 0";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<User?> GetUserAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM User WHERE uuid = @id";
            command.Parameters.AddWithValue("@id", uuid);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<Guid> CreateUserAsync(string log_in_info)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            Guid userID = Guid.NewGuid();

            command.CommandText = @"INSERT INTO User (uuid, log_in_info, role) VALUES (@uuid, @log_in_info, @role);";

            command.Parameters.AddWithValue("@uuid", userID);
            command.Parameters.AddWithValue("@log_in_info", log_in_info);
            command.Parameters.AddWithValue("@role", "unverified");

            await command.ExecuteNonQueryAsync();

            return userID;
        }
        public async Task UpdateUserAsync(User user)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE User SET log_in_info = @log_in_info, isDel = @isDel, role = @role WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", user.uuid);
            command.Parameters.AddWithValue("@log_in_info", user.log_in_info);
            command.Parameters.AddWithValue("@isDel", user.isDel);
            command.Parameters.AddWithValue("@role", user.role);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteUserAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE User SET isDel = 1 WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", uuid);

            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<User>> ReadAllAsync(DbDataReader reader)
        {
            var users = new List<User>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var user = new User
                    {
                        uuid = reader.GetGuid(0),
                        log_in_info = reader.IsDBNull(1) ? string.Empty : reader.GetString(1),
                        isDel = !reader.IsDBNull(2) && reader.GetBoolean(2),
                        role = reader.IsDBNull(3) ? "unverified" : reader.GetString(3)
                    };
                    users.Add(user);
                }
            }
            return users;
        }
    }
}
