using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;


namespace Chemistry_Cafe_API.Services
{
    public class FamilyService(MySqlDataSource database)
    {
        public async Task<IReadOnlyList<Family>> GetFamiliesAsync()
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM Family WHERE isDel = FALSE";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<Family?> GetFamilyAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM Family WHERE uuid = @id";
            command.Parameters.AddWithValue("@id", uuid);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<Family> CreateFamilyAsync(string name)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            Guid tagMechanismID = Guid.NewGuid();

            command.CommandText = @"INSERT INTO TagMechanism (uuid, tag) VALUES (@tag_mechanism_uuid, @tag);";

            command.Parameters.AddWithValue("@tag_mechanism_uuid", tagMechanismID);
            command.Parameters.AddWithValue("@tag", name + "-FamilySuperMechanism");

            Guid familyID = Guid.NewGuid();
            
            command.CommandText += @"INSERT INTO Family (uuid, name, super_tag_mechanism_uuid) VALUES (@uuid, @name, @super_tag_mechanism_uuid);";

            command.Parameters.AddWithValue("@uuid", familyID);
            command.Parameters.AddWithValue("@name", name);
            command.Parameters.AddWithValue("@super_tag_mechanism_uuid", tagMechanismID);

            Family family = new Family();
            family.uuid = familyID;
            family.name = name;
            family.super_tag_mechanism_uuid = tagMechanismID;
            family.isDel = false;

            await command.ExecuteNonQueryAsync();

            return family;
        }
        public async Task UpdateFamilyAsync(Family family)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE Family SET name = @name, super_tag_mechanism_uuid = @super_tag_mechanism_uuid, isDel = @isDel WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", family.uuid);
            command.Parameters.AddWithValue("@name", family.name);
            command.Parameters.AddWithValue("@super_tag_mechanism_uuid", family.super_tag_mechanism_uuid);
            command.Parameters.AddWithValue("@isDel", family.isDel);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteFamilyAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE Family SET isDel = 1 WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", uuid);

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
                        uuid = reader.GetGuid(0),
                        name = reader.GetString(1),
                        super_tag_mechanism_uuid = reader.GetGuid(2),
                        isDel = reader.GetBoolean(3),
                    };
                    families.Add(family);
                }
            }
            return families;
        }
    }
}
