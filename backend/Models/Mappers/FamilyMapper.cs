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
            Owner = family.Owner == null ? null : new OwnerDto
            {
                Id = family.Owner.Id,
                Username = family.Owner.Username,
                Role = family.Owner.Role,
            },
            ContributorIds = family.Contributors?.Select(c => c.UserId).ToList() ?? new(),
            Name = family.Name,
            Description = family.Description,
            IsPublic = family.IsPublic,
            CurrentVersionId = family.CurrentVersionId,
            Species = family.Species.Select(s => s.ToDto()).ToList(),
            Reactions = family.Reactions.Select(r => r.ToDto()).ToList(),
            Phases = family.Phases.Select(p => p.ToDto()).ToList(),
            Mechanisms = family.Mechanisms.Select(m => m.ToDto()).ToList(),
        };
    }

    public static FamilyContributorDto ToDto(this FamilyContributor contributor)
    {
        return new FamilyContributorDto
        {
            UserId = contributor.UserId,
            Role = contributor.Role,
            Email = contributor.User?.Email,
            Username = contributor.User?.Username,
            FirstName = contributor.User?.FirstName,
            LastName = contributor.User?.LastName,
        };
    }
}
