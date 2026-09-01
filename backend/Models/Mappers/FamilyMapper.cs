using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;

namespace ChemistryCafeAPI.Models.Mappers;

public static class FamilyMapper
{
    public static FamilyDto ToDto(this Family family)
    {
        return new FamilyDto
        {
            Id = family.Id,
            OwnerId = family.Owner?.Id ?? Guid.Empty,
            Name = family.Name,
            Description = family.Description,
            Species = family.Species.Select(s => s.ToDto()).ToList(),
            Reactions = family.Reactions.Select(r => r.ToDto()).ToList(),
            Phases = family.Phases.Select(p => p.ToDto()).ToList(),
            Mechanisms = family.Mechanisms.Select(m => m.ToDto()).ToList(),
        };
    }
}
