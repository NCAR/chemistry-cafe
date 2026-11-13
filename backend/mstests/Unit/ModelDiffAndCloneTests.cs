using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;
using ChemistryCafeAPI.Models.Mappers;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace ChemistryCafeAPI.Tests
{
    [TestClass]
    public class ModelDiffAndCloneTests
    {
        [TestMethod]
        public void Species_IsDifferent_UpdateFrom_Clone_BehavesCorrectly()
        {
            var species = new Species
            {
                Id = Guid.NewGuid(),
                Name = "O3",
                Description = "Ozone",
                MolecularWeight = 0.048,
                IsThirdBody = false,
                ConstantConcentration = 1.0,
                ConstantMixingRatio = 2.0,
                AbsoluteTolerance = 1e-12,
                OtherProperties = new Dictionary<string, JsonElement>
                {
                    ["tag"] = JsonSerializer.SerializeToElement("troposphere"),
                },
            };

            var dto = species.ToDto();
            Assert.IsFalse(species.IsDifferent(dto));

            dto.MolecularWeight = 0.050;
            Assert.IsTrue(species.IsDifferent(dto));

            species.UpdateFrom(dto);
            Assert.AreEqual(0.050, species.MolecularWeight);
            Assert.IsFalse(species.IsDifferent(dto));

            var targetVersion = new FamilyVersion { Id = Guid.NewGuid() };
            var now = DateTime.UtcNow;
            var cloned = species.Clone(targetVersion, now);

            Assert.AreNotEqual(species.Id, cloned.Id);
            Assert.AreEqual(species.Id, cloned.SourceObjectId);
            Assert.AreEqual(targetVersion.Id, cloned.FamilyVersionId);
            Assert.AreEqual("O3", cloned.Name);
            Assert.AreEqual(0.050, cloned.MolecularWeight);
            Assert.IsFalse(cloned.IsDifferent(dto));
        }

        [TestMethod]
        public void Phase_IsDifferent_UpdateFrom_Clone_BehavesCorrectly()
        {
            var s1 = new Species { Id = Guid.NewGuid(), Name = "A" };
            var s2 = new Species { Id = Guid.NewGuid(), Name = "B" };
            var phase = new Phase
            {
                Id = Guid.NewGuid(),
                Name = "gas",
                Description = "gas phase",
                PhaseSpecies = new List<PhaseSpecies>
                {
                    new PhaseSpecies { SpeciesId = s1.Id, Species = s1, DiffusionCoefficient = 1e-5 },
                },
            };

            var dto = phase.ToDto();
            Assert.IsFalse(phase.IsDifferent(dto));

            dto.SpeciesIds.Add(s2.Id);
            dto.DiffusionCoefficients = new Dictionary<Guid, double>
            {
                [s1.Id] = 2e-5,
                [s2.Id] = 3e-5,
            };
            Assert.IsTrue(phase.IsDifferent(dto));

            var removed = new List<PhaseSpecies>();
            phase.UpdateFrom(dto, new List<Species> { s1, s2 }, ps => removed.Add(ps));
            Assert.AreEqual(0, removed.Count);
            Assert.AreEqual(2, phase.PhaseSpecies.Count);
            Assert.IsFalse(phase.IsDifferent(dto));
        }

        [TestMethod]
        public void Reaction_IsDifferent_UpdateFrom_Clone_BehavesCorrectly()
        {
            var s1Id = Guid.NewGuid();
            var s2Id = Guid.NewGuid();
            var rId = Guid.NewGuid();
            var reaction = new Reaction
            {
                Id = rId,
                Name = "R1",
                ReactionType = "ARRHENIUS",
                Reactants = new List<Reactant> { new Reactant { ReactionId = rId, SpeciesId = s1Id, Coefficient = 1.0 } },
                Products = new List<Product> { new Product { ReactionId = rId, SpeciesId = s2Id, Coefficient = 1.0 } },
                Arrhenius = new ArrheniusParameters { ReactionId = rId, A = 1.0, Ea = 100.0, D = 300.0 },
                TaylorSeries = new TaylorSeriesParameters
                {
                    ReactionId = rId,
                    A = 2.0,
                    D = 300.0,
                    TaylorCoefficients = new List<double> { 0.1, 0.2 },
                },
            };

            var dto = reaction.ToDto();
            Assert.IsFalse(reaction.IsDifferent(dto));

            dto.Arrhenius!.A = 2.5;
            Assert.IsTrue(reaction.IsDifferent(dto));

            reaction.UpdateFrom(dto);
            Assert.AreEqual(2.5, reaction.Arrhenius.A);
            Assert.IsFalse(reaction.IsDifferent(dto));

            dto.TaylorSeries!.TaylorCoefficients = new List<double> { 0.1, 0.3 };
            Assert.IsTrue(reaction.IsDifferent(dto));

            reaction.UpdateFrom(dto);
            Assert.IsFalse(reaction.IsDifferent(dto));

            // Changing reaction type from ARRHENIUS to TROE updates ReactionType and swaps parameters
            dto.ReactionType = "TROE";
            dto.Arrhenius = null;
            dto.Troe = new TroeParametersDto
            {
                K0A = 1.1,
                K0B = -2.0,
                K0C = 0.0,
                KinfA = 3.3,
                KinfB = 0.0,
                KinfC = 0.0,
                Fc = 0.6,
                N = 1.0,
            };
            Assert.IsTrue(reaction.IsDifferent(dto));

            reaction.UpdateFrom(dto);
            Assert.AreEqual("TROE", reaction.ReactionType);
            Assert.IsNull(reaction.Arrhenius);
            Assert.IsNotNull(reaction.Troe);
            Assert.AreEqual(1.1, reaction.Troe.K0A);
            Assert.IsFalse(reaction.IsDifferent(dto));
        }

        [TestMethod]
        public void Mechanism_IsDifferent_And_HasDependencyChanges_BehavesCorrectly()
        {
            var s1 = new Species { Id = Guid.NewGuid(), Name = "S1" };
            var r1 = new Reaction { Id = Guid.NewGuid(), Name = "R1", ReactionType = "ARRHENIUS" };
            var p1 = new Phase { Id = Guid.NewGuid(), Name = "P1" };

            var mech = new Mechanism
            {
                Id = Guid.NewGuid(),
                Name = "M1",
                Description = "Desc",
                Species = new List<Species> { s1 },
                Reactions = new List<Reaction> { r1 },
                Phases = new List<Phase> { p1 },
            };

            var dto = mech.ToDto();
            Assert.IsFalse(mech.IsDifferent(dto));
            Assert.IsFalse(mech.HasDependencyChanges(
                dto,
                new HashSet<Guid>(),
                new HashSet<Guid>(),
                new HashSet<Guid>()));

            Assert.IsTrue(mech.HasDependencyChanges(
                dto,
                new HashSet<Guid> { s1.Id },
                new HashSet<Guid>(),
                new HashSet<Guid>()));

            Assert.IsFalse(mech.HasDependencyChanges(
                dto,
                new HashSet<Guid> { Guid.NewGuid() },
                new HashSet<Guid>(),
                new HashSet<Guid>()));
        }
    }
}

