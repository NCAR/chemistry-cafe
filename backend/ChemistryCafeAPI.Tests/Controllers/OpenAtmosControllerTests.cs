// using Microsoft.VisualStudio.TestTools.UnitTesting;
// using System.Threading.Tasks;
// using Microsoft.AspNetCore.Mvc;
// using Chemistry_Cafe_API.Controllers;
// using Chemistry_Cafe_API.Services;
// using Chemistry_Cafe_API.Models;
// using MySqlConnector;
// using System;
// using System.Linq;
// using System.IO;
// using System.IO.Compression;
// using System.Collections.Generic;
// using Moq;


// namespace Chemistry_Cafe_API.Tests
// {
//     [TestClass]
//     public class OpenAtmosControllerTests
//     {
//         // Database connection
//         readonly MySqlDataSource db = DBConnection.DataSource;

//         // IDs for test data
//         static Guid _FamilyId;
//         static Guid _MechanismId;
//         static Guid _ReactionId;
//         static Guid _SpeciesId1;
//         static Guid _SpeciesId2;
//         static Guid _ReactionSpeciesReactantId;
//         static Guid _ReactionSpeciesProductId;

//         // Flags to track created data
//         static bool familyCreated = false;
//         static bool mechanismCreated = false;
//         static bool reactionCreated = false;
//         static bool species1Created = false;
//         static bool species2Created = false;

//         // Test data constants
//         const string _FamilyName = "TestFamilyForOpenAtmos";
//         const string _MechanismName = "TestMechanismForOpenAtmos";
//         const string _ReactionName = "TestReactionForOpenAtmos";
//         const string _SpeciesName1 = "TestSpecies1ForOpenAtmos";
//         const string _SpeciesName2 = "TestSpecies2ForOpenAtmos";
//         const string _CreatedBy = "OpenAtmosControllerTests.cs";
//         static DateTime _CreatedDate = DateTime.UtcNow;

//         [ClassInitialize]
//         public static void ClassInit(TestContext context)
//         {
//             var db = DBConnection.DataSource;

//             // Ensure Family exists
//             var familyService = new FamilyService(db);
//             var familiesTask = familyService.GetFamiliesAsync();
//             familiesTask.Wait();
//             var families = familiesTask.Result;
//             var testFamily = families.FirstOrDefault(f => f.Name == _FamilyName);

//             if (testFamily != null)
//             {
//                 _FamilyId = testFamily.Id;
//             }
//             else
//             {
//                 var createFamilyTask = familyService.CreateFamilyAsync(_FamilyName, "A test family for OpenAtmosControllerTests.", _CreatedBy);
//                 createFamilyTask.Wait();
//                 var createdFamily = createFamilyTask.Result;
//                 _FamilyId = createdFamily.Id;
//                 familyCreated = true;
//             }

//             // Ensure Mechanism exists
//             var mechanismService = new MechanismService(db);
//             var mechanismsTask = mechanismService.GetMechanismsAsync();
//             mechanismsTask.Wait();
//             var mechanisms = mechanismsTask.Result;
//             var testMechanism = mechanisms.FirstOrDefault(m => m.Name == _MechanismName);

//             if (testMechanism != null)
//             {
//                 _MechanismId = testMechanism.Id;
//             }
//             else
//             {
//                 var newMechanism = new Mechanism
//                 {
//                     FamilyId = _FamilyId,
//                     Name = _MechanismName,
//                     Description = "A test mechanism for OpenAtmosControllerTests.",
//                     CreatedBy = _CreatedBy,
//                     CreatedDate = _CreatedDate
//                 };

//                 var createMechanismTask = mechanismService.CreateMechanismAsync(newMechanism);
//                 createMechanismTask.Wait();
//                 var createdMechanism = createMechanismTask.Result;
//                 _MechanismId = createdMechanism.Id;
//                 mechanismCreated = true;
//             }

