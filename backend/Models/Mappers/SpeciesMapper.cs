using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;

namespace ChemistryCafeAPI.Models.Mappers;

public static class SpeciesMapper
{
    public static SpeciesDto ToDto(this Species species)
    {
        return new SpeciesDto
        {
            Id = species.Id,
            Name = species.Name,
            Description = species.Description,
            FamilyId = species.FamilyId,
            IsThirdBody = species.IsThirdBody,
            MolecularWeight = species.MolecularWeight,
            ConstantConcentration = species.ConstantConcentration,
            ConstantMixingRatio = species.ConstantMixingRatio,
            OtherProperties = species.OtherProperties,
            AbsoluteTolerance = species.AbsoluteTolerance
        };
    }

    public static Species ToEntity(this SpeciesDto speciesDto)
    {
      return new Species
      {
          Id = speciesDto.Id,
          Name = speciesDto.Name,
          Description = speciesDto.Description,
          FamilyId = speciesDto.FamilyId,
          IsThirdBody = speciesDto.IsThirdBody,
          MolecularWeight = speciesDto.MolecularWeight,
          ConstantConcentration = speciesDto.ConstantConcentration,
          ConstantMixingRatio = speciesDto.ConstantMixingRatio,
          OtherProperties = speciesDto.OtherProperties,
          AbsoluteTolerance = speciesDto.AbsoluteTolerance
      };
    }
}