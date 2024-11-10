// using Chemistry_Cafe_API.Controllers;
// using Chemistry_Cafe_API.Models;
// using Microsoft.VisualStudio.TestTools.UnitTesting;
// using MySqlConnector;

// namespace Chemistry_Cafe_API.Tests
// {
//     [TestClass]
//     public class ReactantProductListControllerTests
//     {
//         ReactantProductListController controller = new ReactantProductListController(DBConnection.DataSource);

//         [TestMethod]
//         public async Task Get_retrieves_ReactantProductList()
//         {
//             var result = await controller.Get() as List<ReactantProductList>;

//             Assert.IsNotNull(result);
//         }

//         [TestMethod]
//         public async Task Creates_ReactantProductList()
//         {
//             var reactantProductList = new ReactantProductList
//             {
//                 reactant_product_uuid = new Guid("acc17b0a-1ddc-4ef9-a709-86cc4900dbe9"),
//                 reaction_uuid = new Guid("03ebb1a8-8af5-4523-a3aa-934e01d466e5"),
//                 species_uuid = new Guid("37c947f1-f394-40fa-a8f3-64b8f08c10c9"),
//                 quantity = 1
//             };

//             await controller.Create(reactantProductList);

//             var getResult = await controller.Get(new Guid("acc17b0a-1ddc-4ef9-a709-86cc4900dbe9"));

//             Assert.AreEqual(new Guid("acc17b0a-1ddc-4ef9-a709-86cc4900dbe9"), getResult.reactant_product_uuid);
//         }

//         [TestMethod]
//         public async Task Updates_ReactantProductList()
//         {
//             var reactantProductList = new ReactantProductList
//             {
//                 reactant_product_uuid = new Guid("acc17b0a-1ddc-4ef9-a709-86cc4900dbe9"),
//                 reaction_uuid = new Guid("03ebb1a8-8af5-4523-a3aa-934e01d466e5"),
//                 species_uuid = new Guid("37c947f1-f394-40fa-a8f3-64b8f08c10c9"),
//                 quantity = 1
//             };

//             await controller.Create(reactantProductList);

//             var getResult = await controller.Get(new Guid("acc17b0a-1ddc-4ef9-a709-86cc4900dbe9"));

//             getResult.quantity = 40;

//             await controller.Put(getResult);

//             var getEditedResult = await controller.Get(new Guid("acc17b0a-1ddc-4ef9-a709-86cc4900dbe9"));

//             var delete = new DeleteReactantProductList
//             {
//                 reactant_product_uuid = new Guid("acc17b0a-1ddc-4ef9-a709-86cc4900dbe9"),
//                 species_uuid = new Guid("37c947f1-f394-40fa-a8f3-64b8f08c10c9")
//             }; 

//             await controller.Delete(delete);

//             Assert.IsNotNull(getEditedResult);
//         }
//     }
// }
