using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;

namespace Chemistry_Cafe_API.Services
{
    public class MechanismSpeciesService
    {
        private readonly MySqlDataSource _database;

        private readonly ILogger<MechanismSpeciesService> _logger;

        public MechanismSpeciesService(MySqlDataSource database, ILogger<MechanismSpeciesService> logger)
        {
            _database = database;
            _logger = logger;
        }

        public async Task<bool> MechanismSpeciesExistsAsync(Guid mechanismId, Guid speciesId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT COUNT(*) FROM mechanism_species 
                WHERE mechanism_id = @mechanism_id AND species_id = @species_id";
            
            command.Parameters.AddWithValue("@mechanism_id", mechanismId.ToString());
            command.Parameters.AddWithValue("@species_id", speciesId.ToString());

            var count = Convert.ToInt32(await command.ExecuteScalarAsync());
            return count > 0;
        }

        public async Task<bool> MechanismExistsAsync(Guid mechanismId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT COUNT(*) FROM mechanisms WHERE id = @id";
            command.Parameters.AddWithValue("@id", mechanismId.ToString());

            var count = Convert.ToInt32(await command.ExecuteScalarAsync());
            return count > 0;
        }

        public async Task<bool> SpeciesExistsAsync(Guid speciesId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT COUNT(*) FROM species WHERE id = @id";
            command.Parameters.AddWithValue("@id", speciesId.ToString());

            var count = Convert.ToInt32(await command.ExecuteScalarAsync());
            return count > 0;
        }



        public async Task AddSpeciesToMechanismAsync(MechanismSpecies mechanismSpecies)
        {
            if (await MechanismSpeciesExistsAsync(mechanismSpecies.MechanismId, mechanismSpecies.SpeciesId))
            {
                Console.WriteLine("MechanismSpecies mapping already exists.");
                return;
            }

            // **Check if Mechanism Exists**
            if (!await MechanismExistsAsync(mechanismSpecies.MechanismId))
            {
                Console.WriteLine("mechanism already exists");
                throw new ArgumentException("Invalid MechanismId. Mechanism does not exist.");
            }

            if (!await SpeciesExistsAsync(mechanismSpecies.SpeciesId))
            {
                Console.WriteLine("species id already exists");
                throw new ArgumentException("Invalid SpeciesId. Species does not exist.");
            }


            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            mechanismSpecies.Id = Guid.NewGuid();

            command.CommandText = @"
                INSERT INTO mechanism_species (id, mechanism_id, species_id)
                VALUES (@id, @mechanism_id, @species_id);";

            _logger.LogInformation("MechanismSpecies Id: {Id}", mechanismSpecies.Id);
            _logger.LogInformation("Mechanism Id: {MechanismId}", mechanismSpecies.MechanismId);
            _logger.LogInformation("Species Id: {SpeciesId}", mechanismSpecies.SpeciesId);

            command.Parameters.AddWithValue("@id", mechanismSpecies.Id.ToString());
            command.Parameters.AddWithValue("@mechanism_id", mechanismSpecies.MechanismId.ToString());
            command.Parameters.AddWithValue("@species_id", mechanismSpecies.SpeciesId.ToString());

            await command.ExecuteNonQueryAsync();
        }


        public async Task<IReadOnlyList<MechanismSpecies>> GetMechanismSpeciesByMechanismIdAsync(Guid mechanismId)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT 
                    mechanism_species.id AS MechanismSpeciesId,
                    mechanism_species.mechanism_id AS MechanismId,
                    mechanism_species.species_id AS SpeciesId,
                    species.name AS SpeciesName,
                    species.description AS SpeciesDescription
                FROM mechanism_species
                INNER JOIN species ON mechanism_species.species_id = species.id
                WHERE mechanism_species.mechanism_id = @mechanismId";

            command.Parameters.AddWithValue("@mechanismId", mechanismId.ToString());

            var mechanismSpeciesList = new List<MechanismSpecies>();

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var mechanismSpecies = new MechanismSpecies
                {
                    Id = reader.GetGuid(reader.GetOrdinal("MechanismSpeciesId")),
                    MechanismId = reader.GetGuid(reader.GetOrdinal("MechanismId")),
                    SpeciesId = reader.GetGuid(reader.GetOrdinal("SpeciesId")),
                    Species = new Species
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("SpeciesId")),
                        Name = reader.GetString(reader.GetOrdinal("SpeciesName")),
                        Description = reader.IsDBNull(reader.GetOrdinal("SpeciesDescription")) ? null : reader.GetString(reader.GetOrdinal("SpeciesDescription"))
                    }
                };
                mechanismSpeciesList.Add(mechanismSpecies);
            }

            return mechanismSpeciesList;
        }

        public async Task RemoveSpeciesFromMechanismAsync(Guid id)
        {
            using var connection = await _database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "DELETE FROM mechanism_species WHERE id = @id";
            command.Parameters.AddWithValue("@id", id.ToString());

            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<Species>> ReadSpeciesAsync(DbDataReader reader)
        {
            var speciesList = new List<Species>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var species = new Species
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("id")),
                        Name = reader.GetString(reader.GetOrdinal("name")),
                        Description = reader.IsDBNull(reader.GetOrdinal("description")) ? null : reader.GetString(reader.GetOrdinal("description")),
                        CreatedBy = reader.IsDBNull(reader.GetOrdinal("created_by")) ? null : reader.GetString(reader.GetOrdinal("created_by")),
                        CreatedDate = reader.GetDateTime(reader.GetOrdinal("created_date"))
                    };
                    speciesList.Add(species);
                }
            }
            return speciesList;
        }

        private async Task<IReadOnlyList<MechanismSpecies>> ReadAllAsync(DbDataReader reader)
        {
            var mechanismSpeciesList = new List<MechanismSpecies>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var ms = new MechanismSpecies
                    {
                        Id = Guid.Parse(reader.GetString(reader.GetOrdinal("MechanismSpeciesId"))),
                        MechanismId = Guid.Parse(reader.GetString(reader.GetOrdinal("MechanismId"))),
                        SpeciesId = Guid.Parse(reader.GetString(reader.GetOrdinal("SpeciesId"))),
                        Species = new Species
                        {
                            Id = Guid.Parse(reader.GetString(reader.GetOrdinal("SpeciesId"))),
                            Name = reader.GetString(reader.GetOrdinal("SpeciesName")),
                            Description = reader.IsDBNull(reader.GetOrdinal("SpeciesDescription")) ? null : reader.GetString(reader.GetOrdinal("SpeciesDescription"))
                        }
                    };
                    mechanismSpeciesList.Add(ms);
                }
            }
            return mechanismSpeciesList;
        }

    }
}
