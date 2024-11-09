// using Chemistry_Cafe_API.Controllers;
// using Chemistry_Cafe_API.Models;
// using Microsoft.VisualStudio.TestTools.UnitTesting;
// using MySqlConnector;

// namespace Chemistry_Cafe_API.Tests
// {
//     [TestClass]
//     public class PropertyTypeControllerTests
//     {
//         PropertyTypeController controller = new PropertyTypeController(DBConnection.DataSource);

//         [TestMethod]
//         public async Task Get_retrieves_propertytype()
//         {
//             var result = await controller.Get() as List<PropertyType>;

//             Assert.IsNotNull(result);
//         }

//         [TestMethod]
//         public async Task Creates_propertytype()
//         {
//             var propertyType = new PropertyType
//             {
//                 name = "Test",
//                 units = "mols",
//                 validation = "yes?",
//                 isDel = false
//             };

//             var result = await controller.Create(propertyType);

//             var getResult = await controller.Get(result);

//             Assert.AreEqual(result, getResult.uuid);
//         }

//         [TestMethod]
//         public async Task Updates_propertytype()
//         {
//             var propertyType = new PropertyType
//             {
//                 name = "Test",
//                 units = "mols",
//                 validation = "yes?",
//                 isDel = false
//             };

//             var result = await controller.Create(propertyType);

//             var getResult = await controller.Get(result);

//             getResult.name = "Edited";

//             await controller.Put(getResult);

//             var getEditedResult = await controller.Get(result);

//             await controller.Delete(result);

//             Assert.AreEqual(getEditedResult.name, "Edited");
//         }
//     }
// }
