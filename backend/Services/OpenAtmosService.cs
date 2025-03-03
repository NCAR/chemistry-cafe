// OpenAtmosService.cs
using System.Text;
using System.Text.Json;
using System.Text.Encodings.Web;
using Chemistry_Cafe_API.Services;
using MySqlConnector;
using System.IO.Compression;
using Chemistry_Cafe_API.Models;
using System.Runtime.InteropServices.JavaScript;
using System.Text.Json.Nodes;
using NuGet.Protocol;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

public class OpenAtmosService
{
    private readonly MySqlDataSource _database;

    public OpenAtmosService(MySqlDataSource database)
    {
        _database = database;
    }

    // public async Task<string> GetJSONOld(Guid mechanismId)
    // {
    //     var reactionService = new ReactionService(_database);
    //     var speciesService = new SpeciesService(_database);
    //     var mechanismService = new MechanismService(_database);
    //     var reactionSpeciesService = new ReactionSpeciesService(_database);

    //     // Get mechanism
    //     var mechanism = await mechanismService.GetMechanismAsync(mechanismId);
    //     if (mechanism == null)
    //     {
    //         return string.Empty;
    //     }

    //     // Initialize JSON builder
    //     var json = new StringBuilder();
    //     json.AppendLine("{");
    //     json.AppendLine($"  \"version\": \"1.0.0\",");
    //     json.AppendLine($"  \"name\": \"{mechanism?.Name}\",");

    //     // Get species
    //     var speciesList = await speciesService.GetSpeciesByMechanismIdAsync(mechanismId);
    //     json.AppendLine("  \"species\": [");
    //     foreach (var species in speciesList)
    //     {
    //         json.AppendLine("    {");
    //         json.AppendLine($"      \"name\": \"{species.Name}\"");
    //         json.AppendLine("    },");
    //     }
    //     // if (speciesList.Any())
    //     // {
    //     //     json.Length -= 3; // Remove last comma and newline
    //     //     json.AppendLine();
    //     // }
    //     json.AppendLine("  ],");

    //     // Phases
    //     json.AppendLine("  \"phases\": [");
    //     json.AppendLine("    {");
    //     json.AppendLine("      \"name\": \"gas\",");
    //     json.AppendLine("      \"species\": [");
    //     foreach (var species in speciesList)
    //     {
    //         json.AppendLine($"        \"{species.Name}\",");
    //     }
    //     if (speciesList.Any())
    //     {
    //         json.Length -= 3;
    //         json.AppendLine();
    //     }
    //     json.AppendLine("      ]");
    //     json.AppendLine("    }");
    //     json.AppendLine("  ],");

    //     // Get reactions
    //     var reactionList = await reactionService.GetReactionsByMechanismIdAsync(mechanismId);
    //     json.AppendLine("  \"reactions\": [");
    //     foreach (var reaction in reactionList)
    //     {
    //         json.AppendLine("    {");
    //         json.AppendLine($"      \"name:\": \"{reaction.Name}\","); // Changed from Equation to Description
    //         // Include additional fields if needed
    //         json.AppendLine($"      \"equation\": \"{reaction.Description}\",");

    //         // Reactants
    //         var reactants = await reactionSpeciesService.GetReactantsByReactionIdAsync(reaction.Id);
    //         if (reactants.Any())
    //         {
    //             json.AppendLine("      \"reactants\": [");
    //             foreach (var reactant in reactants)
    //             {
    //                 json.AppendLine("        {");
    //                 json.AppendLine($"          \"species name\": \"{reactant.SpeciesName}\"");
    //                 json.AppendLine("        },");
    //             }
    //             json.Length -= 3;
    //             json.AppendLine();
    //             json.AppendLine("      ],");
    //         }

    //         // Products
    //         var products = await reactionSpeciesService.GetProductsByReactionIdAsync(reaction.Id);
    //         if (products.Any())
    //         {
    //             json.AppendLine("      \"products\": [");
    //             foreach (var product in products)
    //             {
    //                 json.AppendLine("        {");
    //                 json.AppendLine($"          \"species name\": \"{product.SpeciesName}\"");
    //                 json.AppendLine("        },");
    //             }
    //             json.Length -= 3;
    //             json.AppendLine();
    //             json.AppendLine("      ],");
    //         }

