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

        public async Task<IReadOnlyList<InitialConditionsSpecies>> GetInitialConditionsByMechanismIdAsync(Guid mechanismId)
        {
            try {
                using var connection = await _database.OpenConnectionAsync();
                using var command = connection.CreateCommand();

                command.CommandText = @"
                    SELECT 
                        initial_conditions_species.id AS InitialConditionSpeciesId,
                        initial_conditions_species.mechanism_id AS MechanismId,
                        initial_conditions_species.species_id AS SpeciesId,
                        initial_conditions_species.concentration AS Concentration,
                        initial_conditions_species.temperature AS Temperature,
                        initial_conditions_species.pressure AS Pressure,
                        initial_conditions_species.additional_conditions AS AdditionalConditions,
                        initial_conditions_species.abs_convergence_tolerance as AbsConvergenceTolerance,
                        initial_conditions_species.diffusion_coefficient as DiffusionCoefficient,
                        initial_conditions_species.molecular_weight as MolecularWeight,
                        initial_conditions_species.fixed_concentration as FixedConcentration,
                        species.name AS SpeciesName,
                        species.description AS SpeciesDescription
                    FROM initial_conditions_species
                    INNER JOIN species ON initial_conditions_species.species_id = species.id
                    WHERE initial_conditions_species.mechanism_id = @mechanismId";

                command.Parameters.AddWithValue("@mechanismId", mechanismId);

                var initialConditionsList = new List<InitialConditionsSpecies>();

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var initialCondition = new InitialConditionsSpecies
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("InitialConditionSpeciesId")),
                        MechanismId = reader.GetGuid(reader.GetOrdinal("MechanismId")),
                        SpeciesId = reader.GetGuid(reader.GetOrdinal("SpeciesId")),
                        Concentration = reader.IsDBNull(reader.GetOrdinal("Concentration")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("Concentration")),
                        Temperature = reader.IsDBNull(reader.GetOrdinal("Temperature")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("Temperature")),
                        Pressure = reader.IsDBNull(reader.GetOrdinal("Pressure")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("Pressure")),
                        AdditionalConditions = reader.IsDBNull(reader.GetOrdinal("AdditionalConditions")) ? null : reader.GetString(reader.GetOrdinal("AdditionalConditions")),
                        AbsConvergenceTolerance = reader.IsDBNull(reader.GetOrdinal("AbsConvergenceTolerance")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("AbsConvergenceTolerance")),
                        DiffusionCoefficient = reader.IsDBNull(reader.GetOrdinal("DiffusionCoefficient")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("DiffusionCoefficient")),
                        MolecularWeight = reader.IsDBNull(reader.GetOrdinal("MolecularWeight")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("MolecularWeight")),
                        FixedConcentration = reader.IsDBNull(reader.GetOrdinal("FixedConcentration")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("FixedConcentration")),
                        Species = new Species
                        {
                            Id = reader.GetGuid(reader.GetOrdinal("SpeciesId")),
                            Name = reader.GetString(reader.GetOrdinal("SpeciesName")),
                            Description = reader.IsDBNull(reader.GetOrdinal("SpeciesDescription")) ? null : reader.GetString(reader.GetOrdinal("SpeciesDescription"))
                        }
                    };
                    initialConditionsList.Add(initialCondition);
                }
                return initialConditionsList;
            } catch (Exception ex) {
                Console.Error.WriteLine($"Error getting all initial conditions: {ex.Message}");
                throw;
            }
        }

        public async Task<InitialConditionsSpecies> CreateInitialConditionAsync(InitialConditionsSpecies initialCondition)
        {
            try {
                using var connection = await _database.OpenConnectionAsync();
                using var command = connection.CreateCommand();

                var id = Guid.NewGuid();
                command.CommandText = @"
                    INSERT INTO initial_conditions_species 
                    (id, mechanism_id, species_id, concentration, temperature, pressure, additional_conditions, 
                    abs_convergence_tolerance, diffusion_coefficient, molecular_weight, fixed_concentration)
                    VALUES (@id, @mechanism_id, @species_id, @concentration, @temperature, @pressure, @additional_conditions, 
                    @abs_convergence_tolerance, @diffusion_coefficient, @molecular_weight, @fixed_concentration);";

                command.Parameters.AddWithValue("@id", id.ToString());
                command.Parameters.AddWithValue("@mechanism_id", initialCondition.MechanismId.ToString());
                command.Parameters.AddWithValue("@species_id", initialCondition.SpeciesId.ToString());
                command.Parameters.AddWithValue("@concentration", initialCondition.Concentration ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@temperature", initialCondition.Temperature ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@pressure", initialCondition.Pressure ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@additional_conditions", initialCondition.AdditionalConditions ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@abs_convergence_tolerance", initialCondition.AbsConvergenceTolerance ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@diffusion_coefficient", initialCondition.DiffusionCoefficient ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@molecular_weight", initialCondition.MolecularWeight ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@fixed_concentration", initialCondition.FixedConcentration ?? (object)DBNull.Value);

                await command.ExecuteNonQueryAsync();

                initialCondition.Id = id;
                return initialCondition;
            } catch (Exception ex) {
                Console.Error.WriteLine($"Error creating initial conditions: {ex.Message}");
                throw;
            }
        }

        public async Task UpdateInitialConditionAsync(InitialConditionsSpecies initialCondition)
        {
                try {
                    using var connection = await _database.OpenConnectionAsync();
                using var command = connection.CreateCommand();

                command.CommandText = @"
                    UPDATE initial_conditions_species 
                    SET concentration = @concentration, 
                        temperature = @temperature, 
                        pressure = @pressure, 
                        additional_conditions = @additional_conditions,
                        abs_convergence_tolerance = @abs_convergence_tolerance, 
                        diffusion_coefficient = @diffusion_coefficient, 
                        molecular_weight = @molecular_weight, 
                        fixed_concentration = @fixed_concentration
                    WHERE id = @id;";

                command.Parameters.AddWithValue("@id", initialCondition.Id.ToString());
                command.Parameters.AddWithValue("@concentration", initialCondition.Concentration ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@temperature", initialCondition.Temperature ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@pressure", initialCondition.Pressure ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@additional_conditions", initialCondition.AdditionalConditions ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@abs_convergence_tolerance", initialCondition.AdditionalConditions ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@diffusion_coefficient", initialCondition.DiffusionCoefficient ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@molecular_weight", initialCondition.MolecularWeight ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@fixed_concentration", initialCondition.FixedConcentration ?? (object)DBNull.Value);

                await command.ExecuteNonQueryAsync();
            } catch (Exception ex) {
                Console.Error.WriteLine($"Error updating initial conditions: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteInitialConditionAsync(Guid id)
        {
            try {
                using var connection = await _database.OpenConnectionAsync();
                using var command = connection.CreateCommand();

                command.CommandText = "DELETE FROM initial_conditions_species WHERE id = @id";
                command.Parameters.AddWithValue("@id", id.ToString());

                await command.ExecuteNonQueryAsync();
            } catch (Exception ex) {
                Console.Error.WriteLine($"Error deleting initial conditions: {ex.Message}");
                throw;
            }
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
                        Id = reader.GetGuid(reader.GetOrdinal("id")),
                        MechanismId = reader.GetGuid(reader.GetOrdinal("mechanism_id")),
                        SpeciesId = reader.GetGuid(reader.GetOrdinal("species_id")),
                        Concentration = reader.IsDBNull(reader.GetOrdinal("concentration")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("concentration")),
                        Temperature = reader.IsDBNull(reader.GetOrdinal("temperature")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("temperature")),
                        Pressure = reader.IsDBNull(reader.GetOrdinal("pressure")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("pressure")),
                        AdditionalConditions = reader.IsDBNull(reader.GetOrdinal("additional_conditions")) ? null : reader.GetString(reader.GetOrdinal("additional_conditions")),
                        AbsConvergenceTolerance = reader.IsDBNull(reader.GetOrdinal("AbsConvergenceTolerance")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("AbsConvergenceTolerance")),
                        DiffusionCoefficient = reader.IsDBNull(reader.GetOrdinal("DiffusionCoefficient")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("DiffusionCoefficient")),
                        MolecularWeight = reader.IsDBNull(reader.GetOrdinal("MolecularWeight")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("MolecularWeight")),
                        FixedConcentration = reader.IsDBNull(reader.GetOrdinal("FixedConcentration")) ? (double?)null : reader.GetDouble(reader.GetOrdinal("FixedConcentration")),
                        Species = new Species
                        {
                            Id = reader.GetGuid(reader.GetOrdinal("species_id")),
                            Name = reader.GetString(reader.GetOrdinal("SpeciesName")),
                            Description = reader.IsDBNull(reader.GetOrdinal("SpeciesDescription")) ? null : reader.GetString(reader.GetOrdinal("SpeciesDescription"))
                        }
                    };
                    initialConditions.Add(ic);
                }
            }
            return initialConditions;
        }
    }
}
