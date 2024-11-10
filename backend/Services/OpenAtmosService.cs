﻿// OpenAtmosService.cs
using System.Text;
using Chemistry_Cafe_API.Services;
using MySqlConnector;
using System.IO.Compression;

public class OpenAtmosService
{
    private readonly MySqlDataSource _database;

    public OpenAtmosService(MySqlDataSource database)
    {
        _database = database;
    }

    public async Task<string> GetJSON(Guid mechanismId)
    {
        var reactionService = new ReactionService(_database);
        var speciesService = new SpeciesService(_database);
        var mechanismService = new MechanismService(_database);
        var reactionSpeciesService = new ReactionSpeciesService(_database);

        // Get mechanism
        var mechanism = await mechanismService.GetMechanismAsync(mechanismId);

        // Initialize JSON builder
        var json = new StringBuilder();
        json.AppendLine("{");
        json.AppendLine($"  \"version\": \"1.0.0\",");
        json.AppendLine($"  \"name\": \"{mechanism?.Name}\",");

        // Get species
        var speciesList = await speciesService.GetSpeciesByMechanismIdAsync(mechanismId);
        json.AppendLine("  \"species\": [");
        foreach (var species in speciesList)
        {
            json.AppendLine("    {");
            json.AppendLine($"      \"name\": \"{species.Name}\"");
            json.AppendLine("    },");
        }
        if (speciesList.Any())
        {
            json.Length -= 3; // Remove last comma and newline
            json.AppendLine();
        }
        json.AppendLine("  ],");

        // Phases
        json.AppendLine("  \"phases\": [");
        json.AppendLine("    {");
        json.AppendLine("      \"name\": \"gas\",");
        json.AppendLine("      \"species\": [");
        foreach (var species in speciesList)
        {
            json.AppendLine($"        \"{species.Name}\",");
        }
        if (speciesList.Any())
        {
            json.Length -= 3;
            json.AppendLine();
        }
        json.AppendLine("      ]");
        json.AppendLine("    }");
        json.AppendLine("  ],");

        // Get reactions
        var reactionList = await reactionService.GetReactionsByMechanismIdAsync(mechanismId);
        json.AppendLine("  \"reactions\": [");
        foreach (var reaction in reactionList)
        {
            json.AppendLine("    {");
            json.AppendLine($"      \"equation\": \"{reaction.Description}\","); // Changed from Equation to Description
            // Include additional fields if needed

            // Reactants
            var reactants = await reactionSpeciesService.GetReactantsByReactionIdAsync(reaction.Id);
            if (reactants.Any())
            {
                json.AppendLine("      \"reactants\": [");
                foreach (var reactant in reactants)
                {
                    json.AppendLine("        {");
                    json.AppendLine($"          \"species name\": \"{reactant.SpeciesName}\"");
                    json.AppendLine("        },");
                }
                json.Length -= 3;
                json.AppendLine();
                json.AppendLine("      ],");
            }

            // Products
            var products = await reactionSpeciesService.GetProductsByReactionIdAsync(reaction.Id);
            if (products.Any())
            {
                json.AppendLine("      \"products\": [");
                foreach (var product in products)
                {
                    json.AppendLine("        {");
                    json.AppendLine($"          \"species name\": \"{product.SpeciesName}\"");
                    json.AppendLine("        },");
                }
                json.Length -= 3;
                json.AppendLine();
                json.AppendLine("      ],");
            }

            // Remove trailing comma if present
            if (json[json.Length - 3] == ',')
            {
                json.Length -= 1;
            }

            json.AppendLine("    },");
        }
        if (reactionList.Any())
        {
            json.Length -= 3;
            json.AppendLine();
        }
        json.AppendLine("  ]");
        json.AppendLine("}");

        return json.ToString();
    }

