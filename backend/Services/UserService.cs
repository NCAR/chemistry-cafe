using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.EntityFrameworkCore;

namespace Chemistry_Cafe_API.Services
{
    public class UserService
    {
        private readonly MySqlDataSource _database;
        private readonly ChemistryDbContext _context;

        public UserService(MySqlDataSource database, ChemistryDbContext context)
        {
            _database = database;
            _context = context;
        }

        public async Task<IReadOnlyList<User>> GetUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User?> GetUserByIdAsync(Guid id)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
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

                    insertCommand.Parameters.AddWithValue("@id", user.Id.ToString());
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

            var existingUser = await GetUserByIdAsync(user.Id);
            if (existingUser == null)
            {
                throw new KeyNotFoundException($"User with ID {user.Id} not found.");
            }


            command.CommandText = @"
                UPDATE users 
                SET username = @username, 
                    role = @role, 
                    email = @email
                WHERE id = @id;";

            command.Parameters.AddWithValue("@id", user.Id.ToString());
            command.Parameters.AddWithValue("@username", user.Username);
            command.Parameters.AddWithValue("@role", user.Role);
            command.Parameters.AddWithValue("@email", user.Email ?? (object)DBNull.Value);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteUserAsync(Guid id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            var existingUser = await GetUserByIdAsync(id);
            if (existingUser == null)
            {
                throw new KeyNotFoundException($"User with ID {id} not found.");
            }


            command.CommandText = "DELETE FROM users WHERE id = @id";
            command.Parameters.AddWithValue("@id", id.ToString());

            await command.ExecuteNonQueryAsync();
        }
    }
}
