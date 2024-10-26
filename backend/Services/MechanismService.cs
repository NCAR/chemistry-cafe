using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;

namespace Chemistry_Cafe_API.Services
{
    public class MechanismService
    {
        private readonly MySqlDataSource _database;

        public MechanismService(MySqlDataSource database)
        {
            _database = database;
        }

        public async Task<IReadOnlyList<Mechanism>> GetMechanismsAsync()
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM mechanisms";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<Mechanism?> GetMechanismAsync(int id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM mechanisms WHERE id = @id";
            command.Parameters.AddWithValue("@id", id);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<Mechanism> CreateMechanismAsync(Mechanism mechanism)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                INSERT INTO mechanisms (family_id, name, description, created_by)
                VALUES (@family_id, @name, @description, @created_by);
                SELECT LAST_INSERT_ID();";

            command.Parameters.AddWithValue("@family_id", mechanism.FamilyId);
            command.Parameters.AddWithValue("@name", mechanism.Name);
            command.Parameters.AddWithValue("@description", mechanism.Description ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@created_by", mechanism.CreatedBy ?? (object)DBNull.Value);

            var mechanismId = Convert.ToInt32(await command.ExecuteScalarAsync());
            mechanism.Id = mechanismId;

            return mechanism;
        }

        public async Task UpdateMechanismAsync(Mechanism mechanism)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                UPDATE mechanisms 
                SET family_id = @family_id, 
                    name = @name, 
                    description = @description, 
                    created_by = @created_by
                WHERE id = @id;";

            command.Parameters.AddWithValue("@id", mechanism.Id);
            command.Parameters.AddWithValue("@family_id", mechanism.FamilyId);
            command.Parameters.AddWithValue("@name", mechanism.Name);
            command.Parameters.AddWithValue("@description", mechanism.Description ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@created_by", mechanism.CreatedBy ?? (object)DBNull.Value);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteMechanismAsync(int id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "DELETE FROM mechanisms WHERE id = @id";
            command.Parameters.AddWithValue("@id", id);

            await command.ExecuteNonQueryAsync();
        }

        public async Task<IReadOnlyList<Mechanism>> GetMechanismsByFamilyIdAsync(int familyId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM mechanisms WHERE family_id = @family_id";
            command.Parameters.AddWithValue("@family_id", familyId);

            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        private async Task<IReadOnlyList<Mechanism>> ReadAllAsync(DbDataReader reader)
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
    }
}
