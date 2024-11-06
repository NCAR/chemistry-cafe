// using Chemistry_Cafe_API.Controllers;
// using Chemistry_Cafe_API.Models;
// using Microsoft.VisualStudio.TestTools.UnitTesting;
// using MySqlConnector;

// namespace Chemistry_Cafe_API.Tests
// {
//     [TestClass]
//     public class TagMechanismReactionListControllerTests
//     {
//         readonly MySqlDataSource db = DBConnection.DataSource;
        
//         [TestMethod]
//         public async Task Get_retrieves_tagmechanismreactionlist()
//         {
//             var controller = new TagMechanismReactionListController(db);

//             var result = await controller.Get() as List<TagMechanismReactionList>;

//             Assert.IsNotNull(result);
//         }

//         [TestMethod]
//         public async Task Creates_tagmechanismreactionlist()
//         {
//             var controller = new TagMechanismReactionListController(db);

//             var tagMechanismReactionList = new TagMechanismReactionList
//             {
//                 tag_mechanism_uuid = new Guid("02114e61-a4a6-48c0-9f99-3de4d20ab750"),
//                 reaction_uuid = new Guid("367f4b94-14f5-404e-86ee-1d5f799edcd7"),
//                 version = "1.0",
//                 isDel = false
//             };

//             var result = await controller.Create(tagMechanismReactionList) ;

//             var getResult = await controller.Get(result);

//             Assert.AreEqual(result, getResult.uuid);
//         }

//         [TestMethod]
//         public async Task Updates_tagmechanismreactionlist()
//         {
//             var controller = new TagMechanismReactionListController(db);

//             var tagMechanismReactionList = new TagMechanismReactionList
//             {
//                 tag_mechanism_uuid = new Guid("02114e61-a4a6-48c0-9f99-3de4d20ab750"),
//                 reaction_uuid = new Guid("367f4b94-14f5-404e-86ee-1d5f799edcd7"),
//                 version = "1.0",
//                 isDel = false
//             };

//             var result = await controller.Create(tagMechanismReactionList);

//             var getResult = await controller.Get(result);

//             getResult.version = "Edited";

//             await controller.Put(getResult);

//             var getEditedResult = await controller.Get(result);

//             await controller.Delete(result);

//             Assert.AreEqual(getEditedResult.version, "Edited");
//         }
//     }
// }
