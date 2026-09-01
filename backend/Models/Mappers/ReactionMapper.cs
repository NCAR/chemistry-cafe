using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;

namespace ChemistryCafeAPI.Models.Mappers;

public static class ReactionMapper
{
    public static ReactionDto ToDto(this Reaction reaction)
    {
        return new ReactionDto
        {
            Id = reaction.Id,
            FamilyId = reaction.FamilyId,
            Name = reaction.Name,
            ReactionType = reaction.ReactionType,
            Description = reaction.Description,
            Reactants = reaction.Reactants
                .Select(r => new ReactantDto { SpeciesId = r.SpeciesId, Coefficient = r.Coefficient })
                .ToList(),
            Products = reaction.Products
                .Select(p => new ProductDto { SpeciesId = p.SpeciesId, Coefficient = p.Coefficient, Branch = p.Branch })
                .ToList(),
            NumericalAttributes = reaction.NumericalAttributes
                .Select(a => new ReactionNumericalAttributeDto { SerializationKey = a.SerializationKey, Value = a.Value })
                .ToList(),
            StringAttributes = reaction.StringAttributes
                .Select(a => new ReactionStringAttributeDto { SerializationKey = a.SerializationKey, Value = a.Value })
                .ToList(),
            GasPhaseId = reaction.GasPhaseId,
            GasPhaseSpeciesId = reaction.GasPhaseSpeciesId,
            AerosolPhaseId = reaction.AerosolPhaseId,
            AerosolPhaseSpeciesId = reaction.AerosolPhaseSpeciesId,
            AerosolPhaseWaterId = reaction.AerosolPhaseWaterId,
        };
    }

    /// <summary>
    /// Maps a ReactionDto to a Reaction entity. Reactants/products/attributes are
    /// self-contained value rows, so they are built here; the many-to-many link
    /// to mechanisms is set from the mechanism side during the family save.
    /// </summary>
    public static Reaction ToEntity(this ReactionDto reactionDto)
    {
        return new Reaction
        {
            Id = reactionDto.Id,
            FamilyId = reactionDto.FamilyId,
            Name = reactionDto.Name,
            ReactionType = reactionDto.ReactionType,
            Description = reactionDto.Description,
            Reactants = reactionDto.Reactants
                .Select(r => new Reactant { SpeciesId = r.SpeciesId, Coefficient = r.Coefficient })
                .ToList(),
            Products = reactionDto.Products
                .Select(p => new Product { SpeciesId = p.SpeciesId, Coefficient = p.Coefficient, Branch = p.Branch })
                .ToList(),
            NumericalAttributes = reactionDto.NumericalAttributes
                .Select(a => new ReactionNumericalAttribute { SerializationKey = a.SerializationKey, Value = a.Value })
                .ToList(),
            StringAttributes = reactionDto.StringAttributes
                .Select(a => new ReactionStringAttribute { SerializationKey = a.SerializationKey, Value = a.Value })
                .ToList(),
            GasPhaseId = reactionDto.GasPhaseId,
            GasPhaseSpeciesId = reactionDto.GasPhaseSpeciesId,
            AerosolPhaseId = reactionDto.AerosolPhaseId,
            AerosolPhaseSpeciesId = reactionDto.AerosolPhaseSpeciesId,
            AerosolPhaseWaterId = reactionDto.AerosolPhaseWaterId,
        };
    }
}