//             // Ensure Reaction exists
//             var reactionService = new ReactionService(db);
//             var reactionsTask = reactionService.GetReactionsAsync();
//             reactionsTask.Wait();
//             var reactions = reactionsTask.Result;
//             var testReaction = reactions.FirstOrDefault(r => r.Name == _ReactionName);

//             if (testReaction != null)
//             {
//                 _ReactionId = testReaction.Id;
//             }
//             else
//             {
//                 var newReaction = new Reaction
//                 {
//                     Name = _ReactionName,
//                     Description = "A test reaction for OpenAtmosControllerTests.",
//                     CreatedBy = _CreatedBy,
//                     CreatedDate = _CreatedDate
//                 };

//                 var createReactionTask = reactionService.CreateReactionAsync(newReaction);
//                 createReactionTask.Wait();
//                 var createdReaction = createReactionTask.Result;
//                 _ReactionId = createdReaction.Id;
//                 reactionCreated = true;
//             }

//             // Ensure Species 1 exists
//             var speciesService = new SpeciesService(db);
//             var speciesTask = speciesService.GetSpeciesAsync();
//             speciesTask.Wait();
//             var speciesList = speciesTask.Result;
//             var testSpecies1 = speciesList.FirstOrDefault(s => s.Name == _SpeciesName1);

//             if (testSpecies1 != null)
//             {
//                 _SpeciesId1 = testSpecies1.Id;
//             }
//             else
//             {
//                 var newSpecies1 = new Species
//                 {
//                     Name = _SpeciesName1,
//                     Description = "A test species 1 for OpenAtmosControllerTests.",
//                     CreatedBy = _CreatedBy,
//                     CreatedDate = _CreatedDate
//                 };

//                 var createSpeciesTask1 = speciesService.CreateSpeciesAsync(newSpecies1);
//                 createSpeciesTask1.Wait();
//                 var createdSpecies1 = createSpeciesTask1.Result;
//                 _SpeciesId1 = createdSpecies1.Id;
//                 species1Created = true;
//             }

//             // Ensure Species 2 exists
//             var testSpecies2 = speciesList.FirstOrDefault(s => s.Name == _SpeciesName2);

//             if (testSpecies2 != null)
//             {
//                 _SpeciesId2 = testSpecies2.Id;
//             }
//             else
//             {
//                 var newSpecies2 = new Species
//                 {
//                     Name = _SpeciesName2,
//                     Description = "A test species 2 for OpenAtmosControllerTests.",
//                     CreatedBy = _CreatedBy,
//                     CreatedDate = _CreatedDate
//                 };

//                 var createSpeciesTask2 = speciesService.CreateSpeciesAsync(newSpecies2);
//                 createSpeciesTask2.Wait();
//                 var createdSpecies2 = createSpeciesTask2.Result;
//                 _SpeciesId2 = createdSpecies2.Id;
//                 species2Created = true;
//             }

//             // Add Species to Mechanism
//             var logger = new Mock<ILogger<MechanismSpeciesService>>();
//             var mechanismSpeciesService = new MechanismSpeciesService(db, logger.Object);
//             var addSpeciesToMechanismTask1 = mechanismSpeciesService.AddSpeciesToMechanismAsync(new MechanismSpecies
//             {
//                 MechanismId = _MechanismId,
//                 SpeciesId = _SpeciesId1
//             });
//             addSpeciesToMechanismTask1.Wait();

//             var addSpeciesToMechanismTask2 = mechanismSpeciesService.AddSpeciesToMechanismAsync(new MechanismSpecies
//             {
//                 MechanismId = _MechanismId,
//                 SpeciesId = _SpeciesId2
//             });
//             addSpeciesToMechanismTask2.Wait();

//             // Add Reaction to Mechanism
//             var mechanismReactionService = new MechanismReactionService(db);
//             var addReactionToMechanismTask = mechanismReactionService.AddReactionToMechanismAsync(new MechanismReaction
//             {
//                 MechanismId = _MechanismId,
//                 ReactionId = _ReactionId
//             });
//             addReactionToMechanismTask.Wait();

//             // Add ReactionSpecies mappings
//             var reactionSpeciesService = new ReactionSpeciesService(db);

