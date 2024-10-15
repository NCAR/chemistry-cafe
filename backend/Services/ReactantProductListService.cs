using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;
using System;


namespace Chemistry_Cafe_API.Services
{
    public class ReactantProductListService(MySqlDataSource database)
    {
        public async Task<IReadOnlyList<ReactantProductList>> GetReactantProductListsAsync()
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM Reactant_Product_List";
            return await ReadAllAsync(await command.ExecuteReaderAsync());
        }

        public async Task<ReactantProductList?> GetReactantProductListAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM Reactant_Product_List WHERE reactant_product_uuid = @id";
            command.Parameters.AddWithValue("@id", uuid);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            return result.FirstOrDefault();
        }

        public async Task<IReadOnlyList<ReactantsProducts>> GetReactantsAsync(Guid reaction_reactant_list_uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT Reactant_Product_List.reactant_product_uuid, Reactant_Product_List.reaction_uuid, Reactant_Product_List.species_uuid, Reactant_Product_List.quantity, Species.type " +
                "FROM Reactant_Product_List LEFT JOIN Species ON species_uuid = uuid WHERE reactant_product_uuid = @reaction_reactant_list_uuid";
            command.Parameters.AddWithValue("@reaction_reactant_list_uuid", reaction_reactant_list_uuid);
            return await ReadAllReactantsProductsAsync(await command.ExecuteReaderAsync());
        }

        public async Task<IReadOnlyList<ReactantsProducts>> GetProductsAsync(Guid reaction_product_list_uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT Reactant_Product_List.reactant_product_uuid, Reactant_Product_List.reaction_uuid, Reactant_Product_List.species_uuid, Reactant_Product_List.quantity, Species.type " +
                "FROM Reactant_Product_List LEFT JOIN Species ON species_uuid = uuid WHERE reactant_product_uuid = @reaction_product_list_uuid";
            command.Parameters.AddWithValue("@reaction_product_list_uuid", reaction_product_list_uuid);
            return await ReadAllReactantsProductsAsync(await command.ExecuteReaderAsync());
        }

        public async Task CreateReactantProductListAsync(ReactantProductList reactantProduct)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();


            command.CommandText = @"INSERT INTO Reactant_Product_List (reactant_product_uuid, reaction_uuid, species_uuid, quantity) VALUES (@reactant_product_uuid, @reaction_uuid, @species_uuid, @quantity);";

            command.Parameters.AddWithValue("@reactant_product_uuid", reactantProduct.reactant_product_uuid);
            command.Parameters.AddWithValue("@reaction_uuid", reactantProduct.reaction_uuid);
            command.Parameters.AddWithValue("@species_uuid", reactantProduct.species_uuid);
            command.Parameters.AddWithValue("@quantity", reactantProduct.quantity);

            await command.ExecuteNonQueryAsync();
        }
        public async Task UpdateReactantProductListAsync(ReactantProductList reactantProduct)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE Reactant_Product_List SET quantity = @quantity WHERE reactant_product_uuid = @reactant_product_uuid AND species_uuid = @species_uuid AND reaction_uuid = @reaction_uuid;";

            command.Parameters.AddWithValue("@reactant_product_uuid", reactantProduct.reactant_product_uuid);
            command.Parameters.AddWithValue("@reaction_uuid", reactantProduct.reaction_uuid);
            command.Parameters.AddWithValue("@species_uuid", reactantProduct.species_uuid);
            command.Parameters.AddWithValue("@quantity", reactantProduct.quantity);



            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteReactantProductListAsync(DeleteReactantProductList uuids)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"DELETE FROM Reactant_Product_List WHERE reactant_product_uuid = @reactant_product_uuid AND species_uuid = @species_uuid;";

            command.Parameters.AddWithValue("@reactant_product_uuid", uuids.reactant_product_uuid);
            command.Parameters.AddWithValue("@species_uuid", uuids.species_uuid);

            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<ReactantProductList>> ReadAllAsync(DbDataReader reader)
        {
            var reactantProductList = new List<ReactantProductList>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var property = new ReactantProductList
                    {
                        reactant_product_uuid = reader.GetGuid(0),
                        reaction_uuid = reader.GetGuid(1),
                        species_uuid = reader.GetGuid(2),
                        quantity = reader.GetInt32(3)
                    };
                    reactantProductList.Add(property);
                }
            }
            return reactantProductList;
        }

        private async Task<IReadOnlyList<ReactantsProducts>> ReadAllReactantsProductsAsync(DbDataReader reader)
        {
            var reactantProductList = new List<ReactantsProducts>();
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var property = new ReactantsProducts
                    {
                        reactant_product_uuid = reader.GetGuid(0),
                        reaction_uuid = reader.GetGuid(1),
                        species_uuid = reader.GetGuid(2),
                        quantity = reader.GetInt32(3),
                        type = reader.GetString(4)
                    };
                    reactantProductList.Add(property);
                }
            }
            return reactantProductList;
        }
    }
}
