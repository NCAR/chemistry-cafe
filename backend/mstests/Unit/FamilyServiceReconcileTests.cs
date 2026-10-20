using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;
using ChemistryCafeAPI.Models.Mappers;
using ChemistryCafeAPI.Services;
using Microsoft.EntityFrameworkCore;
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
        private static User _owner = null!;
        private static Guid _ownerId;
        private static string _nameIdentifier = null!;
        private static User _verifier = null!;
        private static string _verifierIdentifier = null!;
        private static User _admin = null!;
        private static string _adminIdentifier = null!;
        private static User _otherUser = null!;
        private static string _otherIdentifier = null!;
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

            User verifier = userService.SignInGoogle("reconcile-verifier-id", "reconcile-verifier@fake-website.com").Result;
            verifier.Role = Role.Verifier;
            _verifier = verifier;
            _verifierIdentifier = verifier.Id.ToString();

            User admin = userService.SignInGoogle("reconcile-admin-id", "reconcile-admin@fake-website.com").Result;
            admin.Role = Role.Admin;
            _admin = admin;
            _adminIdentifier = admin.Id.ToString();

            User otherUser = userService.SignInGoogle("reconcile-other-id", "reconcile-other@fake-website.com").Result;
            otherUser.Role = Role.None;
            _otherUser = otherUser;
            _otherIdentifier = otherUser.Id.ToString();

            ctx.SaveChanges();
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

        private static async Task<FamilyDto> CreateBaseFamilyAsync(FamilyDto dto, User? creator = null)
        {
            User user = creator ?? _owner;
            using ChemistryDbContext ctx = DBConnection.NewContext();
            ctx.Attach(user);
            var (result, _) = await NewService(ctx).CreateFamilyAsync(dto, user);
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
            Assert.AreEqual(1, reloadedPhase.PhaseSpecies.Count);
            Assert.AreEqual(keptSpeciesId, reloadedPhase.PhaseSpecies.Single().SpeciesId);
        }

        [TestMethod]
        public async Task Update_ChangesPhaseDiffusionCoefficients()
        {
            FamilyDto dto = BuildBaseFamily();
            PhaseDto phase = dto.Phases.Single();
            Guid a = dto.Species.Single(s => s.Name == "A").Id;
            Guid b = dto.Species.Single(s => s.Name == "B").Id;
            phase.DiffusionCoefficients = new Dictionary<Guid, double> { [a] = 1e-5 };
            await CreateBaseFamilyAsync(dto);

            // Change the value of A and give B a value.
            phase.DiffusionCoefficients = new Dictionary<Guid, double> { [a] = 2e-5, [b] = 3e-5 };
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Phase reloadedPhase = (await ReloadAsync(dto.Id)).Phases.Single(p => p.Id == phase.Id);
            Assert.AreEqual(2e-5, reloadedPhase.PhaseSpecies.Single(ps => ps.SpeciesId == a).DiffusionCoefficient);
            Assert.AreEqual(3e-5, reloadedPhase.PhaseSpecies.Single(ps => ps.SpeciesId == b).DiffusionCoefficient);

            // Clear the value of A. A stays in the phase.
            phase.DiffusionCoefficients.Remove(a);
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            reloadedPhase = (await ReloadAsync(dto.Id)).Phases.Single(p => p.Id == phase.Id);
            Assert.AreEqual(2, reloadedPhase.PhaseSpecies.Count);
            Assert.IsNull(reloadedPhase.PhaseSpecies.Single(ps => ps.SpeciesId == a).DiffusionCoefficient);
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
            Assert.AreEqual(reloaded.Id, added.FamilyId, "mechanism does not point to the family it belongs to");
            Assert.AreEqual(reloaded.CurrentVersionId, added.FamilyVersionId, "mechanism does not point to the family version it is using");
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

        [TestMethod]
        public async Task Update_Mechanism_MoveToPendingValidation_SetsReadOnly_AndTiesToCurrentVersion()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());
            MechanismDto mech = dto.Mechanisms.Single();
            Assert.AreEqual(ValidationStatus.NoValidationRequested, mech.ValidationStatus);

            mech.ValidationStatus = ValidationStatus.PendingValidation;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            Mechanism reloadedMech = reloaded.Mechanisms.Single();
            Assert.AreEqual(ValidationStatus.PendingValidation, reloadedMech.ValidationStatus);
            Assert.IsTrue(reloadedMech.IsReadOnly);
            Assert.AreNotEqual(reloaded.CurrentVersionId, reloadedMech.FamilyVersionId);
            Assert.IsTrue(reloaded.Versions.Any(v => v.Id == reloadedMech.FamilyVersionId));
        }

        [TestMethod]
        public async Task Update_Mechanism_MoveFromPendingValidationToValidated_AsVerifier_Succeeds()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.PendingValidation;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            // Verifier updates validation status to Validated
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.Validated;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _verifierIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            Mechanism reloadedMech = reloaded.Mechanisms.Single();
            Assert.AreEqual(ValidationStatus.Validated, reloadedMech.ValidationStatus);
            Assert.IsTrue(reloadedMech.IsReadOnly);
            Assert.AreEqual(_verifier.Id, reloadedMech.ValidatedById);
            Assert.IsNotNull(reloadedMech.ValidatedBy);
            Assert.AreEqual(_verifier.Username, reloadedMech.ToDto().ValidatedBy);
        }

        [TestMethod]
        public async Task Update_Mechanism_MoveFromPendingValidationToValidated_AsAdmin_Succeeds()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.PendingValidation;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            // Admin updates validation status to Validated
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.Validated;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _adminIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            Mechanism reloadedMech = reloaded.Mechanisms.Single();
            Assert.AreEqual(ValidationStatus.Validated, reloadedMech.ValidationStatus);
            Assert.IsTrue(reloadedMech.IsReadOnly);
            Assert.AreEqual(_admin.Id, reloadedMech.ValidatedById);
            Assert.IsNotNull(reloadedMech.ValidatedBy);
            Assert.AreEqual(_admin.Username, reloadedMech.ToDto().ValidatedBy);
        }

        [TestMethod]
        public async Task Update_Mechanism_MoveToValidated_AsRegularUser_ReturnsNoAccess()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.PendingValidation;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            // Regular user (owner with Role.None) attempts to validate
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.Validated;
            Assert.AreEqual(QueryResult.NoAccess, await UpdateAsync(dto, _nameIdentifier));

            Family reloaded = await ReloadAsync(dto.Id);
            Mechanism reloadedMech = reloaded.Mechanisms.Single();
            Assert.AreEqual(ValidationStatus.PendingValidation, reloadedMech.ValidationStatus);
        }

        [TestMethod]
        public async Task Update_Mechanism_ReadOnly_CannotModifyContent()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.PendingValidation;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            // Attempt to modify name of read-only mechanism
            dto.Mechanisms.Single().Name = "Modified Name";
            Assert.AreEqual(QueryResult.ValidationError, await UpdateAsync(dto, _nameIdentifier));

            // Attempt to add a species to read-only mechanism
            dto.Mechanisms.Single().Name = "M1"; // restore name
            Guid s2 = dto.Species.Single(s => s.Name == "B").Id;
            dto.Mechanisms.Single().SpeciesIds.Add(s2);
            Assert.AreEqual(QueryResult.ValidationError, await UpdateAsync(dto, _nameIdentifier));
        }

        [TestMethod]
        public async Task Update_Mechanism_ReadOnly_CannotBeDeleted()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.PendingValidation;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            // Attempt to delete read-only mechanism
            dto.Mechanisms.Clear();
            Assert.AreEqual(QueryResult.ValidationError, await UpdateAsync(dto, _nameIdentifier));
        }

        [TestMethod]
        public async Task Update_Mechanism_CannotRevertFromPendingOrValidatedToNoValidationRequested()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.PendingValidation;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            // Attempt to revert from PendingValidation to NoValidationRequested
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.NoValidationRequested;
            Assert.AreEqual(QueryResult.ValidationError, await UpdateAsync(dto, _nameIdentifier));

            // Make it Validated via Verifier
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.Validated;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _verifierIdentifier));

            // Attempt to revert from Validated to NoValidationRequested
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.NoValidationRequested;
            Assert.AreEqual(QueryResult.ValidationError, await UpdateAsync(dto, _verifierIdentifier));
        }

        [TestMethod]
        public async Task Update_Mechanism_CannotRevertFromValidatedToPendingValidation()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.PendingValidation;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.Validated;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _verifierIdentifier));

            // Attempt to revert from Validated to PendingValidation
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.PendingValidation;
            Assert.AreEqual(QueryResult.ValidationError, await UpdateAsync(dto, _verifierIdentifier));
        }

        [TestMethod]
        public async Task Update_Family_NonOwnerVerifier_CannotModifyFamilyContent()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.PendingValidation;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            // Verifier attempts to change Family Name
            dto.Name = "Verifier Changed Name";
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.Validated;
            Assert.AreEqual(QueryResult.NoAccess, await UpdateAsync(dto, _verifierIdentifier));

            // Restore Family Name, but Verifier attempts to add a new species
            dto.Name = "ReconcileFamily";
            dto.Species.Add(new SpeciesDto { Id = Guid.NewGuid(), Name = "D" });
            Assert.AreEqual(QueryResult.NoAccess, await UpdateAsync(dto, _verifierIdentifier));
        }

        [TestMethod]
        public async Task Create_Mechanism_AsRegularUser_CannotCreateDirectlyValidated()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.Validated;

            using ChemistryDbContext ctx = DBConnection.NewContext();
            ctx.Attach(_owner);
            var (result, _) = await NewService(ctx).CreateFamilyAsync(dto, _owner);
            Assert.AreEqual(QueryResult.NoAccess, result);
        }

        [TestMethod]
        public async Task Create_Mechanism_AsVerifier_CanCreateDirectlyValidated()
        {
            FamilyDto dto = BuildBaseFamily();
            dto.OwnerId = _verifier.Id;
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.Validated;

            FamilyDto created = await CreateBaseFamilyAsync(dto, _verifier);
            Family reloaded = await ReloadAsync(created.Id);
            Mechanism reloadedMech = reloaded.Mechanisms.Single();
            Assert.AreEqual(ValidationStatus.Validated, reloadedMech.ValidationStatus);
            Assert.IsTrue(reloadedMech.IsReadOnly);
        }

        [TestMethod]
        public async Task Update_Family_ChangesInCurrentFamily_ReadOnlyMechanismDoesNotChange()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());
            Guid m1Id = dto.Mechanisms.Single().Id;
            Guid s1Id = dto.Species.Single(s => s.Name == "A").Id;
            Guid r1Id = dto.Reactions.Single().Id;
            Guid p1Id = dto.Phases.Single().Id;

            // Make M1 read-only via PendingValidation
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.PendingValidation;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            // Reload active family after locking M1 to get the new branched version
            Family lockedFamily = await ReloadAsync(dto.Id);
            dto = lockedFamily.ToDto();
            Guid currentS1Id = dto.Species.Single(s => s.Name == "A").Id;
            Guid currentP1Id = dto.Phases.Single().Id;

            // Now make changes in the current family:
            Guid s4Id = Guid.NewGuid();
            dto.Species.Add(new SpeciesDto { Id = s4Id, Name = "D", MolecularWeight = 28.0 });

            // Delete unreferenced species "C"
            dto.Species.Remove(dto.Species.Single(s => s.Name == "C"));

            Guid r2Id = Guid.NewGuid();
            dto.Reactions.Add(new ReactionDto
            {
                Id = r2Id,
                Name = "R2",
                ReactionType = "ARRHENIUS",
                Reactants = new List<ReactantDto> { new ReactantDto { SpeciesId = s4Id, Coefficient = 1 } },
                Products = new List<ProductDto> { new ProductDto { SpeciesId = currentS1Id, Coefficient = 1 } },
            });
            // 4. Add new editable mechanism "M2"
            Guid m2Id = Guid.NewGuid();
            dto.Mechanisms.Add(new MechanismDto
            {
                Id = m2Id,
                Name = "M2",
                ValidationStatus = ValidationStatus.NoValidationRequested,
                SpeciesIds = new List<Guid> { s4Id },
                ReactionIds = new List<Guid> { r2Id },
                PhaseIds = new List<Guid> { currentP1Id },
            });

            // Update family with these changes
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            // Reload and verify
            Family reloaded = await ReloadAsync(dto.Id);

            // Current family received the changes
            Assert.AreEqual(3, reloaded.Species.Count);
            Assert.IsTrue(reloaded.Species.Any(s => s.Id == s4Id && s.Name == "D"));
            Assert.IsFalse(reloaded.Species.Any(s => s.Name == "C"));
            Assert.AreEqual(2, reloaded.Reactions.Count);
            Assert.IsTrue(reloaded.Reactions.Any(r => r.Id == r2Id));
            Assert.AreEqual(2, reloaded.Mechanisms.Count);

            // Read-only mechanism M1 did NOT change
            Mechanism m1 = reloaded.Mechanisms.Single(m => m.Id == m1Id);
            Assert.AreEqual(ValidationStatus.PendingValidation, m1.ValidationStatus);
            Assert.IsTrue(m1.IsReadOnly);
            Assert.AreEqual("M1", m1.Name);

            // Existing species entry in M1 was NOT modified
            Assert.AreEqual(1, m1.Species.Count);
            Species m1Species = m1.Species.Single();
            Assert.AreEqual(s1Id, m1Species.Id);
            Assert.AreEqual("A", m1Species.Name);

            // Existing reaction in M1 was NOT modified
            Assert.AreEqual(1, m1.Reactions.Count);
            Assert.AreEqual(r1Id, m1.Reactions.Single().Id);

            // Existing phase in M1 was NOT modified
            Assert.AreEqual(1, m1.Phases.Count);
            Assert.AreEqual(p1Id, m1.Phases.Single().Id);
        }

        [TestMethod]
        public async Task Update_Family_ModifySpeciesInFamilyUsedByReadOnlyMechanism_IsAllowed()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.PendingValidation;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            // Reload active family after locking M1
            Family lockedFamily = await ReloadAsync(dto.Id);
            FamilyDto updateDto = lockedFamily.ToDto();

            // Modify Species A (which is in the active family)
            SpeciesDto speciesA = updateDto.Species.Single(s => s.Name == "A");
            speciesA.Name = "A_modified";
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(updateDto, _nameIdentifier));

            // Verify:
            // Current family has A_modified
            Family reloaded = await ReloadAsync(dto.Id);
            Assert.AreEqual("A_modified", reloaded.Species.Single(s => s.Name == "A_modified").Name);

            // Read-only mechanism M1 still has "A" (unmodified!)
            Mechanism m1 = reloaded.Mechanisms.Single();
            Assert.AreEqual(ValidationStatus.PendingValidation, m1.ValidationStatus);
            Assert.AreEqual("A", m1.Species.Single().Name);
        }

        [TestMethod]
        public async Task Update_Family_ModifyReactionInFamilyUsedByReadOnlyMechanism_IsAllowed()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.PendingValidation;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            // Reload active family after locking M1
            Family lockedFamily = await ReloadAsync(dto.Id);
            FamilyDto updateDto = lockedFamily.ToDto();

            // Modify Reaction R1 (which is in the active family)
            ReactionDto reactionR1 = updateDto.Reactions.Single();
            reactionR1.Name = "R1_renamed";
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(updateDto, _nameIdentifier));

            // Verify:
            // Current family has R1_renamed
            Family reloaded = await ReloadAsync(dto.Id);
            Assert.AreEqual("R1_renamed", reloaded.Reactions.Single(r => r.Name == "R1_renamed").Name);

            // Read-only mechanism M1 still has "R1" (unmodified!)
            Mechanism m1 = reloaded.Mechanisms.Single();
            Assert.AreEqual("R1", m1.Reactions.Single().Name);
        }

        [TestMethod]
        public async Task Update_Family_ModifyPhaseInFamilyUsedByReadOnlyMechanism_IsAllowed()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.PendingValidation;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            // Reload active family after locking M1
            Family lockedFamily = await ReloadAsync(dto.Id);
            FamilyDto updateDto = lockedFamily.ToDto();

            // Modify Phase Gas (which is in the active family)
            PhaseDto phase = updateDto.Phases.Single();
            phase.Name = "Liquid";
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(updateDto, _nameIdentifier));

            // Verify:
            // Current family has Liquid
            Family reloaded = await ReloadAsync(dto.Id);
            Assert.AreEqual("Liquid", reloaded.Phases.Single(p => p.Name == "Liquid").Name);

            // Read-only mechanism M1 still has "gas" (unmodified)
            Mechanism m1 = reloaded.Mechanisms.Single();
            Assert.AreEqual("gas", m1.Phases.Single().Name);
        }

        [TestMethod]
        public async Task Update_Family_DeleteSpeciesInReadOnlyMechanism_ReturnsValidationError()
        {
            FamilyDto dto = await CreateBaseFamilyAsync(BuildBaseFamily());
            dto.Mechanisms.Single().ValidationStatus = ValidationStatus.PendingValidation;
            Assert.AreEqual(QueryResult.Success, await UpdateAsync(dto, _nameIdentifier));

            // Attempt to delete Species A (which is used by M1)
            dto.Species.Remove(dto.Species.Single(s => s.Name == "A"));
            Assert.AreEqual(QueryResult.ValidationError, await UpdateAsync(dto, _nameIdentifier));
        }

        [TestMethod]
        public void BranchCurrentFamilyVersion_CreatesIndependentDeepCopy()
        {
            Family family = new Family
            {
                Id = Guid.NewGuid(),
                Name = "TestFamily"
            };
            FamilyVersion v1 = new FamilyVersion {
                Id = Guid.NewGuid(),
                Family = family,
                FamilyId = family.Id,
            };
            family.CurrentVersion = v1;
            family.Versions.Add(v1);
            Species s1 = new Species { Id = Guid.NewGuid(), Name = "O3", FamilyVersionId = v1.Id };
            Phase p1 = new Phase { Id = Guid.NewGuid(), Name = "gas", FamilyVersionId = v1.Id, Species = new List<Species> { s1 } };
            Reaction r1 = new Reaction
            {
                Id = Guid.NewGuid(),
                Name = "R1",
                ReactionType = "ARRHENIUS",
                FamilyVersionId = v1.Id,
                Reactants = new List<Reactant> { new Reactant { SpeciesId = s1.Id, Coefficient = 1 } }
            };
            Mechanism m_active = new Mechanism
            {
                Id = Guid.NewGuid(),
                Name = "ActiveMech",
                ValidationStatus = ValidationStatus.NoValidationRequested,
                FamilyVersionId = v1.Id,
                Species = new List<Species> { s1 },
                Reactions = new List<Reaction> { r1 },
                Phases = new List<Phase> { p1 }
            };
            Mechanism m_locked = new Mechanism
            {
                Id = Guid.NewGuid(),
                Name = "LockedMech",
                ValidationStatus = ValidationStatus.PendingValidation,
                FamilyVersionId = v1.Id,
                Species = new List<Species> { s1 },
                Reactions = new List<Reaction> { r1 },
                Phases = new List<Phase> { p1 }
            };
            v1.Species.Add(s1);
            v1.Phases.Add(p1);
            v1.Reactions.Add(r1);
            family.Mechanisms.Add(m_active);
            family.Mechanisms.Add(m_locked);

            FamilyVersion v2 = FamilyService.BranchCurrentFamilyVersion(family);

            Assert.AreNotEqual(v1.Id, v2.Id);
            Assert.AreEqual(v2.Id, family.CurrentVersionId);
            Assert.AreEqual(2, family.Versions.Count);

            // Verify v2 entities have new IDs
            Species v2Species = v2.Species.Single();
            Assert.AreNotEqual(s1.Id, v2Species.Id);
            Assert.AreEqual("O3", v2Species.Name);
            Assert.AreEqual(v2.Id, v2Species.FamilyVersionId);

            Phase v2Phase = v2.Phases.Single();
            Assert.AreNotEqual(p1.Id, v2Phase.Id);
            Assert.AreEqual(v2Species.Id, v2Phase.Species.Single().Id);

            Reaction v2Reaction = v2.Reactions.Single();
            Assert.AreNotEqual(r1.Id, v2Reaction.Id);
            Assert.AreEqual(v2Species.Id, v2Reaction.Reactants.Single().SpeciesId);

            // Active mechanism moved to v2
            Assert.AreEqual(v2.Id, m_active.FamilyVersionId);
            Assert.AreEqual(v2Species.Id, m_active.Species.Single().Id);

            // Locked mechanism remained on v1
            Assert.AreEqual(v1.Id, m_locked.FamilyVersionId);
            Assert.AreEqual(s1.Id, m_locked.Species.Single().Id);
        }

        [TestMethod]
        public void DbInitializer_Seed_RunsSuccessfullyOnEmptyContext()
        {
            var options = new Microsoft.EntityFrameworkCore.DbContextOptionsBuilder<ChemistryDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            using var ctx = new ChemistryDbContext(options);
            ChemistryCafeAPI.SeedData.DbInitializer.Seed(ctx);

            Assert.IsTrue(ctx.Families.Any());
            var family = Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.Include(ctx.Families, f => f.CurrentVersion).First();
            Assert.IsNotNull(family.CurrentVersion);
            Assert.AreEqual(family.CurrentVersion.Id, family.CurrentVersionId);
        }

        [TestMethod]
        public async Task Update_SeededFamily_CanUpdateSpecies()
        {
            var options = new Microsoft.EntityFrameworkCore.DbContextOptionsBuilder<ChemistryDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            using (var seedCtx = new ChemistryDbContext(options))
            {
                ChemistryCafeAPI.SeedData.DbInitializer.Seed(seedCtx);
            }

            using var ctx = new ChemistryDbContext(options);
            var family = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstAsync(ctx.Families);
            var service = NewService(ctx);
            var familyFull = await service.GetFamilyAsync(family.Id);
            Assert.IsNotNull(familyFull);
            var dto = familyFull.ToDto();
            dto.Species.First().Description = "Updated description";

            var result = await service.UpdateFamilyAsync(dto.Id, dto, familyFull.Owner.Id.ToString());
            Assert.AreEqual(QueryResult.Success, result);
        }

        [TestMethod]
        public async Task Update_FamilyWithNullCurrentVersionId_RecoversVersionAndSucceeds()
        {
            var options = new Microsoft.EntityFrameworkCore.DbContextOptionsBuilder<ChemistryDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            Guid familyId;
            Guid ownerId;
            using (var seedCtx = new ChemistryDbContext(options))
            {
                ChemistryCafeAPI.SeedData.DbInitializer.Seed(seedCtx);
                var f = seedCtx.Families.First();
                familyId = f.Id;
                ownerId = f.Owner.Id;
                f.CurrentVersion = null;
                f.CurrentVersionId = null;
                seedCtx.SaveChanges();
            }

            using var ctx = new ChemistryDbContext(options);
            var service = NewService(ctx);
            var familyFull = await service.GetFamilyAsync(familyId);
            Assert.IsNotNull(familyFull);
            Assert.IsNotNull(familyFull.CurrentVersion);
            var dto = familyFull.ToDto();
            dto.Species.First().Description = "Updated after null CurrentVersionId recovery";

            var result = await service.UpdateFamilyAsync(dto.Id, dto, ownerId.ToString());
            Assert.AreEqual(QueryResult.Success, result);
        }

        [TestMethod]
        public void MechanismMapper_ToDto_And_ToEntity_PreservesValidatedBy()
        {
            Guid validatedById = Guid.NewGuid();
            var user = new User { Id = validatedById, FirstName = "Jane", LastName = "Smith", Username = "jsmith" };
            var mechanism = new Mechanism
            {
                Id = Guid.NewGuid(),
                FamilyId = Guid.NewGuid(),
                FamilyVersionId = Guid.NewGuid(),
                Name = "Mechanism A",
                ValidationStatus = ValidationStatus.Validated,
                ValidatedById = validatedById,
                ValidatedBy = user
            };

            MechanismDto dto = mechanism.ToDto();
            Assert.AreEqual(validatedById, dto.ValidatedById);
            Assert.AreEqual("jsmith", dto.ValidatedBy);

            Mechanism roundtripEntity = dto.ToEntity();
            Assert.AreEqual(dto.Id, roundtripEntity.Id);
            Assert.AreEqual(dto.ValidatedById, roundtripEntity.ValidatedById);
        }
    }
}
