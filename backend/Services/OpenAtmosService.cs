// OpenAtmosService.cs
using System.Text;
using Chemistry_Cafe_API.Services;
using MySqlConnector;

public class OpenAtmosService
{
    private readonly MySqlDataSource _database;

    public OpenAtmosService(MySqlDataSource database)
    {
        _database = database;
    }

    public async Task<string> GetJSON(int mechanismId)
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
            json.AppendLine($"      \"equation\": \"{reaction.Equation}\",");
            // Include additional fields if needed

            // Reactants
            var reactants = await reactionSpeciesService.GetReactantsByReactionIdAsync(reaction.Id);
            if (reactants.Any())
            {
                json.AppendLine("      \"reactants\": [");
                foreach (var reactant in reactants)
                {
                    json.AppendLine("        {");
                    json.AppendLine($"          \"species name\": \"{reactant.SpeciesName}\",");
                    json.AppendLine($"          \"coefficient\": {reactant.Quantity}");
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
                    json.AppendLine($"          \"species name\": \"{product.SpeciesName}\",");
                    json.AppendLine($"          \"coefficient\": {product.Quantity}");
                    json.AppendLine("        },");
                }
                json.Length -= 3;
                json.AppendLine();
                json.AppendLine("      ],");
            }

            json.Length -= 3;
            json.AppendLine();
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

    public async Task<string> GetYAML(int mechanismId)
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
            yaml.AppendLine($"- equation: {reaction.Equation}");
            // Include additional fields if needed

            // Reactants
            var reactants = await reactionSpeciesService.GetReactantsByReactionIdAsync(reaction.Id);
            if (reactants.Any())
            {
                yaml.AppendLine("  reactants:");
                foreach (var reactant in reactants)
                {
                    yaml.AppendLine("  - species name: " + reactant.SpeciesName);
                    yaml.AppendLine("    coefficient: " + reactant.Quantity);
                }
            }

            // Products
            var products = await reactionSpeciesService.GetProductsByReactionIdAsync(reaction.Id);
            if (products.Any())
            {
                yaml.AppendLine("  products:");
                foreach (var product in products)
                {
                    yaml.AppendLine("  - species name: " + product.SpeciesName);
                    yaml.AppendLine("    coefficient: " + product.Quantity);
                }
            }
        }

        return yaml.ToString();
    }
}
