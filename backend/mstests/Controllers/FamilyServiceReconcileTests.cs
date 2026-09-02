using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;
using ChemistryCafeAPI.Services;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChemistryCafeAPI.Tests
{
    /// <summary>
    /// Exercises the whole-family update reconcile in FamilyService.UpdateFamilyAsync
    /// (TrackChangesToFamily): add, update, and delete of each child, relation
    /// membership changes, and the validation gates.
    ///
    /// Every operation runs on its own fresh context (DBConnection.NewContext), so a
    /// failure in one test cannot poison the shared static context that the other
    /// test classes use. Each context also mirrors a real request lifetime.
    /// </summary>
    [TestClass]
    public class FamilyServiceReconcileTests
    {
        private static Guid _ownerId;
        private static string _nameIdentifier = null!;
        private static readonly List<Guid> _createdFamilyIds = new();

        [ClassInitialize]
        public static void ClassInit(TestContext context)
        {
            using ChemistryDbContext ctx = DBConnection.NewContext();
            var userService = new UserService(ctx);
            User owner = userService.SignIn("reconcile-google-id", "reconcile-test@fake-website.com").Result;
            _ownerId = owner.Id;
            _nameIdentifier = owner.Id.ToString();
        }

        [ClassCleanup]
        public static void ClassCleanup()
        {
            using ChemistryDbContext ctx = DBConnection.NewContext();
            var familyService = new FamilyService(ctx, new UserService(ctx));
            foreach (Guid id in _createdFamilyIds)
            {
                familyService.DeleteFamilyAsync(id, _nameIdentifier).Wait();
            }
        }

        private static FamilyService NewService(ChemistryDbContext ctx) =>
            new FamilyService(ctx, new UserService(ctx));

        /// <summary>
        /// Builds a rich family graph with client-provided ids: three species (one
        /// unreferenced), one reaction, one phase, and one mechanism that links to
        /// all three. Every id is fresh, so each test owns an independent family.
        /// </summary>
        private static FamilyDto BuildBaseFamily()
        {
            Guid s1 = Guid.NewGuid();
            Guid s2 = Guid.NewGuid();
            Guid s3 = Guid.NewGuid(); // unreferenced, safe to delete
            Guid r1 = Guid.NewGuid();
            Guid p1 = Guid.NewGuid();
            Guid m1 = Guid.NewGuid();

            return new FamilyDto
            {
                Id = Guid.NewGuid(),
                OwnerId = _ownerId,
                Name = "ReconcileFamily",
                Description = "base graph",
                Species = new List<SpeciesDto>
                {
                    new SpeciesDto { Id = s1, Name = "A" },
                    new SpeciesDto { Id = s2, Name = "B" },
                    new SpeciesDto { Id = s3, Name = "C" },
                },
                Reactions = new List<ReactionDto>
                {
                    new ReactionDto
                    {
                        Id = r1,
                        Name = "R1",
                        ReactionType = "ARRHENIUS",
                        Reactants = new List<ReactantDto> { new ReactantDto { SpeciesId = s1, Coefficient = 1 } },
                        Products = new List<ProductDto> { new ProductDto { SpeciesId = s2, Coefficient = 1 } },
                    },
                },
                Phases = new List<PhaseDto>
                {
                    new PhaseDto { Id = p1, Name = "gas", SpeciesIds = new List<Guid> { s1, s2 } },
                },
                Mechanisms = new List<MechanismDto>
                {
                    new MechanismDto
                    {
                        Id = m1,
                        Name = "M1",
                        SpeciesIds = new List<Guid> { s1 },
                        ReactionIds = new List<Guid> { r1 },
                        PhaseIds = new List<Guid> { p1 },
                    },
                },
            };
        }

        private static async Task<FamilyDto> CreateBaseFamilyAsync(FamilyDto dto)
        {
            using ChemistryDbContext ctx = DBConnection.NewContext();
            var (result, _) = await NewService(ctx).CreateFamilyAsync(dto, _ownerId);
            Assert.AreEqual(QueryResult.Success, result);
            _createdFamilyIds.Add(dto.Id);
            return dto;
        }

        private static async Task<QueryResult> UpdateAsync(FamilyDto dto, string nameIdentifier)
        {
            using ChemistryDbContext ctx = DBConnection.NewContext();
            return await NewService(ctx).UpdateFamilyAsync(dto.Id, dto, nameIdentifier);
        }

        private static async Task<Family> ReloadAsync(Guid id)
        {
            using ChemistryDbContext ctx = DBConnection.NewContext();
            Family? family = await NewService(ctx).GetFamilyAsync(id);
            Assert.IsNotNull(family);
            return family!;
        }

        [TestMethod]
        public async Task Update_AddsSpecies()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());

            Guid newId = Guid.NewGuid();
            dto.Species.Add(new SpeciesDto { Id = newId, Name = "D" });

            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            Assert.AreEqual(4, reloaded.Species.Count);
            Assert.IsTrue(reloaded.Species.Any(s => s.Id == newId && s.Name == "D"));
        }

        [TestMethod]
        public async Task Update_DeletesSpecies()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());

            SpeciesDto unreferenced = dto.Species.Single(s => s.Name == "C");
            dto.Species.Remove(unreferenced);

            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            Assert.AreEqual(2, reloaded.Species.Count);
            Assert.IsFalse(reloaded.Species.Any(s => s.Id == unreferenced.Id));
        }

        [TestMethod]
        public async Task Update_RenamesSpecies()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());

            SpeciesDto target = dto.Species.Single(s => s.Name == "A");
            target.Name = "A-renamed";
            target.MolecularWeight = 0.048;

            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            Species reloadedSpecies = reloaded.Species.Single(s => s.Id == target.Id);
            Assert.AreEqual("A-renamed", reloadedSpecies.Name);
            Assert.AreEqual(0.048, reloadedSpecies.MolecularWeight);
        }

        [TestMethod]
        public async Task Update_ChangesPhaseMembership()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());

            // The gas phase held s1 and s2; drop s2 so it holds only s1 ("A").
            PhaseDto phase = dto.Phases.Single();
            Guid keptSpeciesId = dto.Species.Single(s => s.Name == "A").Id;
            phase.SpeciesIds = new List<Guid> { keptSpeciesId };

            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            Phase reloadedPhase = reloaded.Phases.Single(p => p.Id == phase.Id);
            Assert.AreEqual(1, reloadedPhase.Species.Count);
            Assert.AreEqual(keptSpeciesId, reloadedPhase.Species.Single().Id);
        }

        [TestMethod]
        public async Task Update_DeletesMechanism()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());

            dto.Mechanisms.Clear();

            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            Assert.AreEqual(0, reloaded.Mechanisms.Count);
        }

        [TestMethod]
        public async Task Update_AddsMechanism()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());

            Guid newMechanismId = Guid.NewGuid();
            Guid speciesId = dto.Species.Single(s => s.Name == "B").Id;
            Guid reactionId = dto.Reactions.Single().Id;
            Guid phaseId = dto.Phases.Single().Id;
            dto.Mechanisms.Add(new MechanismDto
            {
                Id = newMechanismId,
                Name = "M2",
                SpeciesIds = new List<Guid> { speciesId },
                ReactionIds = new List<Guid> { reactionId },
                PhaseIds = new List<Guid> { phaseId },
            });

            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            Mechanism added = reloaded.Mechanisms.Single(m => m.Id == newMechanismId);
            Assert.AreEqual(1, added.Species.Count, "new mechanism lost its species membership");
            Assert.AreEqual(1, added.Reactions.Count, "new mechanism lost its reaction membership");
            Assert.AreEqual(1, added.Phases.Count, "new mechanism lost its phase membership");
        }

        [TestMethod]
        public async Task Update_UnresolvedReference_ReturnsValidationError_AndLeavesFamilyUnchanged()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());

            // Point the phase at a species the family does not contain.
            dto.Phases.Single().SpeciesIds.Add(Guid.NewGuid());

            Assert.AreEqual(QueryResult.ValidationError, await UpdateAsync(dto, _nameIdentifier));

            // The rejected update must not have changed the stored graph.
            Family reloaded = await ReloadAsync(dto.Id);
            Assert.AreEqual(3, reloaded.Species.Count);
            Assert.AreEqual(2, reloaded.Phases.Single().Species.Count);
        }

        [TestMethod]
        public async Task Update_DuplicateChildIds_ReturnsValidationError()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());

            // Add a second species that reuses an existing id.
            Guid duplicateId = dto.Species.First().Id;
            dto.Species.Add(new SpeciesDto { Id = duplicateId, Name = "dup" });

            Assert.AreEqual(QueryResult.ValidationError, await UpdateAsync(dto, _nameIdentifier));
        }

        [TestMethod]
        public async Task Update_NonOwner_ReturnsNoAccess()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());

            Assert.AreEqual(QueryResult.NoAccess, await UpdateAsync(dto, Guid.NewGuid().ToString()));
        }
    }
}
