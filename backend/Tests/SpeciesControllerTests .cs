// using Chemistry_Cafe_API.Controllers;
// using Chemistry_Cafe_API.Models;
// using Microsoft.VisualStudio.TestTools.UnitTesting;
// using MySqlConnector;

// namespace Chemistry_Cafe_API.Tests
// {
//     [TestClass]
//     public class SpeciesControllerTests
//     {
//         readonly MySqlDataSource db = DBConnection.DataSource;
        
//         [TestMethod]
//         public async Task Get_retrieves_species()
//         {
//             var controller = new SpeciesController(db);

//             var result = await controller.Get() as List<Species>;

//             Assert.IsNotNull(result);
//         }

//         [TestMethod]
//         public async Task Creates_species()
//         {
//             var controller = new SpeciesController(db);

//             var result = await controller.Create("Test") ;

//             var getResult = await controller.Get(result);

//             Assert.AreEqual(result, getResult.uuid);
//         }

//         [TestMethod]
//         public async Task Updates_species()
//         {
//             var controller = new SpeciesController(db);

//             var result = await controller.Create("Test");

//             var getResult = await controller.Get(result);

//             getResult.type = "Edited";

//             await controller.Put(getResult);

//             var getEditedResult = await controller.Get(result);

//             await controller.Delete(result);

//             Assert.AreEqual(getEditedResult.type, "Edited");
//         }
//     }
// }
