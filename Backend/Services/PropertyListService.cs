using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;


namespace Chemistry_Cafe_API.Services
{
    public class PropertyListService(MySqlDataSource database)
    {
        public async Task<IReadOnlyList<PropertyList>> GetPropertyListsAsync()
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM Property_List WHERE isDel = 0";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<PropertyList?> GetPropertyListAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM Property_List WHERE uuid = @id";
            command.Parameters.AddWithValue("@id", uuid);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<IReadOnlyList<Property>> GetPropertiesAsync(Guid parent_uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM Property_List RIGHT JOIN Property_Version ON Property_List.uuid = Property_Version.parent_property_uuid  AND Property_List.version = Property_Version.frozen_version
                LEFT JOIN PropertyType ON Property_Version.property_type = PropertyType.uuid 
                WHERE Property_List.parent_uuid = @parent_uuid AND Property_List.isDel = 0 AND Property_Version.isDel = 0 ORDER BY datetime DESC;";
            command.Parameters.AddWithValue("@parent_uuid", parent_uuid);

            return await ReadAllPropertiesAsync(await command.ExecuteReaderAsync());
        }

        public async Task<Guid> CreatePropertyListAsync(PropertyList userPreferences)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            Guid userPreferencesID = Guid.NewGuid();

            command.CommandText = @"INSERT INTO Property_List (uuid, parent_uuid, version) VALUES (@uuid, @parent_uuid, @version);";

            command.Parameters.AddWithValue("@uuid", userPreferencesID);
            command.Parameters.AddWithValue("@parent_uuid", userPreferences.parent_uuid);
            command.Parameters.AddWithValue("@version", userPreferences.version);

            await command.ExecuteNonQueryAsync();

            return userPreferencesID;
        }
        public async Task UpdatePropertyListAsync(PropertyList userPreferences)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE Property_List SET parent_uuid = @parent_uuid, version = @version, isDel = @isDel WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", userPreferences.uuid);
            command.Parameters.AddWithValue("@parent_uuid", userPreferences.parent_uuid);
            command.Parameters.AddWithValue("@version", userPreferences.version);
            command.Parameters.AddWithValue("@isDel", userPreferences.isDel);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeletePropertyListAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE Property_List SET isDel = 1 WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", uuid);

            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<PropertyList>> ReadAllAsync(DbDataReader reader)
        {
            var propertyList = new List<PropertyList>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var property = new PropertyList
                    {
                        uuid = reader.GetGuid(0),
                        parent_uuid = reader.GetGuid(1),
                        version = reader.GetString(2),
                        isDel = reader.GetBoolean(3),
                    };
                    propertyList.Add(property);
                }
            }
            return propertyList;
        }

        private async Task<IReadOnlyList<Property>> ReadAllPropertiesAsync(DbDataReader reader)
        {
            var propertyList = new List<Property>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var property = new Property
                    {
                        property_list_uuid = reader.GetGuid(0),
                        parent_uuid = reader.GetGuid(1),
                        version = reader.GetString(2),
                        property_list_isDel = reader.GetBoolean(3),
                        property_version_uuid = reader.GetGuid(4),
                        parent_property_uuid = reader.GetGuid(5),
                        frozen_version = reader.GetString(6),
                        tag_mechanism_uuid = reader.GetGuid(7),
                        property_type = reader.GetGuid(8),
                        user_uuid = reader.GetGuid(14),
                        datetime = reader.GetDateTime(15),
                        property_version_isDel = reader.GetBoolean(16),
                        property_type_uuid = reader.GetGuid(17),
                        property_type_isDel = reader.GetBoolean(21)
                    };
                    if (!reader.IsDBNull(9))
                    {
                        property.float_value = reader.GetFloat(9);
                    }
                    if (!reader.IsDBNull(10))
                    {
                        property.double_value = reader.GetDouble(10);
                    }
                    if (!reader.IsDBNull(11))
                    {
                        property.int_value = reader.GetInt32(11);
                    }
                    if (!reader.IsDBNull(12))
                    {
                        property.string_value = reader.GetString(12);
                    }
                    if (!reader.IsDBNull(13))
                    {
                        property.action = reader.GetString(13);
                    }
                    if (!reader.IsDBNull(18))
                    {
                        property.name = reader.GetString(18);
                    }
                    if (!reader.IsDBNull(19))
                    {
                        property.units = reader.GetString(19);
                    }
                    if (!reader.IsDBNull(20))
                    {
                        property.validation = reader.GetString(20);
                    }
                    propertyList.Add(property);
                }
            }
            return propertyList;
        }
    }
}
