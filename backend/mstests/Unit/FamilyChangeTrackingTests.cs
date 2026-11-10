using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;
using ChemistryCafeAPI.Models.Mappers;
using ChemistryCafeAPI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace ChemistryCafeAPI.Tests;

[TestClass]
public class FamilyChangeTrackingTests
{
    private static User _owner = null!;
    private static User _contributor = null!;
    private static User _stranger = null!;
    private static User _admin = null!;
    private static readonly List<Guid> _createdFamilyIds = new();

    [ClassInitialize]
    public static void ClassInit(TestContext context)
    {
        using ChemistryDbContext ctx = DBConnection.NewContext();
        var userService = new UserService(ctx);

        _owner = userService.SignInGoogle("audit-owner-gid", "audit-owner@test.com").Result;
        _contributor = userService.SignInGoogle("audit-contrib-gid", "audit-contrib@test.com").Result;
        _stranger = userService.SignInGoogle("audit-stranger-gid", "audit-stranger@test.com").Result;

        _admin = userService.SignInGoogle("audit-admin-gid", "audit-admin@test.com").Result;
        _admin.Role = Role.Admin;
        ctx.SaveChanges();
    }

    [ClassCleanup]
    public static void ClassCleanup()
    {
        using ChemistryDbContext ctx = DBConnection.NewContext();
        var familyService = new FamilyService(ctx);
        foreach (Guid id in _createdFamilyIds)
        {
            try
            {
                familyService.DeleteFamilyAsync(id, _owner.Id.ToString()).Wait();
            }
            catch
            {
                // best effort
            }
        }
    }

    private static async Task<FamilyDto> CreateTestFamilyAsync(string name = "Audit Test Family")
    {
        using ChemistryDbContext ctx = DBConnection.NewContext();
        ctx.Attach(_owner);
        var familyService = new FamilyService(ctx);

        Guid s1 = Guid.NewGuid();
        Guid r1 = Guid.NewGuid();
        Guid p1 = Guid.NewGuid();
        Guid m1 = Guid.NewGuid();

        var dto = new FamilyDto
        {
            Name = name,
            Description = "Initial description",
            IsPublic = false,
            Species = new()
            {
                new SpeciesDto { Id = s1, Name = "O3", Description = "Ozone" }
            },
            Reactions = new()
            {
                new ReactionDto
                {
                    Id = r1,
                    Name = "Ozone photolysis",
                    ReactionType = "PHOTOLYSIS",
                    Reactants = new() { new ReactantDto { SpeciesId = s1, Coefficient = 1 } },
                    Products = new(),
                    Photolysis = new PhotolysisParametersDto()
                }
            },
            Phases = new()
            {
                new PhaseDto { Id = p1, Name = "Gas Phase", SpeciesIds = new() { s1 } }
            },
            Mechanisms = new()
            {
                new MechanismDto
                {
                    Id = m1,
                    Name = "Tropospheric Cycle",
                    Description = "Standard cycle",
                    SpeciesIds = new() { s1 },
                    ReactionIds = new() { r1 },
                    PhaseIds = new() { p1 }
                }
            }
        };

        var (code, entry) = await familyService.CreateFamilyAsync(dto, _owner);
        Assert.AreEqual(QueryResult.Success, code);
        Assert.IsNotNull(entry);

        Guid familyId = entry.Entity.Id;
        _createdFamilyIds.Add(familyId);
        dto.Id = familyId;

        // Save full initial graph via UpdateFamilyAsync
        await familyService.UpdateFamilyAsync(familyId, dto, _owner.Id.ToString());

        var loaded = await familyService.GetFamilyAsync(familyId, _owner);
        Assert.IsNotNull(loaded);
        return loaded.ToDto();
    }

