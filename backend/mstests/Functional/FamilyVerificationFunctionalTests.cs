using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace ChemistryCafeAPI.Tests.Functional
{
    [TestClass]
    public class FamilyVerificationFunctionalTests : BaseFunctionalTests
    {
        private async Task<(Family family, Mechanism mechanism, Species species)> CreatePublicFamilyWithMechanismAsync(User owner)
        {
            var speciesId = Guid.NewGuid();
            var reactionId = Guid.NewGuid();
            var phaseId = Guid.NewGuid();
            var mechanismId = Guid.NewGuid();
            var familyId = Guid.NewGuid();

            var familyDto = new FamilyDto
            {
                Id = familyId,
                Name = "Atmospheric Chemistry",
                Description = "Tropospheric ozone and NOx",
                IsPublic = true,
                Species = new List<SpeciesDto>
                {
                    new() { Id = speciesId, Name = "O3", MolecularWeight = 48.0 },
                    new() { Id = Guid.NewGuid(), Name = "NO", MolecularWeight = 30.0 },
                },
                Phases = new List<PhaseDto>
                {
                    new() { Id = phaseId, Name = "Gas", SpeciesIds = new List<Guid> { speciesId } },
                },
                Reactions = new List<ReactionDto>
                {
                    new()
                    {
                        Id = reactionId,
                        Name = "O3 Photolysis",
                        ReactionType = "PHOTOLYSIS",
                        Reactants = new List<ReactantDto> { new() { SpeciesId = speciesId, Coefficient = 1.0 } },
                        Photolysis = new PhotolysisParametersDto { ScalingFactor = 1.0 },
                    },
                },
                Mechanisms = new List<MechanismDto>
                {
                    new()
                    {
                        Id = mechanismId,
                        FamilyId = familyId,
                        Name = "Standard Ozone Cycle",
                        SpeciesIds = new List<Guid> { speciesId },
                        ReactionIds = new List<Guid> { reactionId },
                        PhaseIds = new List<Guid> { phaseId },
                    },
                },
            };

            var ownerClient = CreateClient(true, owner);
            var response = await ownerClient.PostAsJsonAsync("/api/families", familyDto);
            Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);

            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ChemistryDbContext>();
            var createdFamily = await context.Families.FindAsync(familyId);
            var createdMech = await context.Mechanisms.FindAsync(mechanismId);
            var createdSpecies = await context.Species.FindAsync(speciesId);

            return (createdFamily!, createdMech!, createdSpecies!);
        }

        [TestMethod]
        public async Task VerifyMechanism_NonVerifier_ReturnsForbidden()
        {
            var owner = await CreateUserAsync(Role.None);
            var stranger = await CreateUserAsync(Role.None);
            var (family, mechanism, _) = await CreatePublicFamilyWithMechanismAsync(owner);

            var client = CreateClient(true, stranger);
            var response = await client.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{mechanism.Id}/verify",
                new VerifyMechanismRequest { Name = "Ozone-V1", Note = "Initial verification" });

            Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [TestMethod]
        public async Task VerifyMechanism_PrivateFamily_ReturnsBadRequest()
        {
            var owner = await CreateUserAsync(Role.None);
            var verifier = await CreateUserAsync(Role.Verifier);
            var (family, mechanism, _) = await CreatePublicFamilyWithMechanismAsync(owner);

            // Make family private
            using (var scope = Factory.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ChemistryDbContext>();
                var fam = await context.Families.FindAsync(family.Id);
                fam!.IsPublic = false;
                await context.SaveChangesAsync();
            }

            var client = CreateClient(true, verifier);
            var response = await client.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{mechanism.Id}/verify",
                new VerifyMechanismRequest { Name = "Ozone-V1" });

            Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [TestMethod]
        public async Task VerifyMechanism_Success_CreatesFrozenSnapshot()
        {
            var owner = await CreateUserAsync(Role.None);
            var verifier = await CreateUserAsync(Role.Verifier);
            var (family, mechanism, originalSpecies) = await CreatePublicFamilyWithMechanismAsync(owner);

            var client = CreateClient(true, verifier);
            var response = await client.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{mechanism.Id}/verify",
                new VerifyMechanismRequest { Name = "Verified-Ozone-V1", Note = "Validated by atmospheric chemist" });

            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            var verifiedDto = await response.Content.ReadFromJsonAsync<VerifiedMechanismVersionDto>();
            Assert.IsNotNull(verifiedDto);
            Assert.AreEqual("Verified-Ozone-V1", verifiedDto.Name);
            Assert.AreEqual("Validated by atmospheric chemist", verifiedDto.Notes);
            Assert.AreEqual(verifier.Username, verifiedDto.VerifierUsername);
            Assert.IsFalse(verifiedDto.IsDeprecated);
            Assert.IsFalse(verifiedDto.IsArchived);

            // Verify in database that new version was created and objects copied with sourceObjectId
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ChemistryDbContext>();
            var verifiedMech = await context.Mechanisms
                .Include(m => m.Family)
                .Include(m => m.VerifiedVersions)
                .FirstOrDefaultAsync(m => m.Id == verifiedDto.MechanismId);
            Assert.IsNotNull(verifiedMech);
            Assert.AreNotEqual(mechanism.Id, verifiedMech.Id);
            Assert.AreEqual(mechanism.Id, verifiedMech.SourceObjectId);
            Assert.IsTrue(verifiedMech.IsVerified);
            Assert.IsTrue(verifiedMech.IsReadOnly);

            var verifiedVersionEntity = await context.VerifiedMechanismVersions.FindAsync(verifiedDto.Id);
            Assert.IsNotNull(verifiedVersionEntity);
            Assert.AreEqual(verifier.Id, verifiedVersionEntity.VerifierId);

            var clonedSpecies = await context.Species.FirstOrDefaultAsync(s => s.FamilyVersionId == verifiedDto.FamilyVersionId);
            Assert.IsNotNull(clonedSpecies);
            Assert.AreNotEqual(originalSpecies.Id, clonedSpecies.Id);
            Assert.AreEqual(originalSpecies.Id, clonedSpecies.SourceObjectId);
            // Custom properties (OtherProperties) should not be polluted with internal verifier data
            Assert.IsTrue(clonedSpecies.OtherProperties == null || !clonedSpecies.OtherProperties.ContainsKey("isFrozen"));

            // Verify that fetching the family shows the regular mechanism marked as verified, and hides frozen snapshot copy
            var famResp = await client.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");
            Assert.IsNotNull(famResp);
            Assert.AreEqual(1, famResp.Mechanisms.Count);
            Assert.AreEqual(mechanism.Id, famResp.Mechanisms[0].Id);
            Assert.IsTrue(famResp.Mechanisms[0].Verified);
            Assert.IsNotNull(famResp.Mechanisms[0].VerifiedDate);
            Assert.IsNotNull(famResp.Mechanisms[0].VerifiedBy);
            Assert.IsFalse(famResp.Mechanisms.Any(m => m.Id == verifiedDto.MechanismId));
            Assert.AreEqual(1, famResp.VerifiedVersions.Count);
            Assert.AreEqual(verifiedDto.Id, famResp.VerifiedVersions[0].Id);

            // When the mechanism is updated/modified, it is no longer marked verified
            await Task.Delay(10);
            famResp.Mechanisms[0].Description = "Updated description after verification";
            var ownerClient = CreateClient(true, owner);
            var updateResp = await ownerClient.PatchAsJsonAsync($"/api/families/{family.Id}", famResp);
            Assert.AreEqual(System.Net.HttpStatusCode.NoContent, updateResp.StatusCode);

            var updatedFamResp = await client.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");
            Assert.IsNotNull(updatedFamResp);
            Assert.AreEqual(1, updatedFamResp.Mechanisms.Count);
            Assert.IsFalse(updatedFamResp.Mechanisms[0].Verified);
            Assert.IsNull(updatedFamResp.Mechanisms[0].VerifiedDate);
        }

        [TestMethod]
        public async Task DeprecateAndUndeprecate_Success()
        {
            var owner = await CreateUserAsync(Role.None);
            var verifier = await CreateUserAsync(Role.Verifier);
            var (family, mechanism, _) = await CreatePublicFamilyWithMechanismAsync(owner);

            var client = CreateClient(true, verifier);
            var verifyResp = await client.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{mechanism.Id}/verify",
                new VerifyMechanismRequest { Name = "Verified-Ozone-V1" });
            var verifiedDto = await verifyResp.Content.ReadFromJsonAsync<VerifiedMechanismVersionDto>();

            // Deprecate
            var depResp = await client.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{verifiedDto!.MechanismId}/deprecate",
                new DeprecateMechanismRequest { Reason = "Replaced by updated rate constants" });
            Assert.AreEqual(HttpStatusCode.OK, depResp.StatusCode);
            var depDto = await depResp.Content.ReadFromJsonAsync<VerifiedMechanismVersionDto>();
            Assert.IsNotNull(depDto);
            Assert.IsTrue(depDto.IsDeprecated);
            Assert.AreEqual("Replaced by updated rate constants", depDto.DeprecationReason);

            // Undeprecate
            var undepResp = await client.DeleteAsync($"/api/families/{family.Id}/mechanisms/{verifiedDto.MechanismId}/deprecate");
            Assert.AreEqual(HttpStatusCode.OK, undepResp.StatusCode);
            var undepDto = await undepResp.Content.ReadFromJsonAsync<VerifiedMechanismVersionDto>();
            Assert.IsNotNull(undepDto);
            Assert.IsFalse(undepDto.IsDeprecated);
        }

        [TestMethod]
        public async Task Archive_Mechanism_HidesFromPublic_ShowsForVerifier()
        {
            var owner = await CreateUserAsync(Role.None);
            var verifier = await CreateUserAsync(Role.Verifier);
            var regularUser = await CreateUserAsync(Role.None);
            var (family, mechanism, _) = await CreatePublicFamilyWithMechanismAsync(owner);

            var verifierClient = CreateClient(true, verifier);
            var verifyResp = await verifierClient.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{mechanism.Id}/verify",
                new VerifyMechanismRequest { Name = "Verified-Ozone-V1" });
            var verifiedDto = await verifyResp.Content.ReadFromJsonAsync<VerifiedMechanismVersionDto>();

            // Archive it
            var archResp = await verifierClient.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{verifiedDto!.MechanismId}/archive",
                new ArchiveMechanismRequest { IsArchived = true });
            Assert.AreEqual(HttpStatusCode.OK, archResp.StatusCode);
            var archDto = await archResp.Content.ReadFromJsonAsync<VerifiedMechanismVersionDto>();
            Assert.IsNotNull(archDto);
            Assert.IsTrue(archDto.IsArchived);

            // Regular user fetching family does not see the archived verified version
            var userClient = CreateClient(true, regularUser);
            var famUserResp = await userClient.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");
            Assert.IsNotNull(famUserResp);
            Assert.IsFalse(famUserResp.VerifiedVersions.Any(v => v.Id == verifiedDto.Id));

            // Verifier does see it
            var famVerifierResp = await verifierClient.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");
            Assert.IsNotNull(famVerifierResp);
            Assert.IsTrue(famVerifierResp.VerifiedVersions.Any(v => v.Id == verifiedDto.Id));
        }

        [TestMethod]
        public async Task DeleteVerifiedMechanism_PermanentlyRemovesSnapshot()
        {
            var owner = await CreateUserAsync(Role.None);
            var verifier = await CreateUserAsync(Role.Verifier);
            var (family, mechanism, _) = await CreatePublicFamilyWithMechanismAsync(owner);

            var verifierClient = CreateClient(true, verifier);
            var verifyResp = await verifierClient.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{mechanism.Id}/verify",
                new VerifyMechanismRequest { Name = "Verified-Ozone-V1" });
            var verifiedDto = await verifyResp.Content.ReadFromJsonAsync<VerifiedMechanismVersionDto>();

            var delResp = await verifierClient.DeleteAsync($"/api/families/{family.Id}/mechanisms/{verifiedDto!.MechanismId}/verified");
            Assert.AreEqual(HttpStatusCode.NoContent, delResp.StatusCode);

            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ChemistryDbContext>();
            var deletedMech = await context.Mechanisms.FindAsync(verifiedDto.MechanismId);
            Assert.IsNull(deletedMech);
            var deletedVer = await context.VerifiedMechanismVersions.FindAsync(verifiedDto.Id);
            Assert.IsNull(deletedVer);
        }

        [TestMethod]
        public async Task DeleteFamily_WithVerifiedVersion_MovesToNCARArchive()
        {
            var owner = await CreateUserAsync(Role.None);
            var verifier = await CreateUserAsync(Role.Verifier);
            var (family, mechanism, _) = await CreatePublicFamilyWithMechanismAsync(owner);

            var verifierClient = CreateClient(true, verifier);
            var verifyResp = await verifierClient.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{mechanism.Id}/verify",
                new VerifyMechanismRequest { Name = "Verified-Ozone-V1" });
            var verifiedDto = await verifyResp.Content.ReadFromJsonAsync<VerifiedMechanismVersionDto>();

            // Owner deletes the family
            var ownerClient = CreateClient(true, owner);
            var delResp = await ownerClient.DeleteAsync($"/api/families/{family.Id}");
            Assert.AreEqual(HttpStatusCode.NoContent, delResp.StatusCode);

            // Verifier can view archived versions via GET /api/families/archived-versions
            var archiveResp = await verifierClient.GetAsync("/api/families/archived-versions");
            Assert.AreEqual(HttpStatusCode.OK, archiveResp.StatusCode);
            var archivedList = await archiveResp.Content.ReadFromJsonAsync<List<ArchivedVerifiedVersionDto>>();
            Assert.IsNotNull(archivedList);
            Assert.IsTrue(archivedList.Any(v => v.MechanismId == verifiedDto!.MechanismId && v.OriginalFamilyName == "Atmospheric Chemistry"));
        }

        [TestMethod]
        public async Task GetFamilyVersion_RetrievesIsolatedVersionSnapshot()
        {
            var owner = await CreateUserAsync(Role.None);
            var verifier = await CreateUserAsync(Role.Verifier);
            var (family, mechanism, originalSpecies) = await CreatePublicFamilyWithMechanismAsync(owner);

            var verifierClient = CreateClient(true, verifier);
            var verifyResp = await verifierClient.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{mechanism.Id}/verify",
                new VerifyMechanismRequest { Name = "Verified-Ozone-V1", Note = "Frozen snapshot" });
            var verifiedDto = await verifyResp.Content.ReadFromJsonAsync<VerifiedMechanismVersionDto>();

            // 1. Fetching default family returns CurrentVersion objects only
            var currentFam = await AnonymousClient.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");
            Assert.IsNotNull(currentFam);
            Assert.AreEqual(2, currentFam.Species.Count);
            Assert.IsTrue(currentFam.Species.Any(s => s.Id == originalSpecies.Id));

            // 2. Fetching specific family version returns the deep-copied verified family snapshot objects
            var versionFam = await AnonymousClient.GetFromJsonAsync<FamilyDto>(
                $"/api/families/{family.Id}/versions/{verifiedDto!.FamilyVersionId}");
            Assert.IsNotNull(versionFam);
            Assert.AreEqual(verifiedDto.FamilyVersionId, versionFam.CurrentVersionId);
            Assert.AreEqual(2, versionFam.Species.Count);
            Assert.IsTrue(versionFam.Species.Any(s => s.SourceObjectId == originalSpecies.Id));
            Assert.AreEqual("Verified-Ozone-V1", versionFam.Mechanisms[0].Name);

            // 3. Query param variant (?versionId=...) also returns the version snapshot
            var queryParamFam = await AnonymousClient.GetFromJsonAsync<FamilyDto>(
                $"/api/families/{family.Id}?versionId={verifiedDto.FamilyVersionId}");
            Assert.IsNotNull(queryParamFam);
            Assert.AreEqual(verifiedDto.FamilyVersionId, queryParamFam.CurrentVersionId);
            Assert.AreEqual(2, queryParamFam.Species.Count);
            Assert.IsTrue(queryParamFam.Species.Any(s => s.SourceObjectId == originalSpecies.Id));
        }

        [TestMethod]
        public async Task UpdateFamily_EditableMechanismUsingFrozenObject_Rejected()
        {
            var owner = await CreateUserAsync(Role.None);
            var verifier = await CreateUserAsync(Role.Verifier);
            var (family, mechanism, originalSpecies) = await CreatePublicFamilyWithMechanismAsync(owner);

            var verifierClient = CreateClient(true, verifier);
            var verifyResp = await verifierClient.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{mechanism.Id}/verify",
                new VerifyMechanismRequest { Name = "Verified-Ozone-V1" });
            var verifiedDto = await verifyResp.Content.ReadFromJsonAsync<VerifiedMechanismVersionDto>();

            // Owner loads the family
            var ownerClient = CreateClient(true, owner);
            var fam = await ownerClient.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");

            // Load the frozen species from the version
            var versionFam = await ownerClient.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}/versions/{verifiedDto!.FamilyVersionId}");
            var frozenSpecies = versionFam!.Species[0];

            // Try to make an editable mechanism reference the frozen species
            var editableMech = fam!.Mechanisms.First(m => m.Id == mechanism.Id);
            editableMech.SpeciesIds.Add(frozenSpecies.Id);

            var patchResp = await ownerClient.PatchAsJsonAsync($"/api/families/{family.Id}", fam);
            Assert.AreEqual(HttpStatusCode.BadRequest, patchResp.StatusCode);
        }

        private async Task<(Family family, Mechanism mech1, Mechanism mech2, Species species1, Species species2, Reaction reaction1, Reaction reaction2)> CreatePublicFamilyWithTwoMechanismsAsync(User owner)
        {
            var species1Id = Guid.NewGuid();
            var species2Id = Guid.NewGuid();
            var reaction1Id = Guid.NewGuid();
            var reaction2Id = Guid.NewGuid();
            var phaseId = Guid.NewGuid();
            var mech1Id = Guid.NewGuid();
            var mech2Id = Guid.NewGuid();
            var familyId = Guid.NewGuid();

            var familyDto = new FamilyDto
            {
                Id = familyId,
                Name = "Dual Mechanism Family",
                Description = "Two distinct mechanisms with different dependencies",
                IsPublic = true,
                Species = new List<SpeciesDto>
                {
                    new() { Id = species1Id, Name = "O3", MolecularWeight = 48.0 },
                    new() { Id = species2Id, Name = "NO", MolecularWeight = 30.0 },
                },
                Phases = new List<PhaseDto>
                {
                    new() { Id = phaseId, Name = "Gas", SpeciesIds = new List<Guid> { species1Id, species2Id } },
                },
                Reactions = new List<ReactionDto>
                {
                    new()
                    {
                        Id = reaction1Id,
                        Name = "O3 Photolysis",
                        ReactionType = "PHOTOLYSIS",
                        Reactants = new List<ReactantDto> { new() { SpeciesId = species1Id, Coefficient = 1.0 } },
                        Photolysis = new PhotolysisParametersDto { ScalingFactor = 1.0 },
                    },
                    new()
                    {
                        Id = reaction2Id,
                        Name = "NO Oxidation",
                        ReactionType = "PHOTOLYSIS",
                        Reactants = new List<ReactantDto> { new() { SpeciesId = species2Id, Coefficient = 1.0 } },
                        Photolysis = new PhotolysisParametersDto { ScalingFactor = 2.0 },
                    },
                },
                Mechanisms = new List<MechanismDto>
                {
                    new()
                    {
                        Id = mech1Id,
                        FamilyId = familyId,
                        Name = "Mechanism 1 (Ozone)",
                        SpeciesIds = new List<Guid> { species1Id },
                        ReactionIds = new List<Guid> { reaction1Id },
                        PhaseIds = new List<Guid> { phaseId },
                    },
                    new()
                    {
                        Id = mech2Id,
                        FamilyId = familyId,
                        Name = "Mechanism 2 (NOx)",
                        SpeciesIds = new List<Guid> { species2Id },
                        ReactionIds = new List<Guid> { reaction2Id },
                        PhaseIds = new List<Guid> { phaseId },
                    },
                },
            };

            var ownerClient = CreateClient(true, owner);
            var response = await ownerClient.PostAsJsonAsync("/api/families", familyDto);
            Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);

            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ChemistryDbContext>();
            var createdFamily = await context.Families.FindAsync(familyId);
            var createdMech1 = await context.Mechanisms.FindAsync(mech1Id);
            var createdMech2 = await context.Mechanisms.FindAsync(mech2Id);
            var createdSpecies1 = await context.Species.FindAsync(species1Id);
            var createdSpecies2 = await context.Species.FindAsync(species2Id);
            var createdReaction1 = await context.Reactions.FindAsync(reaction1Id);
            var createdReaction2 = await context.Reactions.FindAsync(reaction2Id);

            return (createdFamily!, createdMech1!, createdMech2!, createdSpecies1!, createdSpecies2!, createdReaction1!, createdReaction2!);
        }

        [TestMethod]
        public async Task ModifyOtherMechanism_DoesNotStripUntouchedMechanismOfVerifiedStatus()
        {
            var owner = await CreateUserAsync(Role.None);
            var verifier = await CreateUserAsync(Role.Verifier);
            var (family, mech1, mech2, _, _, _, _) = await CreatePublicFamilyWithTwoMechanismsAsync(owner);

            // Verifier verifies Mech 1
            var verifierClient = CreateClient(true, verifier);
            var verifyResp = await verifierClient.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{mech1.Id}/verify",
                new VerifyMechanismRequest { Name = "Verified-Mech1" });
            Assert.AreEqual(HttpStatusCode.OK, verifyResp.StatusCode);

            // Verify initial state: Mech 1 is verified, Mech 2 is not
            var initialFam = await verifierClient.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");
            Assert.IsNotNull(initialFam);
            var fetchedMech1 = initialFam.Mechanisms.First(m => m.Id == mech1.Id);
            var fetchedMech2 = initialFam.Mechanisms.First(m => m.Id == mech2.Id);
            Assert.IsTrue(fetchedMech1.Verified);
            Assert.IsNotNull(fetchedMech1.VerifiedDate);
            Assert.IsFalse(fetchedMech2.Verified);

            // Advance clock slightly
            await Task.Delay(20);

            // Owner modifies Mech 2 ONLY; Mech 1 is completely untouched
            var ownerClient = CreateClient(true, owner);
            fetchedMech2.Description = "Modified NOx Cycle Description";
            var patchResp = await ownerClient.PatchAsJsonAsync($"/api/families/{family.Id}", initialFam);
            Assert.AreEqual(HttpStatusCode.NoContent, patchResp.StatusCode);

            // Fetch family again
            var updatedFam = await verifierClient.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");
            Assert.IsNotNull(updatedFam);
            var postMech1 = updatedFam.Mechanisms.First(m => m.Id == mech1.Id);
            var postMech2 = updatedFam.Mechanisms.First(m => m.Id == mech2.Id);

            // Mech 1 MUST STILL BE VERIFIED because it was untouched!
            Assert.IsTrue(postMech1.Verified, "Untouched mechanism must retain Verified status when another mechanism is changed.");
            Assert.IsNotNull(postMech1.VerifiedDate);
            Assert.AreEqual(fetchedMech1.VerifiedDate, postMech1.VerifiedDate);

            // Mech 2 has the updated description and remains unverified
            Assert.AreEqual("Modified NOx Cycle Description", postMech2.Description);
            Assert.IsFalse(postMech2.Verified);
        }

        [TestMethod]
        public async Task ModifyDependencyUsedByVerifiedMechanism_StripsVerifiedStatus()
        {
            var owner = await CreateUserAsync(Role.None);
            var verifier = await CreateUserAsync(Role.Verifier);
            var (family, mech1, mech2, species1, species2, _, _) = await CreatePublicFamilyWithTwoMechanismsAsync(owner);

            // Verifier verifies Mech 1
            var verifierClient = CreateClient(true, verifier);
            var verifyResp = await verifierClient.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{mech1.Id}/verify",
                new VerifyMechanismRequest { Name = "Verified-Mech1" });
            Assert.AreEqual(HttpStatusCode.OK, verifyResp.StatusCode);

            var fam = await verifierClient.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");
            Assert.IsNotNull(fam);
            Assert.IsTrue(fam.Mechanisms.First(m => m.Id == mech1.Id).Verified);

            var ownerClient = CreateClient(true, owner);

            // Step 1: Modifying a species ONLY used by Mech 2 should NOT invalidate Mech 1
            await Task.Delay(20);
            var species2Dto = fam.Species.First(s => s.Id == species2.Id);
            species2Dto.MolecularWeight = 31.0;
            var patchResp1 = await ownerClient.PatchAsJsonAsync($"/api/families/{family.Id}", fam);
            Assert.AreEqual(HttpStatusCode.NoContent, patchResp1.StatusCode);

            var famAfterStep1 = await verifierClient.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");
            Assert.IsNotNull(famAfterStep1);
            Assert.IsTrue(famAfterStep1.Mechanisms.First(m => m.Id == mech1.Id).Verified,
                "Mech 1 must remain verified when a species it does NOT use is updated.");

            // Step 2: Modifying a species that Mech 1 uses DOES invalidate Mech 1's verified status
            await Task.Delay(20);
            var species1Dto = famAfterStep1.Species.First(s => s.Id == species1.Id);
            species1Dto.MolecularWeight = 48.5; // Changed molecular weight of O3
            var patchResp2 = await ownerClient.PatchAsJsonAsync($"/api/families/{family.Id}", famAfterStep1);
            Assert.AreEqual(HttpStatusCode.NoContent, patchResp2.StatusCode);

            var famAfterStep2 = await verifierClient.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");
            Assert.IsNotNull(famAfterStep2);
            var mech1After = famAfterStep2.Mechanisms.First(m => m.Id == mech1.Id);
            Assert.IsFalse(mech1After.Verified,
                "Mech 1 must lose verified status when a species it depends on is updated.");
            Assert.IsNull(mech1After.VerifiedDate);
        }

        [TestMethod]
        public async Task ModifyReactionUsedByVerifiedMechanism_StripsVerifiedStatus()
        {
            var owner = await CreateUserAsync(Role.None);
            var verifier = await CreateUserAsync(Role.Verifier);
            var (family, mech1, mech2, _, _, reaction1, reaction2) = await CreatePublicFamilyWithTwoMechanismsAsync(owner);

            // Verifier verifies Mech 1
            var verifierClient = CreateClient(true, verifier);
            var verifyResp = await verifierClient.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{mech1.Id}/verify",
                new VerifyMechanismRequest { Name = "Verified-Mech1" });
            Assert.AreEqual(HttpStatusCode.OK, verifyResp.StatusCode);

            var fam = await verifierClient.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");
            Assert.IsNotNull(fam);
            Assert.IsTrue(fam.Mechanisms.First(m => m.Id == mech1.Id).Verified);

            var ownerClient = CreateClient(true, owner);

            // Step 1: Modifying a reaction ONLY used by Mech 2 should NOT invalidate Mech 1
            await Task.Delay(20);
            var reaction2Dto = fam.Reactions.First(r => r.Id == reaction2.Id);
            reaction2Dto.Photolysis!.ScalingFactor = 99.0;
            var patchResp1 = await ownerClient.PatchAsJsonAsync($"/api/families/{family.Id}", fam);
            Assert.AreEqual(HttpStatusCode.NoContent, patchResp1.StatusCode);

            var famAfterStep1 = await verifierClient.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");
            Assert.IsNotNull(famAfterStep1);
            Assert.IsTrue(famAfterStep1.Mechanisms.First(m => m.Id == mech1.Id).Verified,
                "Mech 1 must remain verified when a reaction it does NOT use is updated.");

            // Step 2: Modifying reaction 1 (used by Mech 1) DOES invalidate Mech 1's verified status
            await Task.Delay(20);
            var reaction1Dto = famAfterStep1.Reactions.First(r => r.Id == reaction1.Id);
            reaction1Dto.Photolysis!.ScalingFactor = 5.5; // Changed photolysis rate
            var patchResp2 = await ownerClient.PatchAsJsonAsync($"/api/families/{family.Id}", famAfterStep1);
            Assert.AreEqual(HttpStatusCode.NoContent, patchResp2.StatusCode);

            var famAfterStep2 = await verifierClient.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");
            Assert.IsNotNull(famAfterStep2);
            var mech1After = famAfterStep2.Mechanisms.First(m => m.Id == mech1.Id);
            Assert.IsFalse(mech1After.Verified,
                "Mech 1 must lose verified status when a reaction it depends on is updated.");
            Assert.IsNull(mech1After.VerifiedDate);
        }

        [TestMethod]
        public async Task SaveFamily_WithFrontendNormalizedEmptyStrings_RetainsVerifiedStatus()
        {
            var owner = await CreateUserAsync(Role.None);
            var verifier = await CreateUserAsync(Role.Verifier);
            var (family, mech1, _, _, _, _, _) = await CreatePublicFamilyWithTwoMechanismsAsync(owner);

            var verifierClient = CreateClient(true, verifier);
            var verifyResp = await verifierClient.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{mech1.Id}/verify",
                new VerifyMechanismRequest { Name = "Verified-Mech1" });
            Assert.AreEqual(HttpStatusCode.OK, verifyResp.StatusCode);

            var fam = await verifierClient.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");
            Assert.IsNotNull(fam);
            Assert.IsTrue(fam.Mechanisms.First(m => m.Id == mech1.Id).Verified);

            // Simulate frontend normalization (null descriptions converted to "")
            await Task.Delay(20);
            foreach (var s in fam.Species) s.Description ??= "";
            foreach (var p in fam.Phases) p.Description ??= "";
            foreach (var r in fam.Reactions) r.Description ??= "";
            foreach (var m in fam.Mechanisms) m.Description ??= "";

            var ownerClient = CreateClient(true, owner);
            var patchResp = await ownerClient.PatchAsJsonAsync($"/api/families/{family.Id}", fam);
            Assert.AreEqual(HttpStatusCode.NoContent, patchResp.StatusCode);

            var famAfterSave = await verifierClient.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");
            Assert.IsNotNull(famAfterSave);
            Assert.IsTrue(famAfterSave.Mechanisms.First(m => m.Id == mech1.Id).Verified,
                "Saving a family after frontend normalization without semantic changes must retain Verified status.");
        }

        [TestMethod]
        public async Task UpdateFamily_ArchivedFamily_IsRejected()
        {
            var owner = await CreateUserAsync(Role.None);
            var admin = await CreateUserAsync(Role.Admin);
            var (family, mechanism, _) = await CreatePublicFamilyWithMechanismAsync(owner);

            var adminClient = CreateClient(true, admin);
            var verifyResp = await adminClient.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{mechanism.Id}/verify",
                new VerifyMechanismRequest { Name = "Archived-V1" });
            Assert.AreEqual(HttpStatusCode.OK, verifyResp.StatusCode);

            var ownerClient = CreateClient(true, owner);
            var deleteResp = await ownerClient.DeleteAsync($"/api/families/{family.Id}");
            Assert.AreEqual(HttpStatusCode.NoContent, deleteResp.StatusCode);

            var archivedResp = await adminClient.GetFromJsonAsync<List<ArchivedVerifiedVersionDto>>("/api/families/archived-versions");
            Assert.IsNotNull(archivedResp);
            var archived = archivedResp.FirstOrDefault(v => v.Name == "Archived-V1" && v.OriginalFamilyName == family.Name);
            Assert.IsNotNull(archived);

            var archivedFamilyDto = await adminClient.GetFromJsonAsync<FamilyDto>($"/api/families/{archived.FamilyId}");
            Assert.IsNotNull(archivedFamilyDto);
            archivedFamilyDto.Description = "Attempted edit on archived family";

            var patchResp = await adminClient.PatchAsJsonAsync($"/api/families/{archived.FamilyId}", archivedFamilyDto);
            Assert.AreEqual(HttpStatusCode.Forbidden, patchResp.StatusCode);
        }

        [TestMethod]
        public async Task DeleteUser_WhoVerifiedMechanism_SucceedsAndReassignsVerifier()
        {
            var admin = await CreateUserAsync(Role.Admin);
            var verifier = await CreateUserAsync(Role.Verifier);
            var (family, mechanism, _) = await CreatePublicFamilyWithMechanismAsync(admin);

            var verifierClient = CreateClient(true, verifier);
            var verifyResp = await verifierClient.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{mechanism.Id}/verify",
                new VerifyMechanismRequest { Name = "Verified-By-Deleted-User" });
            Assert.AreEqual(HttpStatusCode.OK, verifyResp.StatusCode);
            var verifiedDto = await verifyResp.Content.ReadFromJsonAsync<VerifiedMechanismVersionDto>();
            Assert.IsNotNull(verifiedDto);

            var adminClient = CreateClient(true, admin);
            var deleteUserResp = await adminClient.DeleteAsync($"/api/users/{verifier.Id}");
            Assert.AreEqual(HttpStatusCode.NoContent, deleteUserResp.StatusCode);

            var famAfter = await adminClient.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");
            Assert.IsNotNull(famAfter);
            var preservedVersion = famAfter.VerifiedVersions.FirstOrDefault(v => v.Id == verifiedDto.Id);
            Assert.IsNotNull(preservedVersion);
            Assert.AreNotEqual(verifier.Id, preservedVersion.VerifierId);
            Assert.AreNotEqual(Guid.Empty, preservedVersion.VerifierId);
        }

        [TestMethod]
        public async Task DeleteUser_WhoOwnsFamilyWithVerifiedVersion_ArchivesVerifiedVersion()
        {
            var admin = await CreateUserAsync(Role.Admin);
            var userB = await CreateUserAsync(Role.None);
            var (familyB, mechanismB, _) = await CreatePublicFamilyWithMechanismAsync(userB);

            var adminClient = CreateClient(true, admin);
            var verifyResp = await adminClient.PostAsJsonAsync(
                $"/api/families/{familyB.Id}/mechanisms/{mechanismB.Id}/verify",
                new VerifyMechanismRequest { Name = "Verified-In-UserB-Family" });
            Assert.AreEqual(HttpStatusCode.OK, verifyResp.StatusCode);

            var deleteUserResp = await adminClient.DeleteAsync($"/api/users/{userB.Id}");
            Assert.AreEqual(HttpStatusCode.NoContent, deleteUserResp.StatusCode);

            var archivedResp = await adminClient.GetFromJsonAsync<List<ArchivedVerifiedVersionDto>>("/api/families/archived-versions");
            Assert.IsNotNull(archivedResp);
            var archived = archivedResp.FirstOrDefault(v => v.Name == "Verified-In-UserB-Family" && v.OriginalFamilyName == familyB.Name);
            Assert.IsNotNull(archived, "Deleting User B must archive verified versions in User B's family rather than losing them.");
            Assert.AreEqual(familyB.Name, archived.OriginalFamilyName);

            // Archived container family must have IsArchived=true and be hidden from Browse (/api/families)
            var browseFamilies = await adminClient.GetFromJsonAsync<List<FamilyDto>>("/api/families");
            Assert.IsNotNull(browseFamilies);
            Assert.IsFalse(browseFamilies.Any(f => f.Id == archived.FamilyId),
                "Archived container families must be hidden from Browse.");

            var archivedFamily = await adminClient.GetFromJsonAsync<FamilyDto>($"/api/families/{archived.FamilyId}");
            Assert.IsNotNull(archivedFamily);
            Assert.IsTrue(archivedFamily.IsArchived);

            // Anonymous users can view archived-versions and the archived version snapshot
            var anonClient = CreateClient(false, admin);
            var anonArchived = await anonClient.GetFromJsonAsync<List<ArchivedVerifiedVersionDto>>("/api/families/archived-versions");
            Assert.IsNotNull(anonArchived);
            Assert.IsTrue(anonArchived.Any(v => v.FamilyVersionId == archived.FamilyVersionId));

            var anonVersion = await anonClient.GetFromJsonAsync<FamilyDto>(
                $"/api/families/{archived.FamilyId}/versions/{archived.FamilyVersionId}");
            Assert.IsNotNull(anonVersion);
            Assert.AreEqual(1, anonVersion.Mechanisms.Count);

            // Unarchiving a version in an archived container family is rejected
            var unarchiveResp = await adminClient.PostAsJsonAsync(
                $"/api/families/{archived.FamilyId}/mechanisms/{archived.MechanismId}/archive",
                new ArchiveMechanismRequest { IsArchived = false });
            Assert.AreEqual(HttpStatusCode.BadRequest, unarchiveResp.StatusCode);
        }

        [TestMethod]
        public async Task VerifyMechanism_FrozenSnapshotMechanism_IsRejected()
        {
            var owner = await CreateUserAsync(Role.None);
            var verifier = await CreateUserAsync(Role.Verifier);
            var (family, mechanism, _) = await CreatePublicFamilyWithMechanismAsync(owner);

            var verifierClient = CreateClient(true, verifier);
            var verifyResp = await verifierClient.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{mechanism.Id}/verify",
                new VerifyMechanismRequest { Name = "V1" });
            Assert.AreEqual(HttpStatusCode.OK, verifyResp.StatusCode);
            var verifiedDto = await verifyResp.Content.ReadFromJsonAsync<VerifiedMechanismVersionDto>();
            Assert.IsNotNull(verifiedDto);

            // Attempt to verify the frozen snapshot MechanismId instead of the editable CurrentVersion mechanism
            var reverifyFrozenResp = await verifierClient.PostAsJsonAsync(
                $"/api/families/{family.Id}/mechanisms/{verifiedDto.MechanismId}/verify",
                new VerifyMechanismRequest { Name = "V2-From-Frozen" });
            Assert.AreEqual(HttpStatusCode.NotFound, reverifyFrozenResp.StatusCode);
        }
    }
}
