using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;
using System.Xml;
using System.Xml.Linq;


namespace Chemistry_Cafe_API.Services
{
    public class PropertyTypeService(MySqlDataSource database)
    {
        public async Task<IReadOnlyList<PropertyType>> GetPropertyTypesAsync()
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM PropertyType WHERE isDel = 0";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<PropertyType?> GetPropertyTypeAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM PropertyType WHERE uuid = @id";
            command.Parameters.AddWithValue("@id", uuid);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<IReadOnlyList<PropertyType>> GetPropertyTypeValidationAsync(string validation)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM PropertyType WHERE validation = @validation AND isDel = 0";
            command.Parameters.AddWithValue("@validation", validation);

            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<Guid> CreatePropertyTypeAsync(PropertyType propertyType)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            Guid propertytypeID = Guid.NewGuid();

            command.CommandText = @"INSERT INTO PropertyType (uuid, name, units, validation) VALUES (@uuid, @name, @units, @validation);";

            command.Parameters.AddWithValue("@uuid", propertytypeID);
            command.Parameters.AddWithValue("@name", propertyType.name);
            command.Parameters.AddWithValue("@units", propertyType.units);
            command.Parameters.AddWithValue("@validation", propertyType.validation);

            await command.ExecuteNonQueryAsync();

            return propertytypeID;
        }
        public async Task UpdatePropertyTypeAsync(PropertyType propertyType)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE PropertyType SET name = @name, units = @units, validation = @validation, isDel = @isDel WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", propertyType.uuid);
            command.Parameters.AddWithValue("@name", propertyType.name);
            command.Parameters.AddWithValue("@units", propertyType.units);
            command.Parameters.AddWithValue("@validation", propertyType.validation);
            command.Parameters.AddWithValue("@isDel", propertyType.isDel);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeletePropertyTypeAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE PropertyType SET isDel = 1 WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", uuid);

            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<PropertyType>> ReadAllAsync(DbDataReader reader)
        {
            var propertytypes = new List<PropertyType>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var propertytype = new PropertyType();
                    propertytype.uuid = reader.GetGuid(0);
                    if (!reader.IsDBNull(1))
                    {
                        propertytype.name = reader.GetString(1);
                    }
                    if (!reader.IsDBNull(2))
                    {
                        propertytype.units = reader.GetString(2);
                    }
                    if (!reader.IsDBNull(3))
                    {
                        propertytype.validation = reader.GetString(3);
                    }
                    propertytype.isDel = reader.GetBoolean(4);
                    
                    propertytypes.Add(propertytype);
                }
            }
            return propertytypes;
        }
    }
}