    [TestMethod]
    public async Task TargetType_Family_TrackedOnSave()
    {
        var family = await CreateTestFamilyAsync("Family Prop Test");

        using ChemistryDbContext ctx = DBConnection.NewContext();
        var familyService = new FamilyService(ctx);

        // Update family properties and provide save note
        family.Name = "Updated Family Name";
        family.Description = "Updated Description";
        family.SaveNote = "Renamed family for testing";

        var updateResult = await familyService.UpdateFamilyAsync(family.Id, family, _owner.Id.ToString());
        Assert.AreEqual(QueryResult.Success, updateResult);

        var (histCode, history) = await familyService.GetFamilyHistoryAsync(family.Id, _owner.Id.ToString(), targetType: ChangeTargetType.Family);
        Assert.AreEqual(QueryResult.Success, histCode);
        Assert.IsNotNull(history);

        var latestChangeSet = history.First();
        Assert.AreEqual("Renamed family for testing", latestChangeSet.Note);
        Assert.AreEqual(_owner.Id, latestChangeSet.UserId);

        var familyEntry = latestChangeSet.Entries.FirstOrDefault(e => e.TargetType == "Family");
        Assert.IsNotNull(familyEntry);
        Assert.AreEqual("Updated", familyEntry.Action);
        Assert.AreEqual(family.Id, familyEntry.TargetId);
        Assert.IsTrue(familyEntry.Before?.Contains("Family Prop Test") ?? false);
        Assert.IsTrue(familyEntry.After?.Contains("Updated Family Name") ?? false);
    }

    [TestMethod]
    public async Task TargetType_Species_TrackedOnAddUpdateDelete()
    {
        var family = await CreateTestFamilyAsync("Species Audit Test");

        using ChemistryDbContext ctx = DBConnection.NewContext();
        var familyService = new FamilyService(ctx);

        // 1. Add Species
        Guid newSpeciesId = Guid.NewGuid();
        family.Species.Add(new SpeciesDto
        {
            Id = newSpeciesId,
            Name = "NO2",
            Description = "Nitrogen dioxide"
        });
        family.SaveNote = "Added NO2";
        await familyService.UpdateFamilyAsync(family.Id, family, _owner.Id.ToString());

        var (code1, hist1) = await familyService.GetFamilyHistoryAsync(family.Id, _owner.Id.ToString(), targetType: ChangeTargetType.Species);
        Assert.AreEqual(QueryResult.Success, code1);
        var addEntry = hist1!.First().Entries.First(e => e.TargetId == newSpeciesId);
        Assert.AreEqual("Added", addEntry.Action);
        Assert.AreEqual("NO2", addEntry.TargetName);
        Assert.IsNull(addEntry.Before);
        Assert.IsNotNull(addEntry.After);

        // 2. Update Species
        var spec = family.Species.First(s => s.Id == newSpeciesId);
        spec.Description = "Updated NO2 description";
        family.SaveNote = "Updated NO2";
        await familyService.UpdateFamilyAsync(family.Id, family, _owner.Id.ToString());

        var (code2, hist2) = await familyService.GetFamilyHistoryAsync(family.Id, _owner.Id.ToString(), targetType: ChangeTargetType.Species);
        var updateEntry = hist2!.First().Entries.First(e => e.TargetId == newSpeciesId);
        Assert.AreEqual("Updated", updateEntry.Action);
        Assert.IsTrue(updateEntry.Before?.Contains("Nitrogen dioxide") ?? false);
        Assert.IsTrue(updateEntry.After?.Contains("Updated NO2 description") ?? false);

        // 3. Delete Species
        family.Species.RemoveAll(s => s.Id == newSpeciesId);
        family.SaveNote = "Deleted NO2";
        await familyService.UpdateFamilyAsync(family.Id, family, _owner.Id.ToString());

        var (code3, hist3) = await familyService.GetFamilyHistoryAsync(family.Id, _owner.Id.ToString(), targetType: ChangeTargetType.Species);
        var deleteEntry = hist3!.First().Entries.First(e => e.TargetId == newSpeciesId);
        Assert.AreEqual("Deleted", deleteEntry.Action);
        Assert.AreEqual("NO2", deleteEntry.TargetName);
        Assert.IsNotNull(deleteEntry.Before);
        Assert.IsNull(deleteEntry.After);
    }

