// using Chemistry_Cafe_API.Controllers;
// using Chemistry_Cafe_API.Models;
// using Microsoft.VisualStudio.TestTools.UnitTesting;
// using MySqlConnector;

// namespace Chemistry_Cafe_API.Tests
// {
//     [TestClass]
//     public class UserPreferencesControllerTests
//     {
//         UserPreferencesController controller = new UserPreferencesController(DBConnection.DataSource);

//         [TestMethod]
//         public async Task Get_retrieves_userpreferences()
//         {
//             var result = await controller.Get() as List<UserPreferences>;

//             Assert.IsNotNull(result);
//         }

//         [TestMethod]
//         public async Task Creates_userpreferences()
//         {
//             var userPreferences = new UserPreferences
//             {
//                 user_uuid = new Guid("070465a1-5f3e-42eb-9373-fed864a75cf5"),
//                 preferences = "New Preference",
//                 isDel = false
//             };

//             var result = await controller.Create(userPreferences);

//             var getResult = await controller.Get(result);

//             Assert.AreEqual(result, getResult.uuid);
//         }

//         [TestMethod]
//         public async Task Updates_userpreferences()
//         {
//             var userPreferences = new UserPreferences
//             {
//                 user_uuid = new Guid("070465a1-5f3e-42eb-9373-fed864a75cf5"),
//                 preferences = "New Preference"
//             };

//             var result = await controller.Create(userPreferences);

//             var getResult = await controller.Get(result);

//             getResult.preferences = "Edited";

//             await controller.Put(getResult);

//             var getEditedResult = await controller.Get(result);

//             await controller.Delete(result);

//             Assert.AreEqual(getEditedResult.preferences, "Edited");
//         }
//     }
// }