    //         // Remove trailing comma if present
    //         if (json[json.Length - 3] == ',')
    //         {
    //             json.Length -= 1;
    //         }

    //         json.AppendLine("    },");
    //     }
    //     if (reactionList.Any())
    //     {
    //         json.Length -= 3;
    //         json.AppendLine();
    //     }
    //     json.AppendLine("  ]");
    //     json.AppendLine("}");

    //     return json.ToString() ?? string.Empty;
    // }

    // public async Task<string> GetYAMLOld(Guid mechanismId)
    // {
    //     var reactionService = new ReactionService(_database);
    //     var speciesService = new SpeciesService(_database);
    //     var mechanismService = new MechanismService(_database);
    //     var reactionSpeciesService = new ReactionSpeciesService(_database);

    //     // Get mechanism
    //     var mechanism = await mechanismService.GetMechanismAsync(mechanismId);
    //     if (mechanism == null)
    //     {
    //         return string.Empty;
    //     }

    //     // Initialize YAML builder
    //     var yaml = new StringBuilder();
    //     yaml.AppendLine("---");
    //     yaml.AppendLine($"version: 1.0.0");
    //     yaml.AppendLine($"name: {mechanism?.Name}");

    //     // Species
    //     yaml.AppendLine("species:");
    //     var speciesList = await speciesService.GetSpeciesByMechanismIdAsync(mechanismId);
    //     foreach (var species in speciesList)
    //     {
    //         yaml.AppendLine($"- name: {species.Name}");
    //     }

    //     // Phases
    //     yaml.AppendLine("phases:");
    //     yaml.AppendLine("- name: gas");
    //     yaml.AppendLine("  species:");
    //     foreach (var species in speciesList)
    //     {
    //         yaml.AppendLine($"  - {species.Name}");
    //     }

    //     // Reactions
    //     yaml.AppendLine("reactions:");
    //     var reactionList = await reactionService.GetReactionsByMechanismIdAsync(mechanismId);
    //     foreach (var reaction in reactionList)
    //     {
    //         yaml.AppendLine($"- equation: {reaction.Description}"); // Changed from Equation to Description
    //         // Include additional fields if needed

    //         // Reactants
    //         var reactants = await reactionSpeciesService.GetReactantsByReactionIdAsync(reaction.Id);
    //         if (reactants.Any())
    //         {
    //             yaml.AppendLine("  reactants:");
    //             foreach (var reactant in reactants)
    //             {
    //                 yaml.AppendLine($"  - species name: {reactant.SpeciesName}");
    //             }
    //         }

    //         // Products
    //         var products = await reactionSpeciesService.GetProductsByReactionIdAsync(reaction.Id);
    //         if (products.Any())
    //         {
    //             yaml.AppendLine("  products:");
    //             foreach (var product in products)
    //             {
    //                 yaml.AppendLine($"  - species name: {product.SpeciesName}");
    //             }
    //         }
    //     }

    //     return yaml.ToString() ?? string.Empty;
    // }

