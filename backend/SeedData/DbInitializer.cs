using System.Text.Json;
using ChemistryCafeAPI.Models;

namespace ChemistryCafeAPI.SeedData;

// Seeds the database with the default families (Mozart, Test) on a fresh
// database. Idempotent: it does nothing if any family already exists. The
// caller gates this to the Development environment.
public static class DbInitializer
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static void Seed(ChemistryDbContext context)
    {
        if (context.Families.Any())
        {
            return;
        }

        var path = Path.Combine(AppContext.BaseDirectory, "SeedData", "seed.json");
        if (!File.Exists(path))
        {
            return;
        }

        var root = JsonSerializer.Deserialize<SeedRoot>(File.ReadAllText(path), JsonOptions);
        if (root is null || root.Families.Count == 0)
        {
            return;
        }

        var owner = context.Users.FirstOrDefault(u => u.Username == "seed")
            ?? new User { Id = Guid.NewGuid(), Username = "seed", Role = "admin" };

        foreach (var seedFamily in root.Families)
        {
            context.Families.Add(BuildFamily(seedFamily, owner));
        }

        context.SaveChanges();
    }

    // Builds a whole Family graph wired by navigation properties. A single
    // SaveChanges cascade-inserts species, phases, reactions (with their
    // reactants/products/attributes) and the mechanism join rows.
    private static Family BuildFamily(SeedFamily seedFamily, User owner)
    {
        var family = new Family
        {
            Id = Guid.NewGuid(),
            Name = seedFamily.Name,
            Owner = owner,
        };

        var speciesByName = new Dictionary<string, Species>();
        foreach (var seedSpecies in seedFamily.Species)
        {
            var species = new Species
            {
                Id = Guid.NewGuid(),
                Name = seedSpecies.Name,
                MolecularWeight = seedSpecies.MolecularWeight,
                AbsoluteTolerance = seedSpecies.AbsoluteTolerance,
                ConstantConcentration = seedSpecies.ConstantConcentration,
                ConstantMixingRatio = seedSpecies.ConstantMixingRatio,
                IsThirdBody = seedSpecies.IsThirdBody,
                OtherProperties = seedSpecies.OtherProperties,
                Family = family,
            };
            speciesByName[species.Name] = species;
            family.Species.Add(species);
        }

        var phaseByName = new Dictionary<string, Phase>();
        foreach (var seedPhase in seedFamily.Phases)
        {
            var phase = new Phase
            {
                Id = Guid.NewGuid(),
                Name = seedPhase.Name,
                Family = family,
            };
            foreach (var speciesName in seedPhase.Species)
            {
                phase.Species.Add(speciesByName[speciesName]);
            }
            phaseByName[phase.Name] = phase;
            family.Phases.Add(phase);
        }

        foreach (var seedMechanism in seedFamily.Mechanisms)
        {
            var mechanism = new Mechanism
            {
                Id = Guid.NewGuid(),
                Name = seedMechanism.Name,
                Family = family,
            };

            foreach (var speciesName in seedMechanism.Species)
            {
                mechanism.Species.Add(speciesByName[speciesName]);
            }
            foreach (var phaseName in seedMechanism.Phases)
            {
                mechanism.Phases.Add(phaseByName[phaseName]);
            }

            foreach (var seedReaction in seedMechanism.Reactions)
            {
                var reaction = new Reaction
                {
                    Id = Guid.NewGuid(),
                    Name = seedReaction.Name,
                    ReactionType = seedReaction.Type,
                    Family = family,
                    GasPhase = seedReaction.GasPhase is null ? null : phaseByName[seedReaction.GasPhase],
                    GasPhaseSpecies = seedReaction.GasPhaseSpecies is null
                        ? null
                        : speciesByName[seedReaction.GasPhaseSpecies],
                };

                foreach (var reactant in seedReaction.Reactants)
                {
                    reaction.Reactants.Add(new Reactant
                    {
                        Species = speciesByName[reactant.Name],
                        Coefficient = reactant.Coefficient,
                    });
                }
                foreach (var product in seedReaction.Products)
                {
                    reaction.Products.Add(new Product
                    {
                        Species = speciesByName[product.Name],
                        Coefficient = product.Coefficient,
                        Branch = product.Branch,
                    });
                }
                foreach (var (key, value) in seedReaction.NumericalAttributes)
                {
                    reaction.NumericalAttributes.Add(new ReactionNumericalAttribute
                    {
                        SerializationKey = key,
                        Value = value,
                    });
                }
                foreach (var (key, value) in seedReaction.StringAttributes)
                {
                    reaction.StringAttributes.Add(new ReactionStringAttribute
                    {
                        SerializationKey = key,
                        Value = value,
                    });
                }

                family.Reactions.Add(reaction);
                mechanism.Reactions.Add(reaction);
            }

            family.Mechanisms.Add(mechanism);
        }

        return family;
    }
}
