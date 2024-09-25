using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;
using System;

namespace Chemistry_Cafe_API.Services
{
    public class PropertyVersionService(MySqlDataSource database)
    {
        public async Task<IReadOnlyList<PropertyVersion>> GetPropertyVersionsAsync()
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM Property_Version WHERE isDel = 0";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<PropertyVersion?> GetPropertyVersionAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM Property_Version WHERE uuid = @id";
            command.Parameters.AddWithValue("@id", uuid);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<Guid> CreatePropertyVersionAsync(PropertyVersion newPropertyVersion)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            Guid propertyVersionID = Guid.NewGuid();

            command.CommandText = @"INSERT INTO Property_Version (uuid, parent_property_uuid, frozen_version, tag_mechanism_uuid, property_type,
            float_value, double_value, int_value, string_value, action, user_uuid, datetime) 
            VALUES (@uuid, @parent_property_uuid, @frozen_version, @tag_mechanism_uuid, @property_type, @float_value, @double_value, @int_value, @string_value, @action, @user_uuid, @datetime);";

            command.Parameters.AddWithValue("@uuid", propertyVersionID);
            command.Parameters.AddWithValue("@parent_property_uuid", newPropertyVersion.parent_property_uuid);
            command.Parameters.AddWithValue("@frozen_version", newPropertyVersion.frozen_version);
            command.Parameters.AddWithValue("@tag_mechanism_uuid", newPropertyVersion.tag_mechanism_uuid);
            command.Parameters.AddWithValue("@property_type", newPropertyVersion.property_type);
            command.Parameters.AddWithValue("@float_value", newPropertyVersion.float_value);
            command.Parameters.AddWithValue("@double_value", newPropertyVersion.double_value);
            command.Parameters.AddWithValue("@int_value", newPropertyVersion.int_value);
            command.Parameters.AddWithValue("@string_value", newPropertyVersion.string_value);
            command.Parameters.AddWithValue("@action", newPropertyVersion.action);
            command.Parameters.AddWithValue("@user_uuid", newPropertyVersion.user_uuid);
            command.Parameters.AddWithValue("@datetime", newPropertyVersion.datetime);

            await command.ExecuteNonQueryAsync();

            return propertyVersionID;
        }
        public async Task UpdatePropertyVersionAsync(PropertyVersion propertyVersion)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE Property_Version SET parent_property_uuid = @parent_property_uuid, frozen_version = @frozen_version, tag_mechanism_uuid = @tag_mechanism_uuid, 
            property_type = @property_type, float_value = @float_value, double_value = @double_value, int_value = @int_value, string_value = @string_value, action = @action, 
            user_uuid = @user_uuid, datetime = @datetime, isDel = @isDel WHERE uuid = @uuid;";
            
            command.Parameters.AddWithValue("@uuid", propertyVersion.uuid);
            command.Parameters.AddWithValue("@parent_property_uuid", propertyVersion.parent_property_uuid);
            command.Parameters.AddWithValue("@frozen_version", propertyVersion.frozen_version);
            command.Parameters.AddWithValue("@tag_mechanism_uuid", propertyVersion.tag_mechanism_uuid);
            command.Parameters.AddWithValue("@property_type", propertyVersion.property_type);
            command.Parameters.AddWithValue("@float_value", propertyVersion.float_value);
            command.Parameters.AddWithValue("@double_value", propertyVersion.double_value);
            command.Parameters.AddWithValue("@int_value", propertyVersion.int_value);
            command.Parameters.AddWithValue("@string_value", propertyVersion.string_value);
            command.Parameters.AddWithValue("@action", propertyVersion.action);
            command.Parameters.AddWithValue("@user_uuid", propertyVersion.user_uuid);
            command.Parameters.AddWithValue("@datetime", propertyVersion.datetime);
            command.Parameters.AddWithValue("@isDel", propertyVersion.isDel);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeletePropertyVersionAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE Property_Version SET isDel = 1 WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", uuid);
            
            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<PropertyVersion>> ReadAllAsync(DbDataReader reader)
        {
            var propertyVersion = new List<PropertyVersion>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var property = new PropertyVersion
                    {
                        uuid = reader.GetGuid(0),
                        parent_property_uuid = reader.GetGuid(1),
                        frozen_version = reader.GetString(2),
                        tag_mechanism_uuid = reader.GetGuid(3),
                        property_type = reader.GetGuid(4),
                        user_uuid = reader.GetGuid(10),
                        datetime = reader.GetDateTime(11),
                        isDel = reader.GetBoolean(12),
                    };
                    if (!reader.IsDBNull(5))
                    {
                        property.float_value = reader.GetFloat(5);
                    }
                    if (!reader.IsDBNull(6))
                    {
                        property.double_value = reader.GetDouble(6);
                    }
                    if (!reader.IsDBNull(7))
                    {
                        property.int_value = reader.GetInt32(7);
                    }
                    if (!reader.IsDBNull(8))
                    {
                        property.string_value = reader.GetString(8);
                    }
                    if (!reader.IsDBNull(9))
                    {
                        property.action = reader.GetString(9);
                    }
                    propertyVersion.Add(property);
                }
            }
            return propertyVersion;
        }
    }
}
