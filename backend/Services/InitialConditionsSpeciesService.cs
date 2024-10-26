using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;

namespace Chemistry_Cafe_API.Services
{
    public class InitialConditionSpeciesService
    {
        private readonly MySqlDataSource _database;

        public InitialConditionSpeciesService(MySqlDataSource database)
        {
            _database = database;
        }

        public async Task<IReadOnlyList<InitialConditionsSpecies>> GetInitialConditionsByMechanismIdAsync(int mechanismId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM initial_conditions_species WHERE mechanism_id = @mechanism_id";
            command.Parameters.AddWithValue("@mechanism_id", mechanismId);

            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<InitialConditionsSpecies> CreateInitialConditionAsync(InitialConditionsSpecies initialCondition)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                INSERT INTO initial_conditions_species 
                (mechanism_id, species_id, concentration, temperature, pressure, additional_conditions)
                VALUES (@mechanism_id, @species_id, @concentration, @temperature, @pressure, @additional_conditions);
                SELECT LAST_INSERT_ID();";

            command.Parameters.AddWithValue("@mechanism_id", initialCondition.MechanismId);
            command.Parameters.AddWithValue("@species_id", initialCondition.SpeciesId);
            command.Parameters.AddWithValue("@concentration", initialCondition.Concentration ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@temperature", initialCondition.Temperature ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@pressure", initialCondition.Pressure ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@additional_conditions", initialCondition.AdditionalConditions ?? (object)DBNull.Value);

            var id = Convert.ToInt32(await command.ExecuteScalarAsync());
            initialCondition.Id = id;

            return initialCondition;
        }

        public async Task UpdateInitialConditionAsync(InitialConditionsSpecies initialCondition)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                UPDATE initial_conditions_species 
                SET concentration = @concentration, 
                    temperature = @temperature, 
                    pressure = @pressure, 
                    additional_conditions = @additional_conditions
                WHERE id = @id;";

            command.Parameters.AddWithValue("@id", initialCondition.Id);
            command.Parameters.AddWithValue("@concentration", initialCondition.Concentration ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@temperature", initialCondition.Temperature ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@pressure", initialCondition.Pressure ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@additional_conditions", initialCondition.AdditionalConditions ?? (object)DBNull.Value);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteInitialConditionAsync(int id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "DELETE FROM initial_conditions_species WHERE id = @id";
            command.Parameters.AddWithValue("@id", id);

            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<InitialConditionsSpecies>> ReadAllAsync(DbDataReader reader)
        {
            var initialConditions = new List<InitialConditionsSpecies>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var ic = new InitialConditionsSpecies
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("id")),
                        MechanismId = reader.GetInt32(reader.GetOrdinal("mechanism_id")),
                        SpeciesId = reader.GetInt32(reader.GetOrdinal("species_id")),
                        Concentration = reader.IsDBNull(reader.GetOrdinal("concentration")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("concentration")),
                        Temperature = reader.IsDBNull(reader.GetOrdinal("temperature")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("temperature")),
                        Pressure = reader.IsDBNull(reader.GetOrdinal("pressure")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("pressure")),
                        AdditionalConditions = reader.IsDBNull(reader.GetOrdinal("additional_conditions")) ? null : reader.GetString(reader.GetOrdinal("additional_conditions"))
                    };
                    initialConditions.Add(ic);
                }
            }
            return initialConditions;
        }
    }
}
