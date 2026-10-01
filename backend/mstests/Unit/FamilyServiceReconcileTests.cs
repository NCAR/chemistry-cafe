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
        private static User _owner;
        private static Guid _ownerId;
        private static string _nameIdentifier = null!;
        private static readonly List<Guid> _createdFamilyIds = new();

        [ClassInitialize]
        public static void ClassInit(TestContext context)
        {
            using ChemistryDbContext ctx = DBConnection.NewContext();
            var userService = new UserService(ctx);
            User owner = userService.SignInGoogle("reconcile-google-id", "reconcile-test@fake-website.com").Result;
            _owner = owner;
            _ownerId = owner.Id;
            _nameIdentifier = owner.Id.ToString();
        }

        [ClassCleanup]
        public static void ClassCleanup()
        {
            using ChemistryDbContext ctx = DBConnection.NewContext();
            var familyService = new FamilyService(ctx);
            foreach (Guid id in _createdFamilyIds)
            {
                familyService.DeleteFamilyAsync(id, _nameIdentifier).Wait();
            }
        }

        private static FamilyService NewService(ChemistryDbContext ctx) => new(ctx);

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
            ctx.Attach(_owner);
            var (result, _) = await NewService(ctx).CreateFamilyAsync(dto, _owner);
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

        [TestMethod]
        public async Task Create_PersistsArrheniusParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().Arrhenius = new ArrheniusParametersDto
            {
                A = 1.2e-11,
                B = 0.0,
                Ea = 100.0,
                D = 300.0,
                E = 0.0,
            };
            await CreateBaseFamilyAsync(dto);

            Family reloaded = await ReloadAsync(dto.Id);
            ArrheniusParameters? arrhenius = reloaded.Reactions.Single().Arrhenius;
            Assert.IsNotNull(arrhenius);
            Assert.AreEqual(1.2e-11, arrhenius!.A);
            Assert.AreEqual(100.0, arrhenius.Ea);
            Assert.AreEqual(300.0, arrhenius.D);
        }

        [TestMethod]
        public async Task Update_ChangesArrheniusParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().Arrhenius = new ArrheniusParametersDto
            {
                A = 1.0,
                Ea = 0.0,
                D = 300.0,
            };
            await CreateBaseFamilyAsync(dto);

            dto.Reactions.Single().Arrhenius = new ArrheniusParametersDto
            {
                A = 5.0,
                B = 2.0,
                Ea = 250.0,
                D = 300.0,
                E = 1.0,
            };
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            ArrheniusParameters? arrhenius = reloaded.Reactions.Single().Arrhenius;
            Assert.IsNotNull(arrhenius);
            Assert.AreEqual(5.0, arrhenius!.A);
            Assert.AreEqual(2.0, arrhenius.B);
            Assert.AreEqual(250.0, arrhenius.Ea);
            Assert.AreEqual(1.0, arrhenius.E);
        }

        [TestMethod]
        public async Task Create_PersistsTunnelingParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().Tunneling = new TunnelingParametersDto
            {
                A = 1.2e-11,
                B = 0.0,
                C = 300.0,
            };
            await CreateBaseFamilyAsync(dto);

            Family reloaded = await ReloadAsync(dto.Id);
            TunnelingParameters? tunneling = reloaded.Reactions.Single().Tunneling;
            Assert.IsNotNull(tunneling);
            Assert.AreEqual(1.2e-11, tunneling!.A);
            Assert.AreEqual(0.0, tunneling.B);
            Assert.AreEqual(300.0, tunneling.C);
        }

        [TestMethod]
        public async Task Update_ChangesTunnelingParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().Tunneling = new TunnelingParametersDto
            {
                A = 1.0,
                B = 0.0,
                C = 300.0,
            };
            await CreateBaseFamilyAsync(dto);

            dto.Reactions.Single().Tunneling = new TunnelingParametersDto
            {
                A = 5.0,
                B = 2.0,
                C = 150.0,
            };
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            TunnelingParameters? tunneling = reloaded.Reactions.Single().Tunneling;
            Assert.IsNotNull(tunneling);
            Assert.AreEqual(5.0, tunneling!.A);
            Assert.AreEqual(2.0, tunneling.B);
            Assert.AreEqual(150.0, tunneling.C);
        }

        [TestMethod]
        public async Task Create_PersistsTroeParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().Troe = new TroeParametersDto
            {
                K0A = 1.2e-11,
                K0B = 0.0,
                K0C = 300.0,
                KinfA = 1.0,
                KinfB = 0.0,
                KinfC = 0.0,
                Fc = 0.6,
                N = 1.0,
            };
            await CreateBaseFamilyAsync(dto);

            Family reloaded = await ReloadAsync(dto.Id);
            TroeParameters? troe = reloaded.Reactions.Single().Troe;
            Assert.IsNotNull(troe);
            Assert.AreEqual(1.2e-11, troe!.K0A);
            Assert.AreEqual(300.0, troe.K0C);
            Assert.AreEqual(1.0, troe.KinfA);
            Assert.AreEqual(0.6, troe.Fc);
            Assert.AreEqual(1.0, troe.N);
        }

        [TestMethod]
        public async Task Update_ChangesTroeParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().Troe = new TroeParametersDto
            {
                K0A = 1.0,
                K0B = 0.0,
                K0C = 0.0,
                KinfA = 1.0,
                KinfB = 0.0,
                KinfC = 0.0,
                Fc = 0.6,
                N = 1.0,
            };
            await CreateBaseFamilyAsync(dto);

            dto.Reactions.Single().Troe = new TroeParametersDto
            {
                K0A = 5.0,
                K0B = 2.0,
                K0C = 150.0,
                KinfA = 3.0,
                KinfB = 1.0,
                KinfC = 50.0,
                Fc = 0.4,
                N = 2.0,
            };
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            TroeParameters? troe = reloaded.Reactions.Single().Troe;
            Assert.IsNotNull(troe);
            Assert.AreEqual(5.0, troe!.K0A);
            Assert.AreEqual(2.0, troe.K0B);
            Assert.AreEqual(150.0, troe.K0C);
            Assert.AreEqual(3.0, troe.KinfA);
            Assert.AreEqual(0.4, troe.Fc);
            Assert.AreEqual(2.0, troe.N);
        }

        [TestMethod]
        public async Task Create_PersistsTernaryChemicalActivationParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().TernaryChemicalActivation = new TernaryChemicalActivationParametersDto
            {
                K0A = 1.2e-11,
                K0B = 0.0,
                K0C = 300.0,
                KinfA = 1.0,
                KinfB = 0.0,
                KinfC = 0.0,
                Fc = 0.6,
                N = 1.0,
            };
            await CreateBaseFamilyAsync(dto);

            Family reloaded = await ReloadAsync(dto.Id);
            TernaryChemicalActivationParameters? tca = reloaded.Reactions.Single().TernaryChemicalActivation;
            Assert.IsNotNull(tca);
            Assert.AreEqual(1.2e-11, tca!.K0A);
            Assert.AreEqual(300.0, tca.K0C);
            Assert.AreEqual(1.0, tca.KinfA);
            Assert.AreEqual(0.6, tca.Fc);
            Assert.AreEqual(1.0, tca.N);
        }

        [TestMethod]
        public async Task Update_ChangesTernaryChemicalActivationParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().TernaryChemicalActivation = new TernaryChemicalActivationParametersDto
            {
                K0A = 1.0,
                K0B = 0.0,
                K0C = 0.0,
                KinfA = 1.0,
                KinfB = 0.0,
                KinfC = 0.0,
                Fc = 0.6,
                N = 1.0,
            };
            await CreateBaseFamilyAsync(dto);

            dto.Reactions.Single().TernaryChemicalActivation = new TernaryChemicalActivationParametersDto
            {
                K0A = 5.0,
                K0B = 2.0,
                K0C = 150.0,
                KinfA = 3.0,
                KinfB = 1.0,
                KinfC = 50.0,
                Fc = 0.4,
                N = 2.0,
            };
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            TernaryChemicalActivationParameters? tca = reloaded.Reactions.Single().TernaryChemicalActivation;
            Assert.IsNotNull(tca);
            Assert.AreEqual(5.0, tca!.K0A);
            Assert.AreEqual(2.0, tca.K0B);
            Assert.AreEqual(150.0, tca.K0C);
            Assert.AreEqual(3.0, tca.KinfA);
            Assert.AreEqual(0.4, tca.Fc);
            Assert.AreEqual(2.0, tca.N);
        }

        [TestMethod]
        public async Task Create_PersistsBranchedParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().Branched = new BranchedParametersDto
            {
                X = 1.2e-11,
                Y = 300.0,
                A0 = 0.5,
                N = 1.0,
            };
            await CreateBaseFamilyAsync(dto);

            Family reloaded = await ReloadAsync(dto.Id);
            BranchedParameters? branched = reloaded.Reactions.Single().Branched;
            Assert.IsNotNull(branched);
            Assert.AreEqual(1.2e-11, branched!.X);
            Assert.AreEqual(300.0, branched.Y);
            Assert.AreEqual(0.5, branched.A0);
            Assert.AreEqual(1.0, branched.N);
        }

        [TestMethod]
        public async Task Update_ChangesBranchedParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().Branched = new BranchedParametersDto
            {
                X = 1.0,
                Y = 0.0,
                A0 = 0.0,
                N = 1.0,
            };
            await CreateBaseFamilyAsync(dto);

            dto.Reactions.Single().Branched = new BranchedParametersDto
            {
                X = 5.0,
                Y = 2.0,
                A0 = 0.8,
                N = 2.0,
            };
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            BranchedParameters? branched = reloaded.Reactions.Single().Branched;
            Assert.IsNotNull(branched);
            Assert.AreEqual(5.0, branched!.X);
            Assert.AreEqual(2.0, branched.Y);
            Assert.AreEqual(0.8, branched.A0);
            Assert.AreEqual(2.0, branched.N);
        }

        [TestMethod]
        public async Task Create_PersistsTaylorSeriesParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().TaylorSeries = new TaylorSeriesParametersDto
            {
                A = 1.0,
                B = 0.0,
                Ea = 0.0,
                D = 300.0,
                E = 0.0,
                TaylorCoefficients = new List<double> { 1.0, 2.0, 3.0 },
            };
            await CreateBaseFamilyAsync(dto);

            Family reloaded = await ReloadAsync(dto.Id);
            TaylorSeriesParameters? taylorSeries = reloaded.Reactions.Single().TaylorSeries;
            Assert.IsNotNull(taylorSeries);
            Assert.AreEqual(1.0, taylorSeries!.A);
            Assert.AreEqual(0.0, taylorSeries.B);
            Assert.AreEqual(0.0, taylorSeries.Ea);
            Assert.AreEqual(300.0, taylorSeries.D);
            Assert.AreEqual(0.0, taylorSeries.E);
            CollectionAssert.AreEqual(new List<double> { 1.0, 2.0, 3.0 }, taylorSeries.TaylorCoefficients);
        }

        [TestMethod]
        public async Task Update_ChangesTaylorSeriesParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().TaylorSeries = new TaylorSeriesParametersDto
            {
                A = 1.0,
                B = 0.0,
                Ea = 0.0,
                D = 300.0,
                E = 0.0,
                TaylorCoefficients = new List<double> { 1.0 },
            };
            await CreateBaseFamilyAsync(dto);

            dto.Reactions.Single().TaylorSeries = new TaylorSeriesParametersDto
            {
                A = 5.0,
                B = 2.0,
                C = 150.0,
                D = 250.0,
                E = 1.5,
                TaylorCoefficients = new List<double> { 4.0, 5.0, 6.0, 7.0 },
            };
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            TaylorSeriesParameters? taylorSeries = reloaded.Reactions.Single().TaylorSeries;
            Assert.IsNotNull(taylorSeries);
            Assert.AreEqual(5.0, taylorSeries!.A);
            Assert.AreEqual(2.0, taylorSeries.B);
            Assert.AreEqual(150.0, taylorSeries.C);
            Assert.IsNull(taylorSeries.Ea);
            Assert.AreEqual(250.0, taylorSeries.D);
            Assert.AreEqual(1.5, taylorSeries.E);
            CollectionAssert.AreEqual(new List<double> { 4.0, 5.0, 6.0, 7.0 }, taylorSeries.TaylorCoefficients);
        }

        [TestMethod]
        public async Task Create_PersistsSurfaceParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().Surface = new SurfaceParametersDto
            {
                ReactionProbability = 1.0,
            };
            await CreateBaseFamilyAsync(dto);

            Family reloaded = await ReloadAsync(dto.Id);
            SurfaceParameters? surface = reloaded.Reactions.Single().Surface;
            Assert.IsNotNull(surface);
            Assert.AreEqual(1.0, surface!.ReactionProbability);
        }

        [TestMethod]
        public async Task Update_ChangesSurfaceParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().Surface = new SurfaceParametersDto
            {
                ReactionProbability = 1.0,
            };
            await CreateBaseFamilyAsync(dto);

            dto.Reactions.Single().Surface = new SurfaceParametersDto
            {
                ReactionProbability = 0.5,
            };
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            SurfaceParameters? surface = reloaded.Reactions.Single().Surface;
            Assert.IsNotNull(surface);
            Assert.AreEqual(0.5, surface!.ReactionProbability);
        }

        [TestMethod]
        public async Task Create_PersistsEmissionParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().Emission = new EmissionParametersDto
            {
                ScalingFactor = 1.0,
            };
            await CreateBaseFamilyAsync(dto);

            Family reloaded = await ReloadAsync(dto.Id);
            EmissionParameters? emission = reloaded.Reactions.Single().Emission;
            Assert.IsNotNull(emission);
            Assert.AreEqual(1.0, emission!.ScalingFactor);
        }

        [TestMethod]
        public async Task Update_ChangesEmissionParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().Emission = new EmissionParametersDto
            {
                ScalingFactor = 1.0,
            };
            await CreateBaseFamilyAsync(dto);

            dto.Reactions.Single().Emission = new EmissionParametersDto
            {
                ScalingFactor = 2.5,
            };
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            EmissionParameters? emission = reloaded.Reactions.Single().Emission;
            Assert.IsNotNull(emission);
            Assert.AreEqual(2.5, emission!.ScalingFactor);
        }

        [TestMethod]
        public async Task Create_PersistsFirstOrderLossParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().FirstOrderLoss = new FirstOrderLossParametersDto
            {
                ScalingFactor = 1.0,
            };
            await CreateBaseFamilyAsync(dto);

            Family reloaded = await ReloadAsync(dto.Id);
            FirstOrderLossParameters? firstOrderLoss = reloaded.Reactions.Single().FirstOrderLoss;
            Assert.IsNotNull(firstOrderLoss);
            Assert.AreEqual(1.0, firstOrderLoss!.ScalingFactor);
        }

        [TestMethod]
        public async Task Update_ChangesFirstOrderLossParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().FirstOrderLoss = new FirstOrderLossParametersDto
            {
                ScalingFactor = 1.0,
            };
            await CreateBaseFamilyAsync(dto);

            dto.Reactions.Single().FirstOrderLoss = new FirstOrderLossParametersDto
            {
                ScalingFactor = 3.0,
            };
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            FirstOrderLossParameters? firstOrderLoss = reloaded.Reactions.Single().FirstOrderLoss;
            Assert.IsNotNull(firstOrderLoss);
            Assert.AreEqual(3.0, firstOrderLoss!.ScalingFactor);
        }

        [TestMethod]
        public async Task Create_PersistsPhotolysisParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().Photolysis = new PhotolysisParametersDto
            {
                ScalingFactor = 1.0,
            };
            await CreateBaseFamilyAsync(dto);

            Family reloaded = await ReloadAsync(dto.Id);
            PhotolysisParameters? photolysis = reloaded.Reactions.Single().Photolysis;
            Assert.IsNotNull(photolysis);
            Assert.AreEqual(1.0, photolysis!.ScalingFactor);
        }

        [TestMethod]
        public async Task Update_ChangesPhotolysisParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().Photolysis = new PhotolysisParametersDto
            {
                ScalingFactor = 1.0,
            };
            await CreateBaseFamilyAsync(dto);

            dto.Reactions.Single().Photolysis = new PhotolysisParametersDto
            {
                ScalingFactor = 4.0,
            };
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            PhotolysisParameters? photolysis = reloaded.Reactions.Single().Photolysis;
            Assert.IsNotNull(photolysis);
            Assert.AreEqual(4.0, photolysis!.ScalingFactor);
        }

        [TestMethod]
        public async Task Create_PersistsUserDefinedParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().UserDefined = new UserDefinedParametersDto
            {
                ScalingFactor = 1.0,
            };
            await CreateBaseFamilyAsync(dto);

            Family reloaded = await ReloadAsync(dto.Id);
            UserDefinedParameters? userDefined = reloaded.Reactions.Single().UserDefined;
            Assert.IsNotNull(userDefined);
            Assert.AreEqual(1.0, userDefined!.ScalingFactor);
        }

        [TestMethod]
        public async Task Update_ChangesUserDefinedParameters()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Reactions.Single().UserDefined = new UserDefinedParametersDto
            {
                ScalingFactor = 1.0,
            };
            await CreateBaseFamilyAsync(dto);

            dto.Reactions.Single().UserDefined = new UserDefinedParametersDto
            {
                ScalingFactor = 5.0,
            };
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            UserDefinedParameters? userDefined = reloaded.Reactions.Single().UserDefined;
            Assert.IsNotNull(userDefined);
            Assert.AreEqual(5.0, userDefined!.ScalingFactor);
        }
    }
}
