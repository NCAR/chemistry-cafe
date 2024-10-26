using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;

namespace Chemistry_Cafe_API.Services
{
    public class FamilyService
    {
        private readonly MySqlDataSource _database;

        public FamilyService(MySqlDataSource database)
        {
            _database = database;
        }

        public async Task<IReadOnlyList<Family>> GetFamiliesAsync()
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM families";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<Family?> GetFamilyAsync(int id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM families WHERE id = @id";
            command.Parameters.AddWithValue("@id", id);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<Family> CreateFamilyAsync(string name, string? description, string? createdBy)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                INSERT INTO families (name, description, created_by) 
                VALUES (@name, @description, @created_by);
                SELECT LAST_INSERT_ID();";

            command.Parameters.AddWithValue("@name", name);
            command.Parameters.AddWithValue("@description", description ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@created_by", createdBy ?? (object)DBNull.Value);

            var familyId = Convert.ToInt32(await command.ExecuteScalarAsync());

            var family = new Family
            {
                Id = familyId,
                Name = name,
                Description = description,
                CreatedBy = createdBy,
                CreatedDate = DateTime.UtcNow
            };

            return family;
        }

        public async Task UpdateFamilyAsync(Family family)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                UPDATE families 
                SET name = @name, 
                    description = @description, 
                    created_by = @created_by 
                WHERE id = @id;";

            command.Parameters.AddWithValue("@id", family.Id);
            command.Parameters.AddWithValue("@name", family.Name);
            command.Parameters.AddWithValue("@description", family.Description ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@created_by", family.CreatedBy ?? (object)DBNull.Value);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteFamilyAsync(int id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"DELETE FROM families WHERE id = @id;";

            command.Parameters.AddWithValue("@id", id);

            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<Family>> ReadAllAsync(DbDataReader reader)
        {
            var families = new List<Family>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var family = new Family
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("id")),
                        Name = reader.GetString(reader.GetOrdinal("name")),
                        Description = reader.IsDBNull(reader.GetOrdinal("description")) ? null : reader.GetString(reader.GetOrdinal("description")),
                        CreatedBy = reader.IsDBNull(reader.GetOrdinal("created_by")) ? null : reader.GetString(reader.GetOrdinal("created_by")),
                        CreatedDate = reader.IsDBNull(reader.GetOrdinal("created_date")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("created_date"))
                    };
                    families.Add(family);
                }
            }
            return families;
        }
    }
}
