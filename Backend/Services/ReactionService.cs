using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;


namespace Chemistry_Cafe_API.Services
{
    public class ReactionService(MySqlDataSource database)
    {
        public async Task<IReadOnlyList<Reaction>> GetReactionsAsync()
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = "SELECT * FROM Reaction WHERE isDel = 0";
            var list = ReadAllAsync(await command.ExecuteReaderAsync()).Result;

            List<string> reactions = new List<string>();
            foreach (var item in list)
            {
                reactions.Add(GetReactionStringAsync(item.uuid).Result);
            }

            return await ReadAllAsync(await command.ExecuteReaderAsync(), reactions);
        }

        public async Task<Reaction?> GetReactionAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM Reaction WHERE uuid = @id";
            command.Parameters.AddWithValue("@id", uuid);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());
            List<string> reactions = new List<string>();
            foreach (var item in result)
            {
                reactions.Add(GetReactionStringAsync(item.uuid).Result);
            }

            var result2 = await ReadAllAsync(await command.ExecuteReaderAsync(), reactions);
            return result2.FirstOrDefault();
        }

        public async Task<IReadOnlyList<Reaction>> GetTags(Guid tag_mechanism_uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT Reaction.uuid, Reaction.type, Reaction.isDel, Reaction.reactant_list_uuid, Reaction.product_list_uuid FROM TagMechanism_Reaction_List LEFT JOIN Reaction ON reaction_uuid = Reaction.uuid WHERE tag_mechanism_uuid = @tag_mechanism_uuid AND TagMechanism_Reaction_List.isDel = 0";
            command.Parameters.AddWithValue("@tag_mechanism_uuid", tag_mechanism_uuid);

            var list = ReadAllAsync(await command.ExecuteReaderAsync()).Result;

            List<string> reactions = new List<string>();
            foreach (var item in list)
            {
                reactions.Add(GetReactionStringAsync(item.uuid).Result);
            }

            return await ReadAllAsync(await command.ExecuteReaderAsync(), reactions);
        }

        public async Task<String?> GetReactionStringAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"SELECT * FROM Reaction WHERE uuid = @id AND isDel = 0";
            command.Parameters.AddWithValue("@id", uuid);

            var result = await ReadAllAsync(await command.ExecuteReaderAsync());

            ReactantProductListService reactantProductListService = new ReactantProductListService(database);

            var reactants = reactantProductListService.GetReactantsAsync(result[0].reactant_list_uuid).Result;
            var products = reactantProductListService.GetProductsAsync(result[0].product_list_uuid).Result;

            string reactionString = "";
            bool isReact = false;
            bool isProduct = false;

            foreach( var reactant in reactants)
            {
                reactionString += "" + reactant.quantity + reactant.type + " + ";
                isReact = true;
            }
            if (isReact)
            {
                reactionString = reactionString.Remove(reactionString.LastIndexOf('+'));
            }
            else
            {
                reactionString += "<none> ";
            }

            reactionString += "-> ";

            foreach ( var product in products)
            {
                reactionString += "" + product.quantity + product.type + " + ";
                isProduct = true;
            }

            if (isProduct)
            {
                reactionString = reactionString.Remove(reactionString.LastIndexOf('+'));
            }
            else
            {
                reactionString += "<none>";
            }

            return reactionString;
        }


        public async Task<Guid> CreateReactionAsync(string type)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            Guid reactionID = Guid.NewGuid();
            Guid reactant_list_uuid = Guid.NewGuid();
            Guid product_list_uuid = Guid.NewGuid();

            command.CommandText = @"INSERT INTO Reaction (uuid, type, reactant_list_uuid, product_list_uuid) VALUES (@uuid, @type, @reactant_list_uuid, @product_list_uuid);";

            command.Parameters.AddWithValue("@uuid", reactionID);
            command.Parameters.AddWithValue("@type", type);
            command.Parameters.AddWithValue("@reactant_list_uuid", reactant_list_uuid);
            command.Parameters.AddWithValue("@product_list_uuid", product_list_uuid);

            await command.ExecuteNonQueryAsync();

            return reactionID;
        }
        public async Task UpdateReactionAsync(Reaction reaction)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE Reaction SET type = @type, isDel = @isDel, reactant_list_uuid = @reactant_list_uuid, product_list_uuid = @product_list_uuid WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", reaction.uuid);
            command.Parameters.AddWithValue("@type", reaction.type);
            command.Parameters.AddWithValue("@isDel", reaction.isDel);
            command.Parameters.AddWithValue("@reactant_list_uuid", reaction.reactant_list_uuid);
            command.Parameters.AddWithValue("@product_list_uuid", reaction.product_list_uuid);

            await command.ExecuteNonQueryAsync();
        }

        public async Task DeleteReactionAsync(Guid uuid)
        {
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            command.CommandText = @"UPDATE Reaction SET isDel = 1 WHERE uuid = @uuid;";

            command.Parameters.AddWithValue("@uuid", uuid);

            await command.ExecuteNonQueryAsync();
        }

        private async Task<IReadOnlyList<Reaction>> ReadAllAsync(DbDataReader reader, List<string> reactionString = null)
        {
            var reactions = new List<Reaction>();
            int i = 0;
            using (reader)
            {
                while (await reader.ReadAsync())
                {
                    var reaction = new Reaction
                    {
                        uuid = reader.GetGuid(0),
                        type = reader.GetString(1),
                        isDel = reader.GetBoolean(2)
                    };
                    if (!reader.IsDBNull(3))
                    {
                        reaction.reactant_list_uuid = reader.GetGuid(3);
                    }
                    if (!reader.IsDBNull(4))
                    {
                        reaction.product_list_uuid = reader.GetGuid(4);
                    }
                    if (reactionString != null)
                    {
                        reaction.reaction_string = reactionString[i];
                    }
                    reactions.Add(reaction);
                    i++;
                }
            }
            return reactions;
        }
    }
}
