using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;

namespace ChemistryCafeAPI.Models.Mappers;

public static class SpeciesMapper
{
    public static SpeciesDto ToDto(this Species species)
    {
        return new SpeciesDto
        {
            AbsoluteTolerance = species.AbsoluteTolerance,
            ConstantConcentration = species.ConstantConcentration,
            ConstantMixingRatio = species.ConstantMixingRatio,
            Description = species.Description,
            FamilyId = species.FamilyVersion.FamilyId,
            FamilyVersionId = species.FamilyVersionId,
            Id = species.Id,
            IsThirdBody = species.IsThirdBody,
            MolecularWeight = species.MolecularWeight,
            Name = species.Name,
            OtherProperties = species.OtherProperties
        };
    }

    public static Species ToEntity(this SpeciesDto speciesDto)
    {
      return new Species
      {
          AbsoluteTolerance = speciesDto.AbsoluteTolerance,
          ConstantConcentration = speciesDto.ConstantConcentration,
          ConstantMixingRatio = speciesDto.ConstantMixingRatio,
          Description = speciesDto.Description,
          FamilyVersionId = speciesDto.FamilyVersionId,
          Id = speciesDto.Id,
          IsThirdBody = speciesDto.IsThirdBody,
          MolecularWeight = speciesDto.MolecularWeight,
          Name = speciesDto.Name,
          OtherProperties = speciesDto.OtherProperties
      };
    }
}