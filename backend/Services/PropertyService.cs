using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;

namespace Chemistry_Cafe_API.Services
{
    public class PropertyService
    {
        private readonly MySqlDataSource _database;

        public PropertyService(MySqlDataSource database)
        {
            _database = database;
        }

        public async Task<IReadOnlyList<Property>> GetPropertiesAsync()
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM properties";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<Property?> GetPropertyByIdAsync(Guid id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM properties WHERE id = @id";
            command.Parameters.AddWithValue("@id", id);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<Property?> GetPropertyBySandMAsync(Guid species, Guid mechanism)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM properties WHERE species_id = @species AND mechanism_id = @mechanism";
            command.Parameters.AddWithValue("@species", species);
            command.Parameters.AddWithValue("@mechanism", mechanism);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<Property> CreatePropertyAsync(Property property)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var transaction = await connection.BeginTransactionAsync();

            try
            {
                // Generate a new UUID for the property
                property.Id = Guid.NewGuid();

                // Insert the new property with minimal required fields
                using (var insertCommand = connection.CreateCommand())
                {
                    insertCommand.Transaction = transaction;
                    insertCommand.CommandText = @"
                        INSERT INTO properties (id, species_id, mechanism_id, tolerance, weight, concentration, diffusion)
                        VALUES (@id, @species_id, @mechanism_id, @tolerance, @weight, @concentration, @diffusion);";

                    insertCommand.Parameters.AddWithValue("@id", property.Id.ToString());
                    insertCommand.Parameters.AddWithValue("@species_id", property.SpeciesId.ToString());
                    insertCommand.Parameters.AddWithValue("@mechanism_id", property.MechanismId.ToString());
                    insertCommand.Parameters.AddWithValue("@tolerance", property.Tolerance ?? 0.0);
                    insertCommand.Parameters.AddWithValue("@weight", property.Weight ?? 0.0);
                    insertCommand.Parameters.AddWithValue("@concentration", property.Concentration ?? 0.0);
                    insertCommand.Parameters.AddWithValue("@diffusion", property.Diffusion ?? 0.0);

                    await insertCommand.ExecuteNonQueryAsync();
                }

                await transaction.CommitAsync();
                return property;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                // Log the exception for debugging
                Console.Error.WriteLine($"Error creating property: {ex}");
                throw; // Re-throw the exception to propagate the error
            }
        }
        public async Task UpdatePropertyAsync(Property property)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                UPDATE properties 
                SET species_id = @species_id, 
                    mechanism_id = @mechanism_id,
                    tolerance = @tolerance, 
                    weight = @weight, 
                    concentration = @concentration, 
                    diffusion = @diffusion
                WHERE id = @id;";

            command.Parameters.AddWithValue("@id", property.Id.ToString());
            command.Parameters.AddWithValue("@species_id", property.SpeciesId.ToString());
            command.Parameters.AddWithValue("@mechanism_id", property.MechanismId.ToString());
            command.Parameters.AddWithValue("@tolerance", property.Tolerance);
            command.Parameters.AddWithValue("@weight", property.Weight);
            command.Parameters.AddWithValue("@concentration", property.Concentration);
            command.Parameters.AddWithValue("@diffusion", property.Diffusion);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeletePropertyAsync(Guid id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "DELETE FROM properties WHERE id = @id";
            command.Parameters.AddWithValue("@id", id.ToString());

            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<Property>> ReadAllAsync(DbDataReader reader)
        {
            var properties = new List<Property>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var property = new Property
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("id")),
                        SpeciesId = reader.GetGuid(reader.GetOrdinal("species_id")),
                        MechanismId = reader.GetGuid(reader.GetOrdinal("mechanism_id")),
                        Tolerance = reader.GetDouble(reader.GetOrdinal("tolerance")),
                        Weight = reader.GetDouble(reader.GetOrdinal("weight")),
                        Concentration = reader.GetDouble(reader.GetOrdinal("concentration")),
                        Diffusion = reader.GetDouble(reader.GetOrdinal("diffusion"))
                    };
                    properties.Add(property);
                }
            }
            return properties;
        }
    }
}