//             // Reactant
//             var addReactantTask = reactionSpeciesService.AddSpeciesToReactionAsync(new ReactionSpecies
//             {
//                 ReactionId = _ReactionId,
//                 SpeciesId = _SpeciesId1,
//                 Role = "reactant",
//                 Quantity = 1.0m
//             });
//             addReactantTask.Wait();

//             // Product
//             var addProductTask = reactionSpeciesService.AddSpeciesToReactionAsync(new ReactionSpecies
//             {
//                 ReactionId = _ReactionId,
//                 SpeciesId = _SpeciesId2,
//                 Role = "product",
//                 Quantity = 1.0m
//             });
//             addProductTask.Wait();
//         }

//         [TestMethod]
//         public async Task GetMechanismJson_Returns_Valid_Json()
//         {
//             // Arrange
//             var openAtmosService = new OpenAtmosService(db);
//             var controller = new OpenAtmosController(openAtmosService);

//             // Act
//             var result = await controller.GetMechanismJson(_MechanismId);

//             // Assert
//             var contentResult = result as ContentResult;
//             Assert.IsNotNull(contentResult);
//             Assert.AreEqual("application/json", contentResult.ContentType);
//             Assert.IsFalse(string.IsNullOrEmpty(contentResult.Content));

//             // Optionally, validate JSON content
//             // For simplicity, we'll just check if it starts with '{' and ends with '}'
//             Assert.IsTrue(contentResult.Content.Trim().StartsWith("{"));
//             Assert.IsTrue(contentResult.Content.Trim().EndsWith("}"));
//         }

//         [TestMethod]
//         public async Task GetMechanismMusicbox_Returns_Valid_Zip()
//         {
//             // Arrange
//             var openAtmosService = new OpenAtmosService(db);
//             var controller = new OpenAtmosController(openAtmosService);

//             // Act
//             var result = await controller.GetMechanismMusicbox(_MechanismId);

//             // Assert
//             var fileResult = result as FileContentResult;
//             Assert.IsNotNull(fileResult);
//             Assert.AreEqual("application/zip", fileResult.ContentType);
//             Assert.AreEqual("musicbox.zip", fileResult.FileDownloadName);
//             Assert.IsTrue(fileResult.FileContents.Length > 0);

//             // Optionally, validate ZIP content
//             using (var memoryStream = new MemoryStream(fileResult.FileContents))
//             using (var archive = new ZipArchive(memoryStream))
//             {
//                 var entries = archive.Entries;
//                 Assert.IsTrue(entries.Any(e => e.Name == "my_config.json"));
//                 Assert.IsTrue(entries.Any(e => e.FullName == "camp_data/species.json"));
//                 Assert.IsTrue(entries.Any(e => e.FullName == "camp_data/reactions.json"));
//                 Assert.IsTrue(entries.Any(e => e.FullName == "camp_data/config.json"));
//             }
//         }

//         [TestMethod]
//         public async Task GetMechanismJson_Returns_NotFound_For_Invalid_Id()
//         {
//             // Arrange
//             var openAtmosService = new OpenAtmosService(db);
//             var controller = new OpenAtmosController(openAtmosService);
//             var invalidMechanismId = Guid.NewGuid();

//             // Act
//             var result = await controller.GetMechanismJson(invalidMechanismId);

//             // Assert
//             var notFoundResult = result as NotFoundObjectResult;
//             Assert.IsNotNull(notFoundResult);
//             Assert.AreEqual(404, notFoundResult.StatusCode);
//         }

//         [TestMethod]
//         public async Task GetMechanismYaml_Returns_NotFound_For_Invalid_Id()
//         {
//             // Arrange
//             var openAtmosService = new OpenAtmosService(db);
//             var controller = new OpenAtmosController(openAtmosService);
//             var invalidMechanismId = Guid.NewGuid();

//             // Act
//             var result = await controller.GetMechanismYaml(invalidMechanismId);