    [TestMethod]
    public async Task TargetType_Reaction_TrackedOnAddUpdateDelete()
    {
        var family = await CreateTestFamilyAsync("Reaction Audit Test");

        using ChemistryDbContext ctx = DBConnection.NewContext();
        var familyService = new FamilyService(ctx);

        Guid sId = family.Species[0].Id;
        Guid rxnId = Guid.NewGuid();

        // 1. Add Reaction
        family.Reactions.Add(new ReactionDto
        {
            Id = rxnId,
            Name = "New Arrhenius Rxn",
            ReactionType = "ARRHENIUS",
            Reactants = new() { new ReactantDto { SpeciesId = sId, Coefficient = 1 } },
            Products = new(),
            Arrhenius = new ArrheniusParametersDto { A = 1.5e-11, Ea = 100 }
        });
        family.SaveNote = "Added Arrhenius reaction";
        await familyService.UpdateFamilyAsync(family.Id, family, _owner.Id.ToString());

        var (code1, hist1) = await familyService.GetFamilyHistoryAsync(family.Id, _owner.Id.ToString(), targetType: ChangeTargetType.Reaction);
        Assert.AreEqual(QueryResult.Success, code1);
        var addEntry = hist1!.First().Entries.First(e => e.TargetId == rxnId);
        Assert.AreEqual("Added", addEntry.Action);
        Assert.AreEqual("New Arrhenius Rxn", addEntry.TargetName);

        // 2. Update Reaction rate parameters
        var rxn = family.Reactions.First(r => r.Id == rxnId);
        rxn.Arrhenius!.A = 2.0e-11;
        family.SaveNote = "Modified rate coefficient A";
        await familyService.UpdateFamilyAsync(family.Id, family, _owner.Id.ToString());

        var (code2, hist2) = await familyService.GetFamilyHistoryAsync(family.Id, _owner.Id.ToString(), targetType: ChangeTargetType.Reaction);
        var updateEntry = hist2!.First().Entries.First(e => e.TargetId == rxnId);
        Assert.AreEqual("Updated", updateEntry.Action);
        Assert.IsTrue(updateEntry.Before?.Contains("1.5") == true);
        Assert.IsTrue(updateEntry.After?.Contains("2") == true);

        // 3. Delete Reaction
        family.Reactions.RemoveAll(r => r.Id == rxnId);
        family.SaveNote = "Removed Arrhenius reaction";
        await familyService.UpdateFamilyAsync(family.Id, family, _owner.Id.ToString());

        var (code3, hist3) = await familyService.GetFamilyHistoryAsync(family.Id, _owner.Id.ToString(), targetType: ChangeTargetType.Reaction);
        var deleteEntry = hist3!.First().Entries.First(e => e.TargetId == rxnId);
        Assert.AreEqual("Deleted", deleteEntry.Action);
        Assert.AreEqual("New Arrhenius Rxn", deleteEntry.TargetName);
    }

    [TestMethod]
    public async Task TargetType_Phase_TrackedOnAddUpdateDelete()
    {
        var family = await CreateTestFamilyAsync("Phase Audit Test");

        using ChemistryDbContext ctx = DBConnection.NewContext();
        var familyService = new FamilyService(ctx);

        Guid sId = family.Species[0].Id;
        Guid phaseId = Guid.NewGuid();

        // 1. Add Phase
        family.Phases.Add(new PhaseDto
        {
            Id = phaseId,
            Name = "Aerosol Phase",
            SpeciesIds = new() { sId }
        });
        family.SaveNote = "Added aerosol phase";
        await familyService.UpdateFamilyAsync(family.Id, family, _owner.Id.ToString());

        var (code1, hist1) = await familyService.GetFamilyHistoryAsync(family.Id, _owner.Id.ToString(), targetType: ChangeTargetType.Phase);
        Assert.AreEqual(QueryResult.Success, code1);
        var addEntry = hist1!.First().Entries.First(e => e.TargetId == phaseId);
        Assert.AreEqual("Added", addEntry.Action);
        Assert.AreEqual("Aerosol Phase", addEntry.TargetName);

        // 2. Update Phase Name
        var ph = family.Phases.First(p => p.Id == phaseId);
        ph.Name = "Condensed Aerosol";
        family.SaveNote = "Renamed phase";
        await familyService.UpdateFamilyAsync(family.Id, family, _owner.Id.ToString());

        var (code2, hist2) = await familyService.GetFamilyHistoryAsync(family.Id, _owner.Id.ToString(), targetType: ChangeTargetType.Phase);
        var updateEntry = hist2!.First().Entries.First(e => e.TargetId == phaseId);
        Assert.AreEqual("Updated", updateEntry.Action);
        Assert.IsTrue(updateEntry.Before?.Contains("Aerosol Phase") ?? false);
        Assert.IsTrue(updateEntry.After?.Contains("Condensed Aerosol") ?? false);

        // 3. Delete Phase
        family.Phases.RemoveAll(p => p.Id == phaseId);
        family.SaveNote = "Removed phase";
        await familyService.UpdateFamilyAsync(family.Id, family, _owner.Id.ToString());

        var (code3, hist3) = await familyService.GetFamilyHistoryAsync(family.Id, _owner.Id.ToString(), targetType: ChangeTargetType.Phase);
        var deleteEntry = hist3!.First().Entries.First(e => e.TargetId == phaseId);
        Assert.AreEqual("Deleted", deleteEntry.Action);
        Assert.AreEqual("Condensed Aerosol", deleteEntry.TargetName);
    }

