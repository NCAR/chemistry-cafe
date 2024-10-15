using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;

namespace Chemistry_Cafe_API.Services
{
    public class OpenAtmosService(MySqlDataSource database)
    {
        public async Task<string> GetJSON(Guid tag_mechanism_uuid)
        {
            ReactionService reactionService = new ReactionService(database);
            SpeciesService speciesService = new SpeciesService(database);
            TagMechanismService tagMechanismService = new TagMechanismService(database);
            PropertyListService propertyListService = new PropertyListService(database);
            ReactantProductListService reactantProductListService = new ReactantProductListService(database);

            var mechanism = tagMechanismService.GetTagMechanismAsync(tag_mechanism_uuid).Result;
            
            string JSON = "{\n" +
                "  \"version\": \"1.0.0\",\n" +
                "  \"name\": \"" + mechanism.tag + "\", \n";
            
            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            var reactionList = reactionService.GetTags(tag_mechanism_uuid).Result;
            var speciesList = speciesService.GetTags(tag_mechanism_uuid).Result;

            JSON += "  \"species\": [ \n";


            foreach ( var species in speciesList )
            {
                JSON += "    {\n";
                JSON += "      \"name\": \"" + species.type + "\", \n";
                var properties = propertyListService.GetPropertiesAsync(species.uuid).Result;
                foreach ( var property in properties )
                {
                    JSON += "      \"" + property.name;
                    if (!(property.units == null || property.units == ""))
                    {
                        JSON += " [" + property.units + "]\": ";
                    }
                    else
                    {
                        JSON += "\": ";
                    }

                    if (property.float_value.HasValue)
                    {
                        JSON += property.float_value.ToString();
                    }
                    else if(property.double_value.HasValue)
                    {
                        JSON += property.double_value.ToString();
                    }
                    else if (property.int_value.HasValue)
                    {
                        JSON += property.int_value.ToString();
                    }
                    else if(property.string_value != null)
                    {
                        JSON += "\"" + property.string_value + "\"";
                    }

                    JSON += ", \n";
                }
                JSON = JSON.Remove(JSON.LastIndexOf(','));
                JSON += "\n";
                JSON += "    }, \n";
            }
            JSON = JSON.Remove(JSON.LastIndexOf(','));
            JSON += "\n";

            JSON += "  ],\n" +
                "  \"phases\": [ \n" +
                "    { \n" +
                "      \"name\": \"gas\", \n" +
                "      \"species\": [ \n";
            foreach(Species species in speciesList)
            {
                JSON += "        \"" + species.type + "\", \n";
            }
            JSON = JSON.Remove(JSON.LastIndexOf(','));
            JSON += "\n";
            JSON += "      ] \n" +
                "    } \n" +
                "  ],\n" +
                "  \"reactions\": [ \n";
            bool react = false;

            foreach (var reaction in reactionList)
            {
                react = true;
                JSON += "    { \n";
                JSON += "      \"type\" : \"" + reaction.type.ToUpper() + "\", \n"; 
                var properties = propertyListService.GetPropertiesAsync(reaction.uuid).Result;
                foreach (var property in properties)
                {
                    if (!(property.units == null || property.units == ""))
                    {
                        JSON += "      \"" + property.name + " [" + property.units + "]\": ";
                    }
                    else
                    {
                        JSON += "      \"" + property.name + "\": ";
                    }

                    if (property.float_value.HasValue)
                    {
                        JSON += property.float_value.ToString();
                    }
                    else if (property.double_value.HasValue)
                    {
                        JSON += property.double_value.ToString();
                    }
                    else if (property.int_value.HasValue)
                    {
                        JSON += property.int_value.ToString();
                    }
                    else if (property.string_value != null)
                    {
                        JSON += "\"" + property.string_value + "\"";
                    }

                    JSON += ", \n";
                }
                var reactants = reactantProductListService.GetReactantsAsync(reaction.reactant_list_uuid).Result;
                if(reactants.Count != 0)
                {
                    JSON += "      \"reactants\": [ \n" +
                    "        {\n";
                    foreach (ReactantsProducts reactant in reactants)
                    {
                        JSON += "          \"species name\": \"" + reactant.type + "\", \n";
                        JSON += "          \"coefficient\": \"" + reactant.quantity + "\", \n";
                    }
                    JSON = JSON.Remove(JSON.LastIndexOf(','));
                    JSON += "\n";
                    JSON += "        }\n" +
                        "      ], \n";
                }

                var products = reactantProductListService.GetProductsAsync(reaction.product_list_uuid).Result;

                if(products.Count != 0)
                {
                    JSON += "      \"products\": [ \n" +
                    "        {\n";
                    foreach (ReactantsProducts product in products)
                    {
                        JSON += "          \"species name\": \"" + product.type + "\", \n";
                        JSON += "          \"coefficient\": \"" + product.quantity + "\", \n";
                    }
                    JSON = JSON.Remove(JSON.LastIndexOf(','));
                    JSON += "\n";
                    JSON += "        }\n" +
                        "      ]\n";
                }

                if(reactants.Count == 0 && products.Count == 0)
                {
                    JSON = JSON.Remove(JSON.LastIndexOf(','));
                    JSON += "\n";
                }
                
                JSON += "    },\n";
            }
            if (react)
            {
                JSON = JSON.Remove(JSON.LastIndexOf(','));
                JSON += "\n";
            }
            JSON += "  ]\n}";
            return JSON;
        }

