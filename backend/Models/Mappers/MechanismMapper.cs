using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;

namespace ChemistryCafeAPI.Models.Mappers;

public static class MechanismMapper
{
    public static MechanismDto ToDto(this Mechanism mechanism)
    {
        return new MechanismDto
        {
            Id = mechanism.Id,
            FamilyId = mechanism.FamilyId,
            Name = mechanism.Name,
            Description = mechanism.Description,
            SpeciesIds = mechanism.Species.Select(s => s.Id).ToList(),
            ReactionIds = mechanism.Reactions.Select(r => r.Id).ToList(),
            PhaseIds = mechanism.Phases.Select(p => p.Id).ToList(),
        };
    }

    /// <summary>
    /// Maps the scalar fields to a Mechanism entity. The species/reaction/phase
    /// join memberships are resolved against the family during the family save.
    /// </summary>
    public static Mechanism ToEntity(this MechanismDto mechanismDto)
    {
        return new Mechanism
        {
            Id = mechanismDto.Id,
            FamilyId = mechanismDto.FamilyId,
            Name = mechanismDto.Name,
            Description = mechanismDto.Description,
        };
    }
}