    [TestMethod]
    public async Task TargetType_Mechanism_TrackedOnAddUpdateDelete()
    {
        var family = await CreateTestFamilyAsync("Mechanism Audit Test");

        using ChemistryDbContext ctx = DBConnection.NewContext();
        var familyService = new FamilyService(ctx);

        Guid mechId = Guid.NewGuid();

        // 1. Add Mechanism
        family.Mechanisms.Add(new MechanismDto
        {
            Id = mechId,
            Name = "Stratospheric Mechanism",
            Description = "Ozone layer chemistry",
            SpeciesIds = new() { family.Species[0].Id },
            ReactionIds = new() { family.Reactions[0].Id },
            PhaseIds = new() { family.Phases[0].Id }
        });
        family.SaveNote = "Added stratospheric mechanism";
        await familyService.UpdateFamilyAsync(family.Id, family, _owner.Id.ToString());

        var (code1, hist1) = await familyService.GetFamilyHistoryAsync(family.Id, _owner.Id.ToString(), targetType: ChangeTargetType.Mechanism);
        Assert.AreEqual(QueryResult.Success, code1);
        var addEntry = hist1!.First().Entries.First(e => e.TargetId == mechId);
        Assert.AreEqual("Added", addEntry.Action);
        Assert.AreEqual("Stratospheric Mechanism", addEntry.TargetName);

        // 2. Update Mechanism
        var m = family.Mechanisms.First(mech => mech.Id == mechId);
        m.Description = "Updated description for stratospheric model";
        family.SaveNote = "Updated mechanism description";
        await familyService.UpdateFamilyAsync(family.Id, family, _owner.Id.ToString());

        var (code2, hist2) = await familyService.GetFamilyHistoryAsync(family.Id, _owner.Id.ToString(), targetType: ChangeTargetType.Mechanism);
        var updateEntry = hist2!.First().Entries.First(e => e.TargetId == mechId);
        Assert.AreEqual("Updated", updateEntry.Action);
        Assert.IsTrue(updateEntry.Before?.Contains("Ozone layer chemistry") ?? false);
        Assert.IsTrue(updateEntry.After?.Contains("Updated description for stratospheric model") ?? false);

        // 3. Delete Mechanism
        family.Mechanisms.RemoveAll(mech => mech.Id == mechId);
        family.SaveNote = "Deleted mechanism";
        await familyService.UpdateFamilyAsync(family.Id, family, _owner.Id.ToString());

        var (code3, hist3) = await familyService.GetFamilyHistoryAsync(family.Id, _owner.Id.ToString(), targetType: ChangeTargetType.Mechanism);
        var deleteEntry = hist3!.First().Entries.First(e => e.TargetId == mechId);
        Assert.AreEqual("Deleted", deleteEntry.Action);
        Assert.AreEqual("Stratospheric Mechanism", deleteEntry.TargetName);
    }

    [TestMethod]
    public void TargetType_Group_CreatesValidChangeEntry()
    {
        Guid groupId = Guid.NewGuid();
        var entry = FamilyService.CreateGroupChangeEntry(
            groupId,
            "VOCs",
            ChangeAction.Added,
            before: null,
            after: new { name = "VOCs", speciesCount = 5 });

        Assert.AreEqual(ChangeTargetType.Group, entry.TargetType);
        Assert.AreEqual(groupId, entry.TargetId);
        Assert.AreEqual("VOCs", entry.TargetName);
        Assert.AreEqual(ChangeAction.Added, entry.Action);
        Assert.IsNull(entry.Before);
        Assert.IsTrue(entry.After?.Contains("VOCs") ?? false);
    }

