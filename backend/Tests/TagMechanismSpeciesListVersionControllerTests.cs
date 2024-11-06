// using Chemistry_Cafe_API.Controllers;
// using Chemistry_Cafe_API.Models;
// using Microsoft.VisualStudio.TestTools.UnitTesting;
// using MySqlConnector;

// namespace Chemistry_Cafe_API.Tests
// {
//     [TestClass]
//     public class TagMechanismSpeciesListVersionControllerTests
//     {
//         TagMechanismSpeciesListVersionController controller = new TagMechanismSpeciesListVersionController(DBConnection.DataSource);

//         [TestMethod]
//         public async Task Get_retrieves_TagMechanismSpeciesListVersion()
//         {
            

//             var result = await controller.Get() as List<TagMechanismSpeciesListVersion>;

//             Assert.IsNotNull(result);
//         }

//         [TestMethod]
//         public async Task Creates_TagMechanismSpeciesListVersion()
//         {
            

//             var familyTagMecList = new TagMechanismSpeciesListVersion
//             {
//                 tag_mechanism_uuid = new Guid("02114e61-a4a6-48c0-9f99-3de4d20ab750"),
//                 species_uuid = new Guid("739289cd-1396-41f8-a3e5-415f6b1ccd07"),
//                 frozen_uuid = Guid.NewGuid(),
//                 user_uuid = new Guid("04c5db32-65e1-44ba-8b29-1cbfd5383789"),
//                 action = "test",
//                 datetime = DateTime.Now,
//                 isDel = false
//             };

//             var result = await controller.Create(familyTagMecList);

//             var getResult = await controller.Get(result);

//             Assert.AreEqual(result, getResult.uuid);
//         }

//         [TestMethod]
//         public async Task Updates_TagMechanismSpeciesListVersion()
//         {
            

//             var familyTagMecList = new TagMechanismSpeciesListVersion
//             {
//                 tag_mechanism_uuid = new Guid("02114e61-a4a6-48c0-9f99-3de4d20ab750"),
//                 species_uuid = new Guid("739289cd-1396-41f8-a3e5-415f6b1ccd07"),
//                 frozen_uuid = Guid.NewGuid(),
//                 user_uuid = new Guid("04c5db32-65e1-44ba-8b29-1cbfd5383789"),
//                 action = "test",
//                 datetime = DateTime.Now,
//                 isDel = false
//             };

//             var result = await controller.Create(familyTagMecList);

//             var getResult = await controller.Get(result);

//             getResult.action = "Edited";

//             await controller.Put(getResult);

//             var getEdited = await controller.Get(result);

//             await controller.Delete(result);

//             Assert.AreEqual(getEdited.action, "Edited");
//         }
//     }
// }
