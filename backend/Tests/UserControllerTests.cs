// using Chemistry_Cafe_API.Controllers;
// using Chemistry_Cafe_API.Models;
// using Microsoft.VisualStudio.TestTools.UnitTesting;
// using MySqlConnector;

// namespace Chemistry_Cafe_API.Tests
// {
//     [TestClass]
//     public class UserControllerTests
//     {
//         readonly MySqlDataSource db = DBConnection.DataSource;
        
//         [TestMethod]
//         public async Task Get_retrieves_user()
//         {
//             var controller = new UserController(db);

//             var result = await controller.Get() as List<User>;

//             Assert.IsNotNull(result);
//         }

//         [TestMethod]
//         public async Task Creates_user()
//         {
//             var controller = new UserController(db);

//             var result = await controller.Create("Test") ;

//             var getResult = await controller.Get(result);
//             //TestContext.WriteLine(result);
//             Assert.AreEqual(result, getResult.uuid);
//         }

//         [TestMethod]
//         public async Task Updates_user()
//         {
//             var controller = new UserController(db);

//             var result = await controller.Create("Test");

//             var getResult = await controller.Get(result);

//             getResult.log_in_info = "Edited";

//             await controller.Put(getResult);

//             var getEditedResult = await controller.Get(result);

//             await controller.Delete(result);

//             Assert.AreEqual(getEditedResult.log_in_info, "Edited");
//         }
//     }
// }