    [TestMethod]
    public async Task No_Changes_Creates_No_ChangeSet()
    {
        var family = await CreateTestFamilyAsync("No Change Test");

        using ChemistryDbContext ctx = DBConnection.NewContext();
        var familyService = new FamilyService(ctx);

        int countBefore = await ctx.ChangeSets.CountAsync(cs => cs.FamilyId == family.Id);

        // Save with no changes
        family.SaveNote = "No-op save";
        var res = await familyService.UpdateFamilyAsync(family.Id, family, _owner.Id.ToString());
        Assert.AreEqual(QueryResult.Success, res);

        using ChemistryDbContext verifyCtx = DBConnection.NewContext();
        int countAfter = await verifyCtx.ChangeSets.CountAsync(cs => cs.FamilyId == family.Id);

        Assert.AreEqual(countBefore, countAfter);
    }

    [TestMethod]
    public async Task Filtering_History_By_TargetId_Returns_Only_Target_Entries()
    {
        var family = await CreateTestFamilyAsync("Target Filter Test");

        using ChemistryDbContext ctx = DBConnection.NewContext();
        var familyService = new FamilyService(ctx);

        Guid sId = family.Species[0].Id;
        Guid rId = family.Reactions[0].Id;

        // Edit both species and reaction in single save
        family.Species[0].Description = "New species desc";
        family.Reactions[0].Name = "New reaction name";
        family.SaveNote = "Dual edit";
        await familyService.UpdateFamilyAsync(family.Id, family, _owner.Id.ToString());

        // Filter by species ID
        var (sCode, sHist) = await familyService.GetFamilyHistoryAsync(
            family.Id,
            _owner.Id.ToString(),
            targetType: ChangeTargetType.Species,
            targetId: sId);

        Assert.AreEqual(QueryResult.Success, sCode);
        Assert.IsTrue(sHist!.Count > 0);
        foreach (var cs in sHist)
        {
            Assert.IsTrue(cs.Entries.All(e => e.TargetId == sId));
        }

        // Filter by reaction ID
        var (rCode, rHist) = await familyService.GetFamilyHistoryAsync(
            family.Id,
            _owner.Id.ToString(),
            targetType: ChangeTargetType.Reaction,
            targetId: rId);

        Assert.AreEqual(QueryResult.Success, rCode);
        Assert.IsTrue(rHist!.Count > 0);
        foreach (var cs in rHist)
        {
            Assert.IsTrue(cs.Entries.All(e => e.TargetId == rId));
        }
    }

    [TestMethod]
    public async Task Authorization_Owner_Contributor_Admin_Access_Rules()
    {
        var family = await CreateTestFamilyAsync("Auth Test Family");

        // Add contributor to family
        using (ChemistryDbContext addCtx = DBConnection.NewContext())
        {
            addCtx.FamilyContributors.Add(new FamilyContributor
            {
                FamilyId = family.Id,
                UserId = _contributor.Id,
                Role = ContributorRole.Editor
            });
            await addCtx.SaveChangesAsync();
        }

        using ChemistryDbContext ctx = DBConnection.NewContext();
        var familyService = new FamilyService(ctx);

        // 1. Owner can read history
        var (ownerCode, _) = await familyService.GetFamilyHistoryAsync(family.Id, _owner.Id.ToString());
        Assert.AreEqual(QueryResult.Success, ownerCode);

        // 2. Contributor can read history
        var (contribCode, _) = await familyService.GetFamilyHistoryAsync(family.Id, _contributor.Id.ToString());
        Assert.AreEqual(QueryResult.Success, contribCode);

        // 3. Admin can read family history
        var (adminCode, _) = await familyService.GetFamilyHistoryAsync(family.Id, _admin.Id.ToString());
        Assert.AreEqual(QueryResult.Success, adminCode);

        // 4. Stranger cannot read history (NoAccess)
        var (strangerCode, _) = await familyService.GetFamilyHistoryAsync(family.Id, _stranger.Id.ToString());
        Assert.AreEqual(QueryResult.NoAccess, strangerCode);

        // 5. Unauthenticated cannot read history (NoAccess)
        var (anonCode, _) = await familyService.GetFamilyHistoryAsync(family.Id, null);
        Assert.AreEqual(QueryResult.NoAccess, anonCode);

        // 6. Admin can read global history
        var (globalAdminCode, globalHist) = await familyService.GetGlobalHistoryAsync(_admin.Id.ToString());
        Assert.AreEqual(QueryResult.Success, globalAdminCode);
        Assert.IsNotNull(globalHist);

        // 7. Non-admin cannot read global history
        var (globalUserCode, _) = await familyService.GetGlobalHistoryAsync(_owner.Id.ToString());
        Assert.AreEqual(QueryResult.NoAccess, globalUserCode);
    }
}
