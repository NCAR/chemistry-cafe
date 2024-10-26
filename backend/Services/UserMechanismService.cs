using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;

namespace Chemistry_Cafe_API.Services
{
    public class UserMechanismService
    {
        private readonly MySqlDataSource _database;

        public UserMechanismService(MySqlDataSource database)
        {
            _database = database;
        }

        public async Task AddUserToMechanismAsync(UserMechanism userMechanism)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                INSERT INTO user_mechanisms (user_id, mechanism_id, role)
                VALUES (@user_id, @mechanism_id, @role);";

            command.Parameters.AddWithValue("@user_id", userMechanism.UserId);
            command.Parameters.AddWithValue("@mechanism_id", userMechanism.MechanismId);
            command.Parameters.AddWithValue("@role", userMechanism.Role ?? (object)DBNull.Value);

            await command.ExecuteNonQueryAsync();
        }

        public async Task<IReadOnlyList<Mechanism>> GetMechanismsByUserIdAsync(int userId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT m.* FROM mechanisms m
                INNER JOIN user_mechanisms um ON m.id = um.mechanism_id
                WHERE um.user_id = @user_id";

            command.Parameters.AddWithValue("@user_id", userId);
            return await ReadMechanismsAsync(await command.ExecuteReaderAsync());
        }

        public async Task<IReadOnlyList<User>> GetUsersByMechanismIdAsync(int mechanismId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT u.* FROM users u
                INNER JOIN user_mechanisms um ON u.id = um.user_id
                WHERE um.mechanism_id = @mechanism_id";

            command.Parameters.AddWithValue("@mechanism_id", mechanismId);
            return await ReadUsersAsync(await command.ExecuteReaderAsync());
        }

        public async Task RemoveUserFromMechanismAsync(int id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "DELETE FROM user_mechanisms WHERE id = @id";
            command.Parameters.AddWithValue("@id", id);

            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<Mechanism>> ReadMechanismsAsync(DbDataReader reader)
        {
            var mechanisms = new List<Mechanism>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var mechanism = new Mechanism
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("id")),
                        FamilyId = reader.GetInt32(reader.GetOrdinal("family_id")),
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

        private async Task<IReadOnlyList<User>> ReadUsersAsync(DbDataReader reader)
        {
            var users = new List<User>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var user = new User
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("id")),
                        Username = reader.GetString(reader.GetOrdinal("username")),
                        Role = reader.GetString(reader.GetOrdinal("role")),
                        Email = reader.IsDBNull(reader.GetOrdinal("email")) ? null : reader.GetString(reader.GetOrdinal("email")),
                        CreatedDate = reader.GetDateTime(reader.GetOrdinal("created_date"))
                    };
                    users.Add(user);
                }
            }
            return users;
        }
    }
}