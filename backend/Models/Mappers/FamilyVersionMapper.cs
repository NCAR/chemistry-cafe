using ChemistryCafeAPI.Models.Dto;

namespace ChemistryCafeAPI.Models.Mappers;

public static class FamilyVersionMapper
{
    public static FamilyVersionDto ToDto(this FamilyVersion version)
    {
        return new FamilyVersionDto
        {
            Id = version.Id,
            FamilyId = version.FamilyId,
            CreatedDate = version.CreatedDate,
            Species = version.Species.Select(s => s.ToDto()).ToList(),
            Reactions = version.Reactions.Select(r => r.ToDto()).ToList(),
            Phases = version.Phases.Select(p => p.ToDto()).ToList(),
        };
    }
}