    public async Task<string> GetYAML(Guid mechanismId)
    {
        var reactionService = new ReactionService(_database);
        var speciesService = new SpeciesService(_database);
        var mechanismService = new MechanismService(_database);
        var reactionSpeciesService = new ReactionSpeciesService(_database);

        // Get mechanism
        var mechanism = await mechanismService.GetMechanismAsync(mechanismId);

        // Initialize YAML builder
        var yaml = new StringBuilder();
        yaml.AppendLine("---");
        yaml.AppendLine($"version: 1.0.0");
        yaml.AppendLine($"name: {mechanism?.Name}");

        // Species
        yaml.AppendLine("species:");
        var speciesList = await speciesService.GetSpeciesByMechanismIdAsync(mechanismId);
        foreach (var species in speciesList)
        {
            yaml.AppendLine($"- name: {species.Name}");
        }

        // Phases
        yaml.AppendLine("phases:");
        yaml.AppendLine("- name: gas");
        yaml.AppendLine("  species:");
        foreach (var species in speciesList)
        {
            yaml.AppendLine($"  - {species.Name}");
        }

        // Reactions
        yaml.AppendLine("reactions:");
        var reactionList = await reactionService.GetReactionsByMechanismIdAsync(mechanismId);
        foreach (var reaction in reactionList)
        {
            yaml.AppendLine($"- equation: {reaction.Description}"); // Changed from Equation to Description
            // Include additional fields if needed

            // Reactants
            var reactants = await reactionSpeciesService.GetReactantsByReactionIdAsync(reaction.Id);
            if (reactants.Any())
            {
                yaml.AppendLine("  reactants:");
                foreach (var reactant in reactants)
                {
                    yaml.AppendLine($"  - species name: {reactant.SpeciesName}");
                }
            }

            // Products
            var products = await reactionSpeciesService.GetProductsByReactionIdAsync(reaction.Id);
            if (products.Any())
            {
                yaml.AppendLine("  products:");
                foreach (var product in products)
                {
                    yaml.AppendLine($"  - species name: {product.SpeciesName}");
                }
            }
        }

        return yaml.ToString();
    }

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
        if (speciesList.Any()) speciesJson.Length -= 3; // Remove trailing comma and newline
        speciesJson.AppendLine();
        speciesJson.AppendLine("  ]");
        speciesJson.AppendLine("}");

        var mechanismService = new MechanismService(_database);
        var mechanism = await mechanismService.GetMechanismAsync(mechanismId);

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
            var type = reaction.Description.Split(' ')[0];
            reactionsJson.AppendLine($"          \"type\": \"{type}\",");

            // Reactants
            reactionsJson.AppendLine("          \"reactants\": {");
            var reactants = await reactionSpeciesService.GetReactantsByReactionIdAsync(reaction.Id);
            foreach (var reactant in reactants)
            {
                reactionsJson.AppendLine($"            \"{reactant.SpeciesName}\": {{ }},");
            }
            if (reactants.Any()) reactionsJson.Length -= 1; // Remove trailing comma
            reactionsJson.AppendLine();
            reactionsJson.AppendLine("          },"); // Close reactants

            // Products
            reactionsJson.AppendLine("          \"products\": {");
            var products = await reactionSpeciesService.GetProductsByReactionIdAsync(reaction.Id);
            foreach (var product in products)
            {
                reactionsJson.AppendLine($"            \"{product.SpeciesName}\": {{ }},");
            }
            if (products.Any()) reactionsJson.Length -= 1; // Remove trailing comma
            reactionsJson.AppendLine();
            reactionsJson.AppendLine("          }"); // Close products

            reactionsJson.AppendLine("        },"); // Close reaction
        }
        if (reactionList.Any()) reactionsJson.Length -= 1; // Remove trailing comma
        reactionsJson.AppendLine();
        reactionsJson.AppendLine("      ]");
        reactionsJson.AppendLine("    }");
        reactionsJson.AppendLine("  ]");
        reactionsJson.AppendLine("}");

        // Create ZIP file in memory
        using (var memoryStream = new MemoryStream())
        {
            using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
            {
                // Add species.json to ZIP
                var speciesEntry = archive.CreateEntry("species.json");
                using (var entryStream = speciesEntry.Open())
                using (var writer = new StreamWriter(entryStream))
                {
                    writer.Write(speciesJson.ToString());
                }

                // Add reactions.json to ZIP
                var reactionsEntry = archive.CreateEntry("reactions.json");
                using (var entryStream = reactionsEntry.Open())
                using (var writer = new StreamWriter(entryStream))
                {
                    writer.Write(reactionsJson.ToString());
                }

                var configEntry = archive.CreateEntry("config.json");
                using (var entryStream = configEntry.Open())
                using (var writer = new StreamWriter(entryStream))
                {
                    writer.Write("{\"camp-files\": [\"species.json\", \"reactions.json\"]}");
                }
            }

            // Return the ZIP file as a byte array
            return memoryStream.ToArray();
        }
    }
}