        public async Task<string> GetYAML(Guid tag_mechanism_uuid)
        {
            ReactionService reactionService = new ReactionService(database);
            SpeciesService speciesService = new SpeciesService(database);
            TagMechanismService tagMechanismService = new TagMechanismService(database);
            PropertyListService propertyListService = new PropertyListService(database);
            ReactantProductListService reactantProductListService = new ReactantProductListService(database);

            var mechanism = tagMechanismService.GetTagMechanismAsync(tag_mechanism_uuid).Result;

            string YAML = "---\n" +
                "version: 1.0.0\n" +
                "name: " + mechanism.tag + "\n";

            using var connection = await database.OpenConnectionAsync();
            using var command = connection.CreateCommand();

            var reactionList = reactionService.GetTags(tag_mechanism_uuid).Result;
            var speciesList = speciesService.GetTags(tag_mechanism_uuid).Result;

            YAML += "species:\n";


            foreach (var species in speciesList)
            {
                YAML += "- name: " + species.type + "\n";
                var properties = propertyListService.GetPropertiesAsync(species.uuid).Result;
                foreach (var property in properties)
                {
                    YAML += "  " + property.name;
                    if (!(property.units == null || property.units == ""))
                    {
                        YAML += " [" + property.units + "]: ";
                    }
                    else
                    {
                        YAML += ": ";
                    }

                    if (property.float_value.HasValue)
                    {
                        YAML += property.float_value.ToString();
                    }
                    else if (property.double_value.HasValue)
                    {
                        YAML += property.double_value.ToString();
                    }
                    else if (property.int_value.HasValue)
                    {
                        YAML += property.int_value.ToString();
                    }
                    else if (property.string_value != null)
                    {
                        YAML += property.string_value;
                    }

                    YAML += "\n";
                }
            }

            YAML += "" +
                "phases:\n" +
                "- name: gas\n" +
                "  species:\n";
            foreach (Species species in speciesList)
            {
                YAML += "  - " + species.type + "\n";
            }
            YAML += "reactions:\n";
            bool react = false;

            foreach (var reaction in reactionList)
            {
                react = true;
                YAML += "- type : " + reaction.type.ToUpper() + "\n";
                var properties = propertyListService.GetPropertiesAsync(reaction.uuid).Result;
                foreach (var property in properties)
                {
                    if (!(property.units == null || property.units == ""))
                    {
                        YAML += "  " + property.name + " [" + property.units + "]: ";
                    }
                    else
                    {
                        YAML += "  " + property.name + ": ";
                    }

                    if (property.float_value.HasValue)
                    {
                        YAML += property.float_value.ToString();
                    }
                    else if (property.double_value.HasValue)
                    {
                        YAML += property.double_value.ToString();
                    }
                    else if (property.int_value.HasValue)
                    {
                        YAML += property.int_value.ToString();
                    }
                    else if (property.string_value != null)
                    {
                        YAML += property.string_value;
                    }
                    YAML += "\n";
                }
                var reactants = reactantProductListService.GetReactantsAsync(reaction.reactant_list_uuid).Result;
                if (reactants.Count != 0)
                {
                    YAML += "  reactants:\n";
                    foreach (ReactantsProducts reactant in reactants)
                    {
                        YAML += "  - species name: " + reactant.type + "\n";
                        YAML += "    coefficient: " + reactant.quantity + "\n";
                    }
                }

                var products = reactantProductListService.GetProductsAsync(reaction.product_list_uuid).Result;

                if (products.Count != 0)
                {
                    YAML += "  products:\n";
                    foreach (ReactantsProducts product in products)
                    {
                        YAML += "  - species name: " + product.type + "\n";
                        YAML += "    coefficient: " + product.quantity + " \n";
                    }
                }
                
            }

            return YAML;
        }

    }

}

