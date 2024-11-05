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

        public async Task<IReadOnlyList<UserMechanism>> GetUserMechanismsByUserIdAsync(Guid userId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT 
                    user_mechanisms.id AS UserMechanismId,
                    user_mechanisms.user_id AS UserId,
                    user_mechanisms.mechanism_id AS MechanismId,
                    user_mechanisms.role AS Role,
                    mechanisms.name AS MechanismName,
                    mechanisms.description AS MechanismDescription
                FROM user_mechanisms
                INNER JOIN mechanisms ON user_mechanisms.mechanism_id = mechanisms.id
                WHERE user_mechanisms.user_id = @userId";

            command.Parameters.AddWithValue("@userId", userId);

            var userMechanismList = new List<UserMechanism>();

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var userMechanism = new UserMechanism
                {
                    Id = reader.GetGuid(reader.GetOrdinal("UserMechanismId")),
                    UserId = reader.GetGuid(reader.GetOrdinal("UserId")),
                    MechanismId = reader.GetGuid(reader.GetOrdinal("MechanismId")),
                    Role = reader.IsDBNull(reader.GetOrdinal("Role")) ? null : reader.GetString(reader.GetOrdinal("Role")),
                    Mechanism = new Mechanism
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("MechanismId")),
                        Name = reader.GetString(reader.GetOrdinal("MechanismName")),
                        Description = reader.IsDBNull(reader.GetOrdinal("MechanismDescription")) ? null : reader.GetString(reader.GetOrdinal("MechanismDescription"))
                    }
                };
                userMechanismList.Add(userMechanism);
            }

            return userMechanismList;
        }

        public async Task<IReadOnlyList<User>> GetUsersByMechanismIdAsync(Guid mechanismId)
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

        public async Task RemoveUserFromMechanismAsync(Guid id)
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
                        Id = reader.GetGuid(reader.GetOrdinal("id")),
                        FamilyId = reader.GetGuid(reader.GetOrdinal("family_id")),
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
                        Id = reader.GetGuid(reader.GetOrdinal("id")),
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
