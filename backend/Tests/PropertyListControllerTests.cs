// using Chemistry_Cafe_API.Controllers;
// using Chemistry_Cafe_API.Models;
// using Microsoft.VisualStudio.TestTools.UnitTesting;
// using MySqlConnector;

// namespace Chemistry_Cafe_API.Tests
// {
//     [TestClass]
//     public class PropertyListControllerTests
//     {
//         PropertyListController controller = new PropertyListController(DBConnection.DataSource);

//         [TestMethod]
//         public async Task Get_retrieves_propertylist()
//         {
//             var result = await controller.Get() as List<PropertyList>;

//             Assert.IsNotNull(result);
//         }

//         [TestMethod]
//         public async Task Creates_propertylist()
//         {
//             var propertyList = new PropertyList
//             {
//                 parent_uuid = new Guid("729ced40-8b18-47d6-8d1c-d17f42890871"),
//                 version = "1.0",
//                 isDel = false
//             };

//             var result = await controller.Create(propertyList);

//             var getResult = await controller.Get(result);

//             Assert.AreEqual(result, getResult.uuid);
//         }

//         [TestMethod]
//         public async Task Updates_propertylist()
//         {
//             var propertyList = new PropertyList
//             {
//                 parent_uuid = new Guid("68722c5e-4f0f-44aa-a614-64133df0f9b7"),
//                 version = "1.0",
//                 isDel = false
//             };

//             var result = await controller.Create(propertyList);

//             var getResult = await controller.Get(result);

//             getResult.version = "Edited";

//             await controller.Put(getResult);

//             var getEditedResult = await controller.Get(result);

//             await controller.Delete(result);

//             Assert.AreEqual(getEditedResult.version, "Edited");
//         }
//     }
// }
