using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;

namespace Chemistry_Cafe_API.Services
{
    public class UserService
    {
        private readonly MySqlDataSource _database;

        public UserService(MySqlDataSource database)
        {
            _database = database;
        }

        public async Task<IReadOnlyList<User>> GetUsersAsync()
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM users";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<User?> GetUserByIdAsync(Guid id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM users WHERE id = @id";
            command.Parameters.AddWithValue("@id", id);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM users WHERE email = @email";
            command.Parameters.AddWithValue("@email", email);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<User> CreateUserAsync(User user)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var transaction = await connection.BeginTransactionAsync();

            try
            {
                // Generate a new UUID for the user
                user.Id = Guid.NewGuid();

                // Insert the new user
                using (var insertCommand = connection.CreateCommand())
                {
                    insertCommand.Transaction = transaction;
                    insertCommand.CommandText = @"
                        INSERT INTO users (id, username, role, email)
                        VALUES (@id, @username, @role, @email);";

                    insertCommand.Parameters.AddWithValue("@id", user.Id);
                    insertCommand.Parameters.AddWithValue("@username", user.Username);
                    insertCommand.Parameters.AddWithValue("@role", user.Role);
                    insertCommand.Parameters.AddWithValue("@email", user.Email ?? (object)DBNull.Value);

                    await insertCommand.ExecuteNonQueryAsync();
                }

                await transaction.CommitAsync();
                return user;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                // Log the exception for debugging
                Console.Error.WriteLine($"Error creating user: {ex}");
                throw; // Re-throw the exception to propagate the error
            }
        }


        public async Task UpdateUserAsync(User user)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                UPDATE users 
                SET username = @username, 
                    role = @role, 
                    email = @email
                WHERE id = @id;";

            command.Parameters.AddWithValue("@id", user.Id);
            command.Parameters.AddWithValue("@username", user.Username);
            command.Parameters.AddWithValue("@role", user.Role);
            command.Parameters.AddWithValue("@email", user.Email ?? (object)DBNull.Value);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteUserAsync(Guid id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "DELETE FROM users WHERE id = @id";
            command.Parameters.AddWithValue("@id", id);

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