    public async Task<byte[]> GetMusicboxJSON(Guid mechanismId)
    {
        var reactionService = new ReactionService(_database);
        var speciesService = new SpeciesService(_database);
        var reactionSpeciesService = new ReactionSpeciesService(_database);

        // Fetch species
        var speciesList = await speciesService.GetSpeciesByMechanismIdAsync(mechanismId);
        var speciesJson = new StringBuilder();
        speciesJson.AppendLine("{");
        speciesJson.AppendLine("  \"camp-data\": [");

        foreach (var species in speciesList)
        {
            speciesJson.AppendLine("    {");
            speciesJson.AppendLine($"      \"name\": \"{species.Name}\",");
            speciesJson.AppendLine("      \"type\": \"CHEM_SPEC\",");
            speciesJson.AppendLine($"      \"__description\": \"{species.Description}\"");
            speciesJson.AppendLine("    },");
        }
        if (speciesList.Any()) speciesJson.Length -= 2; // Remove trailing comma and newline
        speciesJson.AppendLine();
        speciesJson.AppendLine("  ]");
        speciesJson.AppendLine("}");

        var mechanismService = new MechanismService(_database);
        var mechanism = await mechanismService.GetMechanismAsync(mechanismId);
        if (mechanism == null)
        {
            return Array.Empty<byte>();
        }

        // Fetch reactions
        var reactionList = await reactionService.GetReactionsByMechanismIdAsync(mechanismId);
        var reactionsJson = new StringBuilder();
        reactionsJson.AppendLine("{");
        reactionsJson.AppendLine("  \"camp-data\": [");
        reactionsJson.AppendLine("    {");
        reactionsJson.AppendLine($"      \"name\": \"{mechanism?.Name}\",");
        reactionsJson.AppendLine("      \"type\": \"MECHANISM\",");
        reactionsJson.AppendLine("      \"reactions\": [");

        foreach (var reaction in reactionList)
        {
            reactionsJson.AppendLine("        {");
            // Reaction type
            var type = reaction.Description?.Split(' ')[0] ?? string.Empty;
            reactionsJson.AppendLine($"          \"type\": \"{type}\",");

            // Reactants
            reactionsJson.AppendLine("          \"reactants\": {");
            var reactants = await reactionSpeciesService.GetReactantsByReactionIdAsync(reaction.Id);
            foreach (var reactant in reactants)
            {
                reactionsJson.AppendLine($"            \"{reactant.SpeciesName}\": {{ }},");
            }
            if (reactants.Any()) reactionsJson.Length -= 2; // Remove trailing comma
            reactionsJson.AppendLine();
            reactionsJson.AppendLine("          },"); // Close reactants

            // Products
            reactionsJson.AppendLine("          \"products\": {");
            var products = await reactionSpeciesService.GetProductsByReactionIdAsync(reaction.Id);
            foreach (var product in products)
            {
                reactionsJson.AppendLine($"            \"{product.SpeciesName}\": {{ }},");
            }
            if (products.Any()) reactionsJson.Length -= 2; // Remove trailing comma
            reactionsJson.AppendLine();
            reactionsJson.AppendLine("          }"); // Close products

            reactionsJson.AppendLine("        },"); // Close reaction
        }
        if (reactionList.Any()) reactionsJson.Length -= 2; // Remove trailing comma
        reactionsJson.AppendLine();
        reactionsJson.AppendLine("      ]");
        reactionsJson.AppendLine("    }");
        reactionsJson.AppendLine("  ]");
        reactionsJson.AppendLine("}");

        //my_config file
        var myConfigJson = new StringBuilder();
        myConfigJson.AppendLine("{");
        myConfigJson.AppendLine("  \"box model options\": {");
        myConfigJson.AppendLine("    \"grid\": \"box\",");
        myConfigJson.AppendLine("    \"chemistry time step [min]\": 1.0,");
        myConfigJson.AppendLine("    \"output time step [min]\": 1.0,");
        myConfigJson.AppendLine("    \"simulation length [hr]\": 3.0");
        myConfigJson.AppendLine("  },");
        myConfigJson.AppendLine("  \"chemical species\": {");

        // Add species with initial values
        foreach (var species in speciesList)
        {
            myConfigJson.AppendLine($"    \"{species.Name}\": {{");
            myConfigJson.AppendLine($"      \"initial value [mol m-3]\": 1.0e-09");
            myConfigJson.AppendLine("    },");
        }
        if (speciesList.Any()) myConfigJson.Length -= 2; // Remove trailing comma and newline
        myConfigJson.AppendLine();
        myConfigJson.AppendLine("  },");
        myConfigJson.AppendLine("  \"environmental conditions\": {");
        myConfigJson.AppendLine("    \"temperature\": {");
        myConfigJson.AppendLine("      \"initial value [K]\": 298.15");
        myConfigJson.AppendLine("    },");
        myConfigJson.AppendLine("    \"pressure\": {");
        myConfigJson.AppendLine("      \"initial value [Pa]\": 101325.0");
        myConfigJson.AppendLine("    }");
        myConfigJson.AppendLine("  },");
        myConfigJson.AppendLine("  \"evolving conditions\": {},");
        myConfigJson.AppendLine("  \"initial conditions\": {");
        // myConfigJson.AppendLine("    \"initial_reaction_rates.csv\": {}"); --when initial conditions are implemented, use this
        myConfigJson.AppendLine("  },");
        myConfigJson.AppendLine("  \"model components\": [");
        myConfigJson.AppendLine("    {");
        myConfigJson.AppendLine("      \"type\": \"CAMP\",");
        myConfigJson.AppendLine("      \"configuration file\": \"camp_data/config.json\",");
        myConfigJson.AppendLine("      \"override species\": {");
        myConfigJson.AppendLine("        \"M\": {");
        myConfigJson.AppendLine("          \"mixing ratio mol mol-1\": 1.0");
        myConfigJson.AppendLine("        }");
        myConfigJson.AppendLine("      },");
        myConfigJson.AppendLine("      \"suppress output\": {");
        myConfigJson.AppendLine("        \"M\": {}");
        myConfigJson.AppendLine("      }");
        myConfigJson.AppendLine("    }");
        myConfigJson.AppendLine("  ]");
        myConfigJson.AppendLine("}");

        // Create ZIP file in memory
        using (var memoryStream = new MemoryStream())
        {
            using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
            {
                        var campDataFolder = archive.CreateEntry("camp_data/");

                // Add species.json to ZIP
                var speciesEntry = archive.CreateEntry("camp_data/species.json");
                using (var entryStream = speciesEntry.Open())
                using (var writer = new StreamWriter(entryStream))
                {
                    writer.Write(speciesJson.ToString());
                }

                // Add reactions.json to ZIP
                var reactionsEntry = archive.CreateEntry("camp_data/reactions.json");
                using (var entryStream = reactionsEntry.Open())
                using (var writer = new StreamWriter(entryStream))
                {
                    writer.Write(reactionsJson.ToString());
                }

                var configEntry = archive.CreateEntry("camp_data/config.json");
                using (var entryStream = configEntry.Open())
                using (var writer = new StreamWriter(entryStream))
                {
                    writer.Write("{\"camp-files\": [\"species.json\", \"reactions.json\"]}");
                }

                var myconfigEntry = archive.CreateEntry("my_config.json");
                using (var entryStream = myconfigEntry.Open())
                using (var writer = new StreamWriter(entryStream))
                {
                    writer.Write(myConfigJson.ToString());
                }
            }

            // Return the ZIP file as a byte array
            return memoryStream.ToArray();
        }
    }

