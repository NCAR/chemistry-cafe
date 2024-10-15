using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;


namespace Chemistry_Cafe_API.Services
{
    public class SpeciesService(MySqlDataSource database)
    {
        public async Task<IReadOnlyList<Species>> GetSpeciesAsync()
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM Species WHERE isDel = 0";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<Species?> GetSpeciesAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM Species WHERE uuid = @id";
            command.Parameters.AddWithValue("@id", uuid);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<IReadOnlyList<Species>> GetTags(Guid tag_mechanism_uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT Species.uuid, Species.type, Species.isDel FROM TagMechanism_Species_List LEFT JOIN Species ON species_uuid = Species.uuid WHERE tag_mechanism_uuid = @tag_mechanism_uuid AND TagMechanism_Species_List.isDel = 0";
            command.Parameters.AddWithValue("@tag_mechanism_uuid", tag_mechanism_uuid);

            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<Guid> CreateSpeciesAsync(string type)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            Guid speciesID = Guid.NewGuid();

            command.CommandText = @"INSERT INTO Species (uuid, type) VALUES (@uuid, @type);";

            command.Parameters.AddWithValue("@uuid", speciesID);
            command.Parameters.AddWithValue("@type", type);

            await command.ExecuteNonQueryAsync();

            return speciesID;
        }
        public async Task UpdateSpeciesAsync(Species species)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE Species SET type = @type, isDel = @isDel WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", species.uuid);
            command.Parameters.AddWithValue("@type", species.type);
            command.Parameters.AddWithValue("@isDel", species.isDel);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteSpeciesAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE Species SET isDel = 1 WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", uuid);

            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<Species>> ReadAllAsync(DbDataReader reader)
        {
            var speciess = new List<Species>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var species = new Species
                    {
                        uuid = reader.GetGuid(0),
                        type = reader.GetString(1),
                        isDel = reader.GetBoolean(2),
                    };
                    speciess.Add(species);
                }
            }
            return speciess;
        }
    }
}
