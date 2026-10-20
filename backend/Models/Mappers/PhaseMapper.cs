using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;

namespace ChemistryCafeAPI.Models.Mappers;

public static class PhaseMapper
{
    public static PhaseDto ToDto(this Phase phase)
    {
        return new PhaseDto
        {
            Id = phase.Id,
            FamilyId = phase.FamilyId,
            Name = phase.Name,
            Description = phase.Description,
            SpeciesIds = phase.PhaseSpecies.Select(ps => ps.SpeciesId).ToList(),
            DiffusionCoefficients = phase.PhaseSpecies
                .Where(ps => ps.DiffusionCoefficient != null)
                .ToDictionary(ps => ps.SpeciesId, ps => ps.DiffusionCoefficient!.Value),
        };
    }

    /// <summary>
    /// Gives the diffusion coefficient of a member species, or null when the
    /// phase has no value for that species.
    /// </summary>
    public static double? DiffusionCoefficientOf(this PhaseDto phaseDto, Guid speciesId)
    {
        return phaseDto.DiffusionCoefficients.TryGetValue(speciesId, out double value) ? value : null;
    }

    /// <summary>
    /// Maps the scalar fields to a Phase entity. Species membership (the
    /// PhaseSpecies join) is resolved against the family during the family save.
    /// </summary>
    public static Phase ToEntity(this PhaseDto phaseDto)
    {
        return new Phase
        {
            Id = phaseDto.Id,
            FamilyId = phaseDto.FamilyId,
            Name = phaseDto.Name,
            Description = phaseDto.Description,
        };
    }
}