    public async Task<string> GetJSON(Guid mechanismId)
    {
        var reactionService = new ReactionService(_database);
        var speciesService = new SpeciesService(_database);
        var mechanismService = new MechanismService(_database);
        var reactionSpeciesService = new ReactionSpeciesService(_database);

        // Get mechanism
        var mechanism = await mechanismService.GetMechanismAsync(mechanismId);
        if (mechanism == null)
        {
            return string.Empty;
        }

        // Get the mechanism's json in a string. This includes reactions, etc. (which then includes whatever they store)
        string mString = await mechanismService.GetMechanismExportedJSON(mechanism);

        // Set options for json serializer
        var options = new JsonSerializerOptions{ WriteIndented = true };

        // Create JSON Object that will store all data, including hardcoded info that isn't stored in mechanisms or other entities. 
        // We use JsonNode.Parse(mString) to avoid double serializing by getting the unaltered JSON value back.
        JsonObject jsonObj = JsonNode.Parse(mString)?.AsObject() ?? new JsonObject();

        return jsonObj.ToString();
    }

    public async Task<string> GetYAML(Guid mechanismId)
    {
        var reactionService = new ReactionService(_database);
        var speciesService = new SpeciesService(_database);
        var mechanismService = new MechanismService(_database);
        var reactionSpeciesService = new ReactionSpeciesService(_database);

        // Get mechanism
        var mechanism = await mechanismService.GetMechanismAsync(mechanismId);
        if (mechanism == null)
        {
            return string.Empty;
        }

        // Initialize YAML serializer and set options for serializer
        var serializer = new SerializerBuilder()
            .WithNamingConvention(CamelCaseNamingConvention.Instance)
            .Build();

        // Get the mechanism's yaml in a string. This includes reactions, etc. (which then includes whatever they store)
        string mString = await mechanismService.GetMechanismExportedYAML(mechanism);

        return mString;
    }
}