//             // Assert
//             var notFoundResult = result as NotFoundObjectResult;
//             Assert.IsNotNull(notFoundResult);
//             Assert.AreEqual(404, notFoundResult.StatusCode);
//         }

//         [TestMethod]
//         public async Task GetMechanismMusicbox_Returns_NotFound_For_Invalid_Id()
//         {
//             // Arrange
//             var openAtmosService = new OpenAtmosService(db);
//             var controller = new OpenAtmosController(openAtmosService);
//             var invalidMechanismId = Guid.NewGuid();

//             // Act
//             var result = await controller.GetMechanismMusicbox(invalidMechanismId);

//             // Assert
//             var notFoundResult = result as NotFoundObjectResult;
//             Assert.IsNotNull(notFoundResult);
//             Assert.AreEqual(404, notFoundResult.StatusCode);
//         }




//         [ClassCleanup]
//         public static void ClassCleanup()
//         {
//             var db = DBConnection.DataSource;

//             // Remove ReactionSpecies mappings
//             var reactionSpeciesService = new ReactionSpeciesService(db);
//             var reactionSpeciesTask = reactionSpeciesService.GetSpeciesByReactionIdAsync(_ReactionId);
//             reactionSpeciesTask.Wait();
//             var reactionSpeciesList = reactionSpeciesTask.Result;

//             foreach (var rs in reactionSpeciesList)
//             {
//                 var deleteTask = reactionSpeciesService.RemoveSpeciesFromReactionAsync(rs.Id);
//                 deleteTask.Wait();
//             }

//             // Remove Species from Mechanism
//             var logger = new Mock<ILogger<MechanismSpeciesService>>();
//             var mechanismSpeciesService = new MechanismSpeciesService(db, logger.Object);
//             var mechanismSpeciesTask = mechanismSpeciesService.GetMechanismSpeciesByMechanismIdAsync(_MechanismId);
//             mechanismSpeciesTask.Wait();
//             var mechanismSpeciesList = mechanismSpeciesTask.Result;

//             foreach (var ms in mechanismSpeciesList)
//             {
//                 var deleteTask = mechanismSpeciesService.RemoveSpeciesFromMechanismAsync(ms.Id);
//                 deleteTask.Wait();
//             }

//             // Remove Reaction from Mechanism
//             var mechanismReactionService = new MechanismReactionService(db);
//             var mechanismReactionTask = mechanismReactionService.GetMechanismReactionsByMechanismIdAsync(_MechanismId);
//             mechanismReactionTask.Wait();
//             var mechanismReactionList = mechanismReactionTask.Result;

//             foreach (var mr in mechanismReactionList)
//             {
//                 var deleteTask = mechanismReactionService.RemoveReactionFromMechanismAsync(mr.Id);
//                 deleteTask.Wait();
//             }

//             // Delete Reaction
//             if (reactionCreated)
//             {
//                 var reactionService = new ReactionService(db);
//                 var deleteReactionTask = reactionService.DeleteReactionAsync(_ReactionId);
//                 deleteReactionTask.Wait();
//             }

//             // Delete Species
//             var speciesService = new SpeciesService(db);
//             if (species1Created)
//             {
//                 var deleteSpeciesTask1 = speciesService.DeleteSpeciesAsync(_SpeciesId1);
//                 deleteSpeciesTask1.Wait();
//             }
//             if (species2Created)
//             {
//                 var deleteSpeciesTask2 = speciesService.DeleteSpeciesAsync(_SpeciesId2);
//                 deleteSpeciesTask2.Wait();
//             }

//             // Delete Mechanism
//             if (mechanismCreated)
//             {
//                 var mechanismService = new MechanismService(db);
//                 var deleteMechanismTask = mechanismService.DeleteMechanismAsync(_MechanismId);
//                 deleteMechanismTask.Wait();
//             }

//             // Delete Family
//             if (familyCreated)
//             {
//                 var familyService = new FamilyService(db);
//                 var deleteFamilyTask = familyService.DeleteFamilyAsync(_FamilyId);
//                 deleteFamilyTask.Wait();
//             }
//         }
//     }
// }